<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\IndeksSurat;
use App\Models\JenisSurat;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\UnitKerja;
use App\Models\User;
use App\Models\WilayahDesa;
use App\Models\WilayahKabupaten;
use App\Models\WilayahKecamatan;
use App\Models\WilayahProvinsi;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with cached statistics.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'stats' => Inertia::defer(function () use ($user) {
                $cacheKey = 'dashboard_stats_' . $user->id;

                return \App\Support\CacheHelper::tags(['dashboard_metrics'])->remember($cacheKey, 60, function () use ($user) {
                    return $this->calculateStats($user);
                });
            }),
        ]);
    }

    /**
     * Calculate dashboard statistics based on user role.
     */
    protected function calculateStats(User $user): array
    {
        // 1. Surat Masuk Hari Ini
        /** @var \Illuminate\Database\Eloquent\Builder $suratMasukHariIni */
        $suratMasukHariIni = SuratMasuk::query()->whereDate('created_at', '=', now()->toDateString());
        if (!$user->isSuperAdmin() && !$user->isTU()) {
            $suratMasukHariIni->whereHas('tujuans', function ($q) use ($user) {
                $q->where('tujuan_id', $user->id);
            });
        }
        $countSuratMasukHariIni = $suratMasukHariIni->count('*');

        // 2. Menunggu Tindak Lanjut
        /** @var \Illuminate\Database\Eloquent\Builder $menungguTindakLanjut */
        $menungguTindakLanjut = SuratMasuk::query()
            ->where('status_tindak_lanjut', '<>', SuratMasuk::STATUS_TINDAK_LANJUT_SELESAI, 'and');
        if (!$user->isSuperAdmin() && !$user->isTU()) {
            $menungguTindakLanjut->whereHas('tujuans', function ($q) use ($user) {
                $q->where('tujuan_id', $user->id);
            });
        }
        $countMenungguTindakLanjut = $menungguTindakLanjut->count('*');

        // 3. Agenda Hari Ini (Hanya definitif)
        /** @var \Illuminate\Database\Eloquent\Builder $agendaHariIni */
        $agendaHariIni = Penjadwalan::query()->definitif()->whereDate('tanggal_agenda', '=', now()->toDateString());
        if (!$user->isSuperAdmin() && !$user->isTU()) {
            $this->applyUserAgendaScope($agendaHariIni, $user);
        }
        $countAgendaHariIni = $agendaHariIni->count('*');

        // 4. Agenda Mendatang (Hanya definitif)
        /** @var \Illuminate\Database\Eloquent\Builder $agendaMendatang */
        $agendaMendatang = Penjadwalan::query()->definitif()->whereDate('tanggal_agenda', '>', now()->toDateString(), 'and');
        if (!$user->isSuperAdmin() && !$user->isTU()) {
            $this->applyUserAgendaScope($agendaMendatang, $user);
        }
        $countAgendaMendatang = $agendaMendatang->count('*');

        $stats = [
            'metrics' => [
                'surat_masuk_hari_ini' => $countSuratMasukHariIni,
                'menunggu_tindak_lanjut' => $countMenungguTindakLanjut,
                'agenda_hari_ini' => $countAgendaHariIni,
                'agenda_mendatang' => $countAgendaMendatang,
            ]
        ];

        // Admin/TU get full stats
        if ($user->isSuperAdmin() || $user->isTU()) {
            $stats['wilayah'] = [
                'provinsi' => WilayahProvinsi::query()->count('*'),
                'kabupaten' => WilayahKabupaten::query()->count('*'),
                'kecamatan' => WilayahKecamatan::query()->count('*'),
                'desa' => WilayahDesa::query()->count('*'),
            ];
            $stats['master'] = [
                'pengguna' => User::query()->count('*'),
                'unit_kerja' => UnitKerja::query()->count('*'),
                'indeks_surat' => IndeksSurat::query()->count('*'),
                'jenis_surat' => JenisSurat::query()->count('*'),
            ];
        }

        return $stats;
    }

    private function applyUserAgendaScope(Builder $query, User $user): void
    {
        $query->where(function ($q) use ($user) {
            $q->where('dihadiri_oleh_user_id', $user->id)
                ->orWhereHas('suratMasuk.disposisis', function ($dq) use ($user) {
                    $dq->where('dari_user_id', $user->id)
                        ->orWhere('ke_user_id', $user->id);
                })
                ->orWhereHas('suratMasuk', function ($smq) use ($user) {
                    $smq->where('created_by', $user->id)
                        ->orWhereHas('tujuans', function ($tujuanQuery) use ($user) {
                            $tujuanQuery->where('tujuan_id', $user->id);
                        });
                });
        });
    }

    /**
     * Get Map markers data for Bupati dashboard.
     */
    public function mapMarkers(Request $request)
    {
        $user = $request->user();

        // Hanya level Bupati/Wakil/Sekda atau Administrator yang bisa mengakses
        if (!$user->isSuperAdmin() && (!$user->isPejabat() || !in_array($user->getJabatanLevel(), [1, 2, 3], true))) {
            return response()->json([]);
        }

        // Filter by date if provided
        $dateFilter = $request->query('date');

        $cacheKey = 'dashboard_map_markers_' . ($dateFilter ?: 'all');

        $markers = \App\Support\CacheHelper::tags(['penjadwalan'])->remember($cacheKey, 300, function () use ($dateFilter) {
            $query = Penjadwalan::definitif()
                ->whereNotNull('kode_wilayah')
                ->with(['suratMasuk', 'dihadiriOlehUser', 'creator']);

            if ($dateFilter) {
                $query->whereDate('tanggal_agenda', '=', $dateFilter);
            } else {
                // Hapus yang lewat (past), hanya tampilkan hari ini dan yang akan datang
                $query->whereDate('tanggal_agenda', '>=', now()->toDateString());
            }

            $penjadwalans = $query->get();
            $wilayahCodes = $penjadwalans->pluck('kode_wilayah')->filter()->unique();

            $locationData = [];
            $desaCodes = [];
            $kecamatanCodes = [];

            foreach ($wilayahCodes as $code) {
                if (str_contains($code, '.')) {
                    $parts = explode('.', $code);
                    // Hanya izinkan Kabupaten Tasikmalaya (32.06)
                    if (count($parts) >= 3 && $parts[0] === '32' && $parts[1] === '06') {
                        if (count($parts) === 4 && $parts[3] !== '') {
                            $desaCodes[] = $parts;
                        } else {
                            // Jika desa kosong atau format hanya 3 part, fallback ke kecamatan
                            $kecamatanCodes[] = $parts;
                        }
                    }
                }
            }

            // Fetch data Desa
            if (!empty($desaCodes)) {
                $queryDesa = WilayahDesa::query();
                foreach ($desaCodes as $idx => $parts) {
                    $qFunc = function ($q) use ($parts) {
                        $q->where('provinsi_kode', $parts[0])
                            ->where('kabupaten_kode', $parts[1])
                            ->where('kecamatan_kode', $parts[2])
                            ->where('kode', $parts[3]);
                    };
                    if ($idx === 0) {
                        $queryDesa->where($qFunc);
                    } else {
                        $queryDesa->orWhere($qFunc);
                    }
                }
                $desas = $queryDesa->get(['provinsi_kode', 'kabupaten_kode', 'kecamatan_kode', 'kode', 'latitude', 'longitude']);
                foreach ($desas as $desa) {
                    if ($desa->latitude && $desa->longitude) {
                        $code = "{$desa->provinsi_kode}.{$desa->kabupaten_kode}.{$desa->kecamatan_kode}.{$desa->kode}";
                        $locationData[$code] = [
                            'lat' => (float) $desa->latitude,
                            'lng' => (float) $desa->longitude,
                        ];
                    }
                }
            }

            // Fetch data Kecamatan sebagai fallback
            if (!empty($kecamatanCodes)) {
                $queryKecamatan = WilayahKecamatan::query();
                foreach ($kecamatanCodes as $idx => $parts) {
                    $qFunc = function ($q) use ($parts) {
                        $q->where('provinsi_kode', $parts[0])
                            ->where('kabupaten_kode', $parts[1])
                            ->where('kode', $parts[2]);
                    };
                    if ($idx === 0) {
                        $queryKecamatan->where($qFunc);
                    } else {
                        $queryKecamatan->orWhere($qFunc);
                    }
                }
                $kecamatans = $queryKecamatan->get(['provinsi_kode', 'kabupaten_kode', 'kode', 'latitude', 'longitude']);
                foreach ($kecamatans as $kecamatan) {
                    if ($kecamatan->latitude && $kecamatan->longitude) {
                        // Handle format dengan atau tanpa titik di akhir
                        $kode3 = "{$kecamatan->provinsi_kode}.{$kecamatan->kabupaten_kode}.{$kecamatan->kode}";
                        $kode4 = "{$kode3}.";
                        $data = [
                            'lat' => (float) $kecamatan->latitude,
                            'lng' => (float) $kecamatan->longitude,
                        ];
                        $locationData[$kode3] = $data;
                        $locationData[$kode4] = $data;
                    }
                }
            }

            return $penjadwalans->map(function ($jadwal) use ($locationData) {
                if (!isset($locationData[$jadwal->kode_wilayah])) {
                    return null;
                }

                // Status visual
                $tgl = $jadwal->tanggal_agenda;
                $markerStatus = 'today';
                if ($tgl) {
                    if ($tgl->isPast() && !$tgl->isToday()) {
                        $markerStatus = 'past'; // Ini mungkin tidak akan terbaca karena difilter, tapi disisakan untuk safety code
                    } elseif ($tgl->isFuture() && !$tgl->isToday()) {
                        $markerStatus = 'future';
                    }
                }

                // Format Waktu
                $waktuLengkap = '-';
                if ($jadwal->waktu_mulai) {
                    $waktuLengkap = substr($jadwal->waktu_mulai, 0, 5) . ' WIB - ';
                    if ($jadwal->sampai_selesai) {
                        $waktuLengkap .= 'Selesai';
                    } elseif ($jadwal->waktu_selesai) {
                        $waktuLengkap .= substr($jadwal->waktu_selesai, 0, 5) . ' WIB';
                    } else {
                        $waktuLengkap .= 'Selesai';
                    }
                }

                return [
                    'id' => $jadwal->id,
                    'title' => $jadwal->nama_kegiatan ?? 'Tanpa Judul',
                    'date' => $jadwal->tanggal_format_indonesia,
                    'waktu' => $waktuLengkap,
                    'tempat' => $jadwal->tempat ?? '-',
                    'wilayah_text' => \App\Support\WilayahHelper::getWilayahText($jadwal->kode_wilayah),
                    'isi_ringkas' => $jadwal->suratMasuk ? $jadwal->suratMasuk->isi_ringkas : null,
                    'dihadiri_oleh' => $jadwal->dihadiri_oleh,
                    'lat' => $locationData[$jadwal->kode_wilayah]['lat'],
                    'lng' => $locationData[$jadwal->kode_wilayah]['lng'],
                    'status' => $jadwal->status_formal_label ?? $jadwal->status,
                    'marker_status' => $markerStatus,
                ];
            })->filter()->values();
        });

        return response()->json($markers);
    }
}
