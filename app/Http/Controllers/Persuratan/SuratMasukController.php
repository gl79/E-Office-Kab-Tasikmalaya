<?php

namespace App\Http\Controllers\Persuratan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Persuratan\SuratMasukRequest;
use App\Models\DisposisiSurat;
use App\Models\IndeksSurat;
use App\Models\JenisSurat;
use App\Models\Penjadwalan;
use App\Models\SifatSurat;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use App\Services\Persuratan\SuratMasukService;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SuratMasukController extends Controller
{
    public function __construct(private readonly SuratMasukService $service) {}

    /**
     * Get user options for tujuan select, ordered by priority.
     */
    private function getUserOptions(): \Illuminate\Database\Eloquent\Collection
    {
        return User::select(['id', 'name', 'nip', 'jabatan'])
            ->where('role', '!=', User::ROLE_SUPERADMIN)
            ->orderByRaw("CASE
                WHEN name = 'Tata Usaha' THEN 1
                WHEN name = 'Bupati' THEN 2
                WHEN name = 'Wakil Bupati' THEN 3
                WHEN name = 'Sekda' THEN 4
                WHEN name = 'Asda 1' THEN 5
                WHEN name = 'Asda 2' THEN 6
                WHEN name = 'Asda 3' THEN 7
                ELSE 8
            END")
            ->get();
    }

    /**
     * Get user options for staff pengolah (include current user).
     */
    private function getStaffPengolahOptions(): \Illuminate\Database\Eloquent\Collection
    {
        return User::select(['id', 'name', 'nip', 'jabatan'])
            ->where('role', '!=', User::ROLE_SUPERADMIN)
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Get pengguna options untuk asal surat dropdown.
     */
    private function getAsalSuratUsers(): \Illuminate\Database\Eloquent\Collection
    {
        return User::select(['id', 'name', 'nip', 'jabatan'])
            ->where('role', '!=', User::ROLE_SUPERADMIN)
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', SuratMasuk::class);

        $user = $request->user();

        return Inertia::render('Persuratan/SuratMasuk/Index', [
            'suratMasuk' => Inertia::defer(fn() => CacheHelper::tags(['persuratan_list'])->remember('surat_masuk_list_' . $user->id, 60, function () use ($user) {
                $query = SuratMasuk::query()
                    ->with(['tujuans.user', 'indeksBerkas', 'kodeKlasifikasi', 'staffPengolah', 'createdBy', 'jenisSurat', 'penjadwalan'])
                    ->latest();

                // SuperAdmin sees all
                // TU sees: surat they created manually OR surat addressed to them (excluding auto-created from Surat Keluar)
                // Others only see surat addressed to them
                if (!$user->isSuperAdmin()) {
                    if ($user->isTU()) {
                        $query->where(function ($q) use ($user) {
                            // Surat addressed to TU
                            $q->whereIn('id', function ($subq) use ($user) {
                                $subq->select('surat_masuk_id')
                                    ->from('surat_masuk_tujuans')
                                    ->where('tujuan_id', $user->id);
                            })
                                // OR surat created by TU (excluding auto-created from Surat Keluar)
                                ->orWhere(function ($subq) use ($user) {
                                    $subq->where('created_by', $user->id)
                                        // Exclude auto-created: check if nomor_surat exists in surat_keluars with same created_by
                                        ->whereNotExists(function ($existsQuery) use ($user) {
                                            $existsQuery->select(DB::raw(1))
                                                ->from('surat_keluars')
                                                ->whereColumn('surat_keluars.nomor_surat', 'surat_masuks.nomor_surat')
                                                ->where('surat_keluars.created_by', $user->id)
                                                ->whereNull('surat_keluars.deleted_at');
                                        });
                                });
                        });
                    } else {
                        // Regular users only see surat addressed to them
                        $query->whereIn('id', function ($q) use ($user) {
                            $q->select('surat_masuk_id')
                                ->from('surat_masuk_tujuans')
                                ->where('tujuan_id', $user->id);
                        });
                    }
                }

                // Resolve nomor_agenda per-user:
                // Jika user adalah penerima, gunakan nomor_agenda dari tujuan record
                return $query->get()->map(function (SuratMasuk $surat) use ($user) {
                    $tujuan = $surat->tujuans->firstWhere('tujuan_id', $user->id);
                    if ($tujuan && $tujuan->nomor_agenda) {
                        $surat->nomor_agenda = $tujuan->nomor_agenda;
                    }

                    $isPimpinanRecipient = (bool) $tujuan
                        && $user->isPimpinan()
                        && ($user->isBupati() || $user->isWakilBupati());
                    $isBupatiRecipient = $isPimpinanRecipient && $user->isBupati();
                    $isAcceptedByCurrentUser = $tujuan?->status_penerimaan === SuratMasukTujuan::STATUS_DITERIMA;

                    $canScheduleByBupati = Gate::forUser($user)->check('scheduleByBupati', $surat);
                    $hasSchedule = (bool) $surat->penjadwalan;

                    $surat->penerimaan_status = $this->resolvePenerimaanStatusForDisplay($surat, $tujuan);
                    $surat->penerimaan_diterima_at = $tujuan?->diterima_at?->toDateTimeString();
                    $surat->can_accept = $isPimpinanRecipient && !$isAcceptedByCurrentUser;
                    $surat->can_disposisi = Gate::forUser($user)->check('disposisiByBupati', $surat);
                    $surat->can_disposisi_disabled = $isBupatiRecipient && !$isAcceptedByCurrentUser;

                    // Satu surat hanya bisa dijadwalkan sekali (khusus Bupati).
                    $surat->can_schedule = $canScheduleByBupati && !$hasSchedule;
                    $surat->can_finalize_schedule = false;
                    $surat->can_view_schedule = $hasSchedule
                        && $canScheduleByBupati;
                    $surat->penjadwalan_status = $this->resolvePenjadwalanStatusKey($surat->penjadwalan);
                    $surat->penjadwalan_status_label = $this->resolvePenjadwalanStatusLabel($surat->penjadwalan);
                    $surat->penjadwalan_status_variant = $this->resolvePenjadwalanStatusVariant($surat->penjadwalan);

                    return $surat;
                });
            })),
            'sifatOptions' => SifatSurat::getOptions(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', SuratMasuk::class);

        return Inertia::render('Persuratan/SuratMasuk/Create', [
            'indeksBerkasOptions' => IndeksSurat::whereIn('level', [1, 2])->orderBy('kode', 'asc')->get(['id', 'kode', 'nama', 'level', 'parent_id']),
            'indeksKlasifikasiOptions' => IndeksSurat::where('level', '>', 2)->orderBy('kode', 'asc')->get(['id', 'kode', 'nama', 'level', 'parent_id']),
            'jenisSuratOptions' => JenisSurat::orderBy('nama', 'asc')->get(['id', 'nama']),
            'users' => $this->getUserOptions(),
            'staffPengolahUsers' => $this->getStaffPengolahOptions(),
            'asalSuratUsers' => $this->getAsalSuratUsers(),
            'sifatOptions' => SifatSurat::getOptions(),
            'nextNomorAgenda' => SuratMasuk::generateNomorAgenda((string) Auth::id()),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SuratMasukRequest $request)
    {
        $this->authorize('create', SuratMasuk::class);

        try {
            $data = $request->validated();
            if ($request->hasFile('file')) {
                $data['file'] = $request->file('file');
            }

            $this->service->store($data);

            return redirect()->route('persuratan.surat-masuk.index')
                ->with('success', 'Surat Masuk berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan surat masuk', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menyimpan surat masuk. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $suratMasuk = SuratMasuk::with(['tujuans'])->findOrFail($id);
        $this->authorize('update', $suratMasuk);

        return Inertia::render('Persuratan/SuratMasuk/Edit', [
            'suratMasuk' => $suratMasuk,
            'jenisSuratOptions' => JenisSurat::orderBy('nama', 'asc')->get(['id', 'nama']),
            'indeksBerkasOptions' => IndeksSurat::whereIn('level', [1, 2])->orderBy('kode', 'asc')->get(['id', 'kode', 'nama', 'level', 'parent_id']),
            'indeksKlasifikasiOptions' => IndeksSurat::where('level', '>', 2)->orderBy('kode', 'asc')->get(['id', 'kode', 'nama', 'level', 'parent_id']),
            'users' => $this->getUserOptions(),
            'staffPengolahUsers' => $this->getStaffPengolahOptions(),
            'asalSuratUsers' => $this->getAsalSuratUsers(),
            'sifatOptions' => SifatSurat::getOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SuratMasukRequest $request, string $id)
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $this->authorize('update', $suratMasuk);

        try {
            $data = $request->validated();
            if ($request->hasFile('file')) {
                $data['file'] = $request->file('file');
            }

            $this->service->update($suratMasuk, $data);

            return redirect()->route('persuratan.surat-masuk.index')
                ->with('success', 'Surat Masuk berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Gagal memperbarui surat masuk', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui surat masuk. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Tandai surat sebagai diterima oleh penerima (Bupati/Wakil Bupati).
     */
    public function terima(Request $request, string $id)
    {
        $suratMasuk = SuratMasuk::with('tujuans')->findOrFail($id);
        $this->authorize('acceptByRecipient', $suratMasuk);

        $user = $request->user();
        $tujuan = $suratMasuk->tujuans->firstWhere('tujuan_id', $user->id);

        if (!$tujuan) {
            return redirect()->back()->with('error', 'Anda bukan penerima surat ini.');
        }

        if ($tujuan->status_penerimaan === SuratMasukTujuan::STATUS_DITERIMA) {
            return redirect()->back()->with('success', 'Surat ini sudah Anda terima sebelumnya.');
        }

        $tujuan->update([
            'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA,
            'diterima_at' => now(),
        ]);

        CacheHelper::flush(['persuratan_list']);

        return redirect()->back()->with('success', 'Surat berhasil diterima.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function destroy(string $id)
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $this->authorize('delete', $suratMasuk);

        if ($suratMasuk->file_path) {
            Storage::disk('public')->delete($suratMasuk->file_path);
        }

        $suratMasuk->delete();

        CacheHelper::flush(['persuratan_list']);

        return redirect()->back()->with('success', 'Surat Masuk berhasil dihapus.');
    }

    /**
     * Generate PDF for Cetak Kartu
     */
    public function cetakKartu(string $id)
    {
        $suratMasuk = SuratMasuk::with([
            'tujuans',
            'indeksBerkas',
            'kodeKlasifikasi',
            'staffPengolah',
        ])->findOrFail($id);

        $this->authorize('view', $suratMasuk);

        return Inertia::render('Persuratan/SuratMasuk/CetakKartu', [
            'suratMasuk' => $suratMasuk,
        ]);
    }

    /**
     * Generate PDF for Cetak Lembar Disposisi
     */
    public function cetakDisposisi(Request $request, string $id)
    {
        $suratMasuk = SuratMasuk::with(['tujuans'])->findOrFail($id);
        $this->authorize('disposisiByBupati', $suratMasuk);

        $request->validate([
            'penanda_tangan_index' => 'required|integer|min:0|max:2',
        ]);

        $penandaTangan = DisposisiSurat::PENANDA_TANGAN_OPTIONS[$request->penanda_tangan_index];

        // Record disposisi history
        DisposisiSurat::create([
            'surat_masuk_id' => $suratMasuk->id,
            'penanda_tangan' => $penandaTangan['nama'],
            'jabatan_penanda_tangan' => $penandaTangan['jabatan'],
            'tanggal_disposisi' => now(),
            'created_by' => Auth::id(),
        ]);

        return Inertia::render('Persuratan/SuratMasuk/CetakDisposisi', [
            'suratMasuk' => $suratMasuk,
            'penandaTangan' => $penandaTangan,
        ]);
    }

    /**
     * Preview file surat in browser
     */
    public function previewFile(string $id)
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $this->authorize('view', $suratMasuk);

        if (!$suratMasuk->file_path) {
            return redirect()->back()->with('error', 'File surat tidak ditemukan.');
        }

        $filePath = Storage::disk('public')->path($suratMasuk->file_path);

        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'File surat tidak ditemukan di storage.');
        }

        return response()->file($filePath);
    }

    /**
     * Download file surat
     */
    public function downloadFile(string $id)
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $this->authorize('view', $suratMasuk);

        if (!$suratMasuk->file_path) {
            return redirect()->back()->with('error', 'File surat tidak ditemukan.');
        }

        return response()->download(
            storage_path('app/public/' . $suratMasuk->file_path),
            'Surat_Masuk_' . $suratMasuk->nomor_agenda . '.' . pathinfo($suratMasuk->file_path, PATHINFO_EXTENSION)
        );
    }
    public function cetakIsi(string $id)
    {
        $suratMasuk = SuratMasuk::with(['tujuans', 'indeksBerkas', 'kodeKlasifikasi', 'staffPengolah', 'createdBy'])->findOrFail($id);
        $this->authorize('view', $suratMasuk);

        return Inertia::render('Persuratan/SuratMasuk/CetakIsi', [
            'suratMasuk' => $suratMasuk,
        ]);
    }

    private function resolvePenjadwalanStatusKey(?Penjadwalan $penjadwalan): string
    {
        if (!$penjadwalan) {
            return '-';
        }

        return $penjadwalan->status;
    }

    private function resolvePenjadwalanStatusLabel(?Penjadwalan $penjadwalan): string
    {
        if (!$penjadwalan) {
            return '-';
        }

        return $penjadwalan->status_label;
    }

    private function resolvePenjadwalanStatusVariant(?Penjadwalan $penjadwalan): string
    {
        if (!$penjadwalan) {
            return 'default';
        }

        return match ($penjadwalan->status) {
            Penjadwalan::STATUS_TENTATIF => 'warning',
            Penjadwalan::STATUS_DEFINITIF => 'success',
            default => 'default',
        };
    }

    private function resolvePenerimaanStatusForDisplay(
        SuratMasuk $surat,
        ?SuratMasukTujuan $currentUserTujuan
    ): string {
        if ($currentUserTujuan) {
            return $currentUserTujuan->status_penerimaan ?? '-';
        }

        $pimpinanTujuans = $surat->tujuans->filter(function (SuratMasukTujuan $tujuan) {
            $recipient = $tujuan->user;

            if (!$recipient) {
                return false;
            }

            return $recipient->isPimpinan()
                && ($recipient->isBupati() || $recipient->isWakilBupati());
        });

        if ($pimpinanTujuans->isEmpty()) {
            return '-';
        }

        $allAccepted = $pimpinanTujuans->every(
            fn(SuratMasukTujuan $tujuan) => $tujuan->status_penerimaan === SuratMasukTujuan::STATUS_DITERIMA
        );

        return $allAccepted
            ? SuratMasukTujuan::STATUS_DITERIMA
            : SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN;
    }
}
