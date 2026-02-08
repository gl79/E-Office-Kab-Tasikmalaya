<?php

namespace App\Http\Controllers\Persuratan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Persuratan\SuratMasukRequest;
use App\Models\DisposisiSurat;
use App\Models\IndeksSurat;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SuratMasukController extends Controller
{
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
                    ->with(['tujuans', 'indeksBerkas', 'kodeKlasifikasi', 'staffPengolah', 'createdBy'])
                    ->latest();

                // SuperAdmin & TU see all, others only see surat addressed to them
                if (!$user->isSuperAdmin() && !$user->isTU()) {
                    $query->whereHas('tujuans', function ($q) use ($user) {
                        $q->where('tujuan_id', $user->id);
                    });
                }

                return $query->get();
            })),
            'sifatOptions' => SuratMasuk::SIFAT_OPTIONS,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', SuratMasuk::class);

        return Inertia::render('Persuratan/SuratMasuk/Create', [
            'indeksSurat' => IndeksSurat::orderBy('urutan')->get(['id', 'kode', 'nama', 'jenis_surat']),
            'users' => User::select(['id', 'name', 'nip', 'jabatan'])
                ->where('role', '!=', User::ROLE_SUPERADMIN)
                ->where('id', '!=', auth()->id())
                ->orderByRaw("CASE
                    WHEN name = 'Tata Usaha' THEN 1
                    WHEN name = 'Bupati' THEN 2
                    WHEN name = 'Wakil Bupati' THEN 3
                    WHEN name = 'Sekpri Bupati' THEN 4
                    WHEN name = 'Sekpri Wakil Bupati' THEN 5
                    WHEN name = 'Sekda' THEN 6
                    WHEN name = 'Asda 1' THEN 7
                    WHEN name = 'Asda 2' THEN 8
                    WHEN name = 'Asda 3' THEN 9
                    ELSE 10
                END")
                ->get(),
            'sifatOptions' => SuratMasuk::SIFAT_OPTIONS,
            'nextNomorAgenda' => SuratMasuk::generateNomorAgenda(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SuratMasukRequest $request)
    {
        $this->authorize('create', SuratMasuk::class);

        DB::beginTransaction();
        try {
            $data = $request->validated();

            // Auto-generate nomor agenda
            $data['nomor_agenda'] = SuratMasuk::generateNomorAgenda();

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $data['file_path'] = $file->storeAs('surat-masuk', $filename, 'public');
            }

            // Remove non-model fields before create
            $tujuanList = $data['tujuan'] ?? [];
            unset($data['tujuan'], $data['file']);

            // Create surat masuk
            $suratMasuk = SuratMasuk::create($data);

            // Create tujuan records
            foreach ($tujuanList as $tujuan) {
                // If input is ID (numeric), find user
                $userData = null;
                if (is_numeric($tujuan)) {
                    $userData = User::find($tujuan);
                }

                SuratMasukTujuan::create([
                    'surat_masuk_id' => $suratMasuk->id,
                    'tujuan_id' => $userData?->id ?? null,
                    'tujuan' => $userData?->name ?? $tujuan,
                ]);
            }

            DB::commit();

            CacheHelper::flush(['persuratan_list']);

            return redirect()->route('persuratan.surat-masuk.index')
                ->with('success', 'Surat Masuk berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menyimpan surat masuk: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $suratMasuk = SuratMasuk::with([
            'tujuans',
            'disposisis',
            'indeksBerkas',
            'kodeKlasifikasi',
            'staffPengolah',
            'createdBy',
            'updatedBy',
        ])->findOrFail($id);

        $this->authorize('view', $suratMasuk);

        return Inertia::render('Persuratan/SuratMasuk/Show', [
            'suratMasuk' => $suratMasuk,
            'penandaTanganOptions' => DisposisiSurat::PENANDA_TANGAN_OPTIONS,
        ]);
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
            'indeksSurat' => IndeksSurat::orderBy('urutan')->get(['id', 'kode', 'nama', 'jenis_surat']),
            'users' => User::select(['id', 'name', 'nip', 'jabatan'])
                ->where('role', '!=', User::ROLE_SUPERADMIN)
                ->where('id', '!=', auth()->id())
                ->orderByRaw("CASE
                    WHEN name = 'Tata Usaha' THEN 1
                    WHEN name = 'Bupati' THEN 2
                    WHEN name = 'Wakil Bupati' THEN 3
                    WHEN name = 'Sekpri Bupati' THEN 4
                    WHEN name = 'Sekpri Wakil Bupati' THEN 5
                    WHEN name = 'Sekda' THEN 6
                    WHEN name = 'Asda 1' THEN 7
                    WHEN name = 'Asda 2' THEN 8
                    WHEN name = 'Asda 3' THEN 9
                    ELSE 10
                END")
                ->get(),
            'sifatOptions' => SuratMasuk::SIFAT_OPTIONS,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SuratMasukRequest $request, string $id)
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $this->authorize('update', $suratMasuk);

        DB::beginTransaction();
        try {
            $data = $request->validated();

            // Handle file upload
            if ($request->hasFile('file')) {
                // Delete old file
                if ($suratMasuk->file_path) {
                    Storage::disk('public')->delete($suratMasuk->file_path);
                }

                $file = $request->file('file');
                $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $data['file_path'] = $file->storeAs('surat-masuk', $filename, 'public');
            }

            // Remove non-model fields before update
            $tujuanList = $data['tujuan'] ?? [];
            unset($data['tujuan'], $data['file']);

            // Update surat masuk
            $suratMasuk->update($data);

            // Sync tujuan records
            $suratMasuk->tujuans()->delete();
            foreach ($tujuanList as $tujuan) {
                $userData = null;
                if (is_numeric($tujuan)) {
                    $userData = User::find($tujuan);
                }

                SuratMasukTujuan::create([
                    'surat_masuk_id' => $suratMasuk->id,
                    'tujuan_id' => $userData?->id ?? null,
                    'tujuan' => $userData?->name ?? $tujuan,
                ]);
            }

            DB::commit();

            CacheHelper::flush(['persuratan_list']);

            return redirect()->route('persuratan.surat-masuk.index')
                ->with('success', 'Surat Masuk berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui surat masuk: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $this->authorize('delete', $suratMasuk);

        $suratMasuk->delete();

        CacheHelper::flush(['persuratan_archive']);
        CacheHelper::flush(['persuratan_list']);

        return redirect()->back()->with('success', 'Surat Masuk berhasil dihapus.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $suratMasuk = SuratMasuk::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $suratMasuk);

        $suratMasuk->restore();

        CacheHelper::flush(['persuratan_archive']);
        CacheHelper::flush(['persuratan_list']);

        return redirect()->back()->with('success', 'Surat Masuk berhasil dipulihkan.');
    }

    /**
     * Permanently remove the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $suratMasuk = SuratMasuk::onlyTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $suratMasuk);

        // Delete file
        if ($suratMasuk->file_path) {
            Storage::disk('public')->delete($suratMasuk->file_path);
        }

        $suratMasuk->forceDelete();

        CacheHelper::flush(['persuratan_archive']);
        CacheHelper::flush(['persuratan_list']);

        return redirect()->back()->with('success', 'Surat Masuk berhasil dihapus permanen.');
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
        $this->authorize('view', $suratMasuk);

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
            'created_by' => $request->user()->id,
        ]);

        return Inertia::render('Persuratan/SuratMasuk/CetakDisposisi', [
            'suratMasuk' => $suratMasuk,
            'penandaTangan' => $penandaTangan,
        ]);
    }

    /**
     * Download or preview file surat
     */


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
}
