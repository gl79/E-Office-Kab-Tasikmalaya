<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\DisposisiSurat;
use App\Models\IndeksSurat;
use App\Models\JadwalHistory;
use App\Models\JenisSurat;
use App\Models\Penjadwalan;
use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use App\Models\UnitKerja;
use App\Models\User;
use App\Models\WilayahDesa;
use App\Models\WilayahKabupaten;
use App\Models\WilayahKecamatan;
use App\Models\WilayahProvinsi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        $stats = null;
        $today = now()->startOfDay();

        // 1. Surat Masuk Hari Ini
        $suratMasukHariIni = SuratMasuk::whereDate('created_at', now()->toDateString());
        if (!$user->isSuperAdmin() && !$user->isTU()) {
            $suratMasukHariIni->whereHas('tujuans', function ($q) use ($user) {
                $q->where('tujuan_id', $user->id);
            });
        }
        $countSuratMasukHariIni = $suratMasukHariIni->count();

        // 2. Menunggu Tindak Lanjut
        $menungguTindakLanjut = SuratMasuk::query()->where('status', '<>', SuratMasuk::STATUS_SELESAI);
        if (!$user->isSuperAdmin() && !$user->isTU()) {
            $menungguTindakLanjut->whereHas('tujuans', function ($q) use ($user) {
                $q->where('tujuan_id', $user->id)
                    ->where('status_penerimaan', '!=', \App\Models\SuratMasukTujuan::STATUS_DITERIMA);
            });
        }
        $countMenungguTindakLanjut = $menungguTindakLanjut->count();

        // 3. Agenda Hari Ini (Hanya definitif)
        $agendaHariIni = Penjadwalan::query()->definitif()->whereDate('tanggal_agenda', now()->toDateString());
        if (!$user->canMonitorAllSchedules()) {
            $agendaHariIni->where(function ($q) use ($user) {
                $q->where('dihadiri_oleh_user_id', $user->id)
                    ->orWhereHas('suratMasuk.disposisis', function ($dq) use ($user) {
                        $dq->where('dari_user_id', $user->id)
                            ->orWhere('ke_user_id', $user->id);
                    })
                    ->orWhereHas('suratMasuk', function ($smq) use ($user) {
                        $smq->where('created_by', $user->id);
                    });
            });
        }
        $countAgendaHariIni = $agendaHariIni->count();

        // 4. Agenda Mendatang (Hanya definitif)
        $agendaMendatang = Penjadwalan::query()->definitif()->whereDate('tanggal_agenda', '>', now()->toDateString());
        if (!$user->canMonitorAllSchedules()) {
            $agendaMendatang->where(function ($q) use ($user) {
                $q->where('dihadiri_oleh_user_id', $user->id)
                    ->orWhereHas('suratMasuk.disposisis', function ($dq) use ($user) {
                        $dq->where('dari_user_id', $user->id)
                            ->orWhere('ke_user_id', $user->id);
                    })
                    ->orWhereHas('suratMasuk', function ($smq) use ($user) {
                        $smq->where('created_by', $user->id);
                    });
            });
        }
        $countAgendaMendatang = $agendaMendatang->count();

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
                'provinsi' => WilayahProvinsi::query()->count(),
                'kabupaten' => WilayahKabupaten::query()->count(),
                'kecamatan' => WilayahKecamatan::query()->count(),
                'desa' => WilayahDesa::query()->count(),
            ];
            $stats['master'] = [
                'pengguna' => User::query()->count(),
                'unit_kerja' => UnitKerja::query()->count(),
                'indeks_surat' => IndeksSurat::query()->count(),
                'jenis_surat' => JenisSurat::query()->count(),
            ];
        }

        return $stats;
    }
}
