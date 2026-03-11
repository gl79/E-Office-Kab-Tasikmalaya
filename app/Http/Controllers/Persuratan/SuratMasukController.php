<?php

namespace App\Http\Controllers\Persuratan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Persuratan\DisposisiRequest;
use App\Http\Requests\Persuratan\SuratMasukRequest;
use App\Models\IndeksSurat;
use App\Models\JenisSurat;
use App\Models\SifatSurat;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\TimelineSurat;
use App\Models\User;
use App\Services\Persuratan\DisposisiService;
use App\Services\Persuratan\SuratMasukService;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SuratMasukController extends Controller
{
    public function __construct(
        private readonly SuratMasukService $service,
        private readonly DisposisiService $disposisiService,
    ) {}

    /**
     * Get user options for tujuan select, ordered by jabatan level.
     */
    private function getUserOptions(): \Illuminate\Database\Eloquent\Collection
    {
        return User::select(['users.id', 'users.name', 'users.jabatan_id'])
            ->with('jabatanRelasi:id,nama,level')
            ->where('users.role', '!=', User::ROLE_SUPERADMIN)
            ->leftJoin('jabatans', 'users.jabatan_id', '=', 'jabatans.id')
            ->orderBy('jabatans.level')
            ->orderBy('users.name')
            ->get(['users.id', 'users.name', 'users.jabatan_id']);
    }

    /**
     * Get user options for staff pengolah (include current user).
     */
    private function getStaffPengolahOptions(): \Illuminate\Database\Eloquent\Collection
    {
        return User::select(['users.id', 'users.name', 'users.jabatan_id'])
            ->with('jabatanRelasi:id,nama,level')
            ->where('users.role', '!=', User::ROLE_SUPERADMIN)
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
            'suratMasuk' => Inertia::defer(fn() => CacheHelper::tags(['persuratan_list'])->remember(
                'surat_masuk_list_' . $user->id,
                60,
                fn() => $this->service->getListForUser($user)
            )),
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
            'asalSuratUsers' => $this->getStaffPengolahOptions(),
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
            'asalSuratUsers' => $this->getStaffPengolahOptions(),
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
     * Tandai surat sebagai diterima oleh penerima.
     */
    public function terima(Request $request, string $id)
    {
        $suratMasuk = SuratMasuk::with('tujuans.user')->findOrFail($id);
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

        // Secara otomatis sinkronkan status untuk tujuan TU dari surat ini
        // agar status TU tidak 'menunggu' setelah Pejabat menerima surat.
        $tuTujuans = $suratMasuk->tujuans->filter(function ($tujuanItem) {
            return $tujuanItem->user && $tujuanItem->user->isTU();
        });

        foreach ($tuTujuans as $tuTujuan) {
            if ($tuTujuan->status_penerimaan !== SuratMasukTujuan::STATUS_DITERIMA) {
                $tuTujuan->update([
                    'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA,
                    'diterima_at' => now(),
                ]);
            }
        }

        $this->service->syncGlobalWorkflowStatus($suratMasuk);

        // Record timeline
        TimelineSurat::record(
            $suratMasuk->id,
            $user->id,
            TimelineSurat::AKSI_TERIMA,
            "Surat diterima oleh {$user->name}"
        );

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
            'staffPengolah.jabatanRelasi',
        ])->findOrFail($id);

        $this->authorize('view', $suratMasuk);

        return Inertia::render('Persuratan/SuratMasuk/CetakKartu', [
            'suratMasuk' => $suratMasuk,
        ]);
    }

    /**
     * Generate PDF for Cetak Lembar Disposisi.
     * Penanda tangan diambil dari user yang login (bukan hardcoded).
     */
    public function cetakDisposisi(Request $request, string $id)
    {
        $suratMasuk = SuratMasuk::with(['tujuans'])->findOrFail($id);
        $this->authorize('disposisi', $suratMasuk);

        /** @var User $user */
        $user = Auth::user();

        $penandaTangan = [
            'nama' => $user->name,
            'jabatan' => $user->jabatan_nama ?? '-',
        ];

        return Inertia::render('Persuratan/SuratMasuk/CetakDisposisi', [
            'suratMasuk' => $suratMasuk,
            'penandaTangan' => $penandaTangan,
        ]);
    }

    // ==================== AKSI DISPOSISI & PENJADWALAN ====================

    /**
     * Terima / Diketahui — surat cukup diketahui, status → selesai.
     */

    /**
     * Disposisi surat ke pejabat bawahan.
     */
    public function disposisi(DisposisiRequest $request, string $id)
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $this->authorize('disposisi', $suratMasuk);

        $keUser = User::findOrFail($request->validated()['ke_user_id']);
        $result = $this->disposisiService->disposisi(
            $suratMasuk,
            Auth::user(),
            $keUser,
            $request->validated()['catatan'] ?? null
        );

        return redirect()->back()->with(
            $result['success'] ? 'success' : 'error',
            $result['message']
        );
    }

    /**
     * Jadwalkan surat masuk sebagai kegiatan tentatif.
     */

    /**
     * Masukkan Ke Jadwal (one-click create tentatif schedule).
     */
    public function masukkanKeJadwal(Request $request, string $id)
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $this->authorize('masukkanJadwal', $suratMasuk);

        // Cek secara sederhana apakah user adalah penerima yang sudah accept surat ini
        $user = $request->user();
        $tujuan = $suratMasuk->tujuans()->where('tujuan_id', $user->id)->first();
        if (!$tujuan || $tujuan->status_penerimaan !== SuratMasukTujuan::STATUS_DITERIMA) {
            return redirect()->back()->with('error', 'Anda harus menerima surat ini terlebih dahulu.');
        }

        // Cek apakah sudah ada jadwal sebelumnya
        if ($suratMasuk->penjadwalan) {
            return redirect()->back()->with('error', 'Surat Masuk ini sudah dimasukkan ke Jadwal.');
        }

        // Buat jadwal tentatif
        // Buat jadwal tentatif dengan nilai default yang diperlukan
        \App\Models\Penjadwalan::create([
            'surat_masuk_id' => $suratMasuk->id,
            'status' => \App\Models\Penjadwalan::STATUS_TENTATIF,
            'tanggal_agenda' => now()->format('Y-m-d'),
            'waktu_mulai' => '08:00:00',
            'nama_kegiatan' => $suratMasuk->perihal ?? 'Tindak Lanjut Surat Masuk',
            'tempat' => 'Menunggu Konfirmasi Lokasi',
            'dihadiri_oleh_user_id' => $user->id,
            'status_kehadiran' => 'Dihadiri',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        $this->service->syncGlobalWorkflowStatus($suratMasuk);

        TimelineSurat::record(
            $suratMasuk->id,
            $user->id,
            TimelineSurat::AKSI_JADWALKAN,
            "Surat dimasukkan ke Jadwal Tentatif oleh {$user->name}"
        );

        CacheHelper::flush(['persuratan_list', 'penjadwalan_list', 'dashboard_metrics']);

        return redirect()->back()->with('success', 'Surat berhasil dimasukkan ke Jadwal Tentatif.');
    }

    /**
     * Ambil data timeline surat masuk.
     */
    public function timeline(string $id)
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $this->authorize('viewTimeline', $suratMasuk);

        $timelines = TimelineSurat::where('surat_masuk_id', $suratMasuk->id)
            ->with('user:id,name,jabatan_id')
            ->with('user.jabatanRelasi:id,nama')
            ->orderBy('created_at')
            ->get()
            ->map(fn(TimelineSurat $t) => [
                'id' => $t->id,
                'aksi' => $t->aksi,
                'aksi_label' => $t->aksi_label,
                'keterangan' => $t->keterangan,
                'user_name' => $t->user?->name ?? 'Sistem',
                'user_jabatan' => $t->user?->jabatan_nama ?? '-',
                'created_at' => $t->created_at?->toISOString(),
            ]);

        return response()->json(['timelines' => $timelines]);
    }

    /**
     * Mengambil daftar user target disposisi untuk modal.
     */
    public function disposisiTargets()
    {
        $targets = $this->disposisiService->getDisposisiTargets(Auth::user());

        return response()->json([
            'targets' => $targets->map(fn(User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'jabatan' => $u->jabatan_nama ?? '-',
            ]),
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

        $parts = explode('/', $suratMasuk->nomor_agenda);
        $nomorUrut = count($parts) >= 2 ? $parts[1] : $suratMasuk->nomor_agenda;

        return response()->download(
            storage_path('app/public/' . $suratMasuk->file_path),
            'Surat_Masuk_' . $nomorUrut . '.' . pathinfo($suratMasuk->file_path, PATHINFO_EXTENSION)
        );
    }
    public function cetakIsi(string $id)
    {
        $suratMasuk = SuratMasuk::with(['tujuans', 'indeksBerkas', 'kodeKlasifikasi', 'staffPengolah.jabatanRelasi', 'createdBy'])->findOrFail($id);
        $this->authorize('view', $suratMasuk);

        return Inertia::render('Persuratan/SuratMasuk/CetakIsi', [
            'suratMasuk' => $suratMasuk,
        ]);
    }
}
