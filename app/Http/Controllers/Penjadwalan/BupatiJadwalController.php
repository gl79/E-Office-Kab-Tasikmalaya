<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Jadwal\BupatiJadwalRequest;
use App\Http\Requests\Jadwal\CustomJadwalRequest;
use App\Models\SuratMasuk;
use App\Models\User;
use App\Models\WilayahKecamatan;
use App\Models\WilayahProvinsi;
use App\Services\Penjadwalan\PenjadwalanService;
use App\Support\CacheHelper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BupatiJadwalController extends Controller
{
    private const TASIKMALAYA_PROVINSI_KODE = '32';
    private const TASIKMALAYA_KABUPATEN_KODE = '06';

    public function __construct(private readonly PenjadwalanService $service) {}

    /**
     * Show scheduling form for Bupati or delegated finalizer.
     */
    public function form(Request $request, SuratMasuk $surat): Response
    {
        $surat->load(['tujuans', 'penjadwalan', 'indeksBerkas', 'kodeKlasifikasi', 'staffPengolah', 'jenisSurat']);

        $user = $request->user();
        $canScheduleByBupati = Gate::forUser($user)->check('scheduleByBupati', $surat);
        $canFinalizeDelegated = Gate::forUser($user)->check('finalizeDelegatedJadwal', $surat);

        abort_unless($canScheduleByBupati || $canFinalizeDelegated, 403);

        $bupati = $this->service->resolveBupatiUser();
        $existing = $surat->penjadwalan?->load('dihadiriOlehUser');
        $tujuanForUser = $surat->tujuans->firstWhere('tujuan_id', $user?->id);
        $displayNomorAgenda = $tujuanForUser?->nomor_agenda ?: $surat->nomor_agenda;

        return Inertia::render('Penjadwalan/Bupati/Form', [
            'surat' => [
                'id' => $surat->id,
                'nomor_agenda' => $displayNomorAgenda,
                'nomor_surat' => $surat->nomor_surat,
                'tanggal_surat' => $surat->tanggal_surat?->format('Y-m-d'),
                'tanggal_surat_formatted' => $surat->tanggal_surat_formatted,
                'asal_surat' => $surat->asal_surat,
                'jenis_surat' => $surat->jenisSurat?->nama,
                'sifat' => $surat->sifat,
                'lampiran' => $surat->lampiran,
                'perihal' => $surat->perihal,
                'isi_ringkas' => $surat->isi_ringkas,
                'tujuan_list' => $surat->tujuan_list,
                'tanggal_diterima' => $surat->tanggal_diterima?->format('Y-m-d'),
                'indeks_berkas' => $surat->indeksBerkas
                    ? $surat->indeksBerkas->kode . ' - ' . $surat->indeksBerkas->nama
                    : null,
                'kode_klasifikasi' => $surat->kodeKlasifikasi
                    ? $surat->kodeKlasifikasi->kode . ' - ' . $surat->kodeKlasifikasi->nama
                    : null,
                'staff_pengolah' => $surat->staffPengolah?->name,
                'tanggal_diteruskan' => $surat->tanggal_diteruskan?->format('Y-m-d'),
            ],
            'existingJadwal' => $existing ? [
                'id' => $existing->id,
                'tanggal_agenda' => $existing->tanggal_agenda?->format('Y-m-d'),
                'waktu_mulai' => $this->trimTime($existing->waktu_mulai),
                'waktu_selesai' => $existing->waktu_selesai ? $this->trimTime($existing->waktu_selesai) : null,
                'sampai_selesai' => (bool) $existing->sampai_selesai,
                'lokasi_type' => $existing->lokasi_type,
                'kode_wilayah' => $existing->kode_wilayah,
                'tempat' => $existing->tempat,
                'keterangan' => $existing->keterangan,
                'dihadiri_oleh_user_id' => $existing->dihadiri_oleh_user_id,
            ] : null,
            'context' => [
                'can_schedule_by_bupati' => $canScheduleByBupati,
                'can_finalize_delegated' => $canFinalizeDelegated,
                'default_dihadiri_oleh_user_id' => $existing?->dihadiri_oleh_user_id
                    ?? $bupati?->id
                    ?? $user?->id,
                'schedule_type' => $request->query('type', $existing?->sumber_jadwal ?? 'disposisi'),
            ],
            'users' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember(
                'bupati_jadwal_user_options',
                60,
                fn() => User::query()
                    ->select(['id', 'name', 'nip', 'jabatan', 'role'])
                    ->where('role', '!=', User::ROLE_SUPERADMIN)
                    ->orderByRaw("CASE
                        WHEN jabatan = 'Bupati' THEN 1
                        WHEN jabatan = 'Wakil Bupati' THEN 2
                        ELSE 3
                    END")
                    ->orderBy('name')
                    ->get()
            )),
            'provinsiOptions' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember(
                'bupati_jadwal_provinsi_options',
                60,
                fn() => WilayahProvinsi::query()
                    ->select(['kode', 'nama'])
                    ->orderBy('nama')
                    ->get()
            )),
            'kecamatanTasikmalayaOptions' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember(
                'bupati_jadwal_kecamatan_tasik',
                60,
                fn() => WilayahKecamatan::query()
                    ->select(['kode', 'nama'])
                    ->where('provinsi_kode', self::TASIKMALAYA_PROVINSI_KODE)
                    ->where('kabupaten_kode', self::TASIKMALAYA_KABUPATEN_KODE)
                    ->orderBy('nama')
                    ->get()
            )),
        ]);
    }

    /**
     * Initial scheduling by Bupati.
     */
    public function store(BupatiJadwalRequest $request, SuratMasuk $surat): RedirectResponse
    {
        $surat->load(['tujuans', 'penjadwalan']);
        $this->authorize('scheduleByBupati', $surat);

        if ($surat->penjadwalan) {
            return redirect()->back()->with('error', 'Surat ini sudah memiliki jadwal.');
        }

        $result = $this->service->createSchedule($surat, $request->validated(), $request->user());

        return $this->buildRedirectResponse($result);
    }

    /**
     * Reschedule / finalize delegated schedule using the same record.
     */
    public function update(BupatiJadwalRequest $request, SuratMasuk $surat): RedirectResponse
    {
        $surat->load(['tujuans', 'penjadwalan']);

        $user = $request->user();
        $canScheduleByBupati = Gate::forUser($user)->check('scheduleByBupati', $surat);
        $canFinalizeDelegated = Gate::forUser($user)->check('finalizeDelegatedJadwal', $surat);

        abort_unless($canScheduleByBupati || $canFinalizeDelegated, 403);

        $result = $this->service->updateSchedule($surat, $request->validated(), $user);

        return $this->buildRedirectResponse($result);
    }

    /**
     * Show the form for creating a custom schedule (not tied to surat masuk).
     */
    public function customForm(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->isBupati() || $user->isSuperAdmin(), 403);

        return Inertia::render('Penjadwalan/Bupati/CustomForm', [
            'provinsiOptions' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember(
                'bupati_jadwal_provinsi_options',
                60,
                fn() => WilayahProvinsi::query()
                    ->select(['kode', 'nama'])
                    ->orderBy('nama')
                    ->get()
            )),
            'kecamatanTasikmalayaOptions' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember(
                'bupati_jadwal_kecamatan_tasik',
                60,
                fn() => WilayahKecamatan::query()
                    ->select(['kode', 'nama'])
                    ->where('provinsi_kode', self::TASIKMALAYA_PROVINSI_KODE)
                    ->where('kabupaten_kode', self::TASIKMALAYA_KABUPATEN_KODE)
                    ->orderBy('nama')
                    ->get()
            )),
        ]);
    }

    /**
     * Store a custom schedule (langsung definitif, tanpa surat masuk).
     */
    public function storeCustom(CustomJadwalRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isBupati() || $user->isSuperAdmin(), 403);

        $result = $this->service->createCustomSchedule($request->validated(), $request->user());

        if (!$result['success']) {
            return redirect()->back()->with('error', $result['message']);
        }

        $response = redirect()
            ->route('penjadwalan.definitif.index')
            ->with('success', $result['message']);

        if ($result['has_conflict']) {
            $response->with(
                'warning',
                "Jadwal tersimpan dengan peringatan: ditemukan {$result['conflict_count']} konflik waktu pada tanggal yang sama."
            );
        }

        return $response;
    }

    /**
     * Build redirect response from service result.
     */
    private function buildRedirectResponse(array $result): RedirectResponse
    {
        if (!$result['success']) {
            return redirect()->back()->with('error', $result['message']);
        }

        $response = redirect()
            ->route('persuratan.surat-masuk.index')
            ->with('success', $result['message'])
            ->with('has_conflict', $result['has_conflict']);

        if ($result['has_conflict']) {
            $response->with(
                'warning',
                "Jadwal tersimpan dengan peringatan: ditemukan {$result['conflict_count']} konflik waktu pada tanggal yang sama."
            );
        }

        return $response;
    }

    private function trimTime(string $time): string
    {
        return strlen($time) >= 5 ? substr($time, 0, 5) : $time;
    }
}
