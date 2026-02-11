<?php

namespace App\Http\Controllers\Persuratan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Persuratan\SuratKeluarRequest;
use App\Models\IndeksSurat;
use App\Models\SuratKeluar;
use App\Models\UnitKerja;
use App\Models\User;
use App\Services\Persuratan\SuratKeluarService;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SuratKeluarController extends Controller
{
    public function __construct(private readonly SuratKeluarService $service) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', SuratKeluar::class);

        $user = $request->user();

        return Inertia::render('Persuratan/SuratKeluar/Index', [
            'suratKeluar' => Inertia::defer(fn() => CacheHelper::tags(['persuratan_list'])->remember('surat_keluar_list_' . $user->id, 60, function () use ($user) {
                $query = SuratKeluar::query()
                    ->with(['indeks', 'kodeKlasifikasi', 'unitKerja', 'createdBy'])
                    ->latest('tanggal_surat');

                // SuperAdmin sees all, others (including TU) only see surat keluar they created
                if (!$user->isSuperAdmin()) {
                    $query->where('created_by', $user->id);
                }

                return $query->get();
            })),
            'sifat1Options' => SuratKeluar::SIFAT_1_OPTIONS,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', SuratKeluar::class);

        $nextNoUrut = SuratKeluar::generateNextNoUrut();

        return Inertia::render('Persuratan/SuratKeluar/Create', [
            'indeksBerkasOptions' => IndeksSurat::where('level', 1)->orderBy('kode')->get(['id', 'kode', 'nama']),
            'indeksKlasifikasiOptions' => IndeksSurat::where('level', '>', 1)->orderBy('kode')->get(['id', 'kode', 'nama', 'level', 'parent_id']),
            'unitKerja' => UnitKerja::orderBy('nama')->get(['id', 'nama', 'singkatan']),
            'users' => User::select(['id', 'name', 'nip', 'jabatan'])
                ->where('role', '!=', User::ROLE_SUPERADMIN)
                ->orderBy('name')
                ->get(),
            'sifat1Options' => SuratKeluar::SIFAT_1_OPTIONS,
            'nextNoUrut' => $nextNoUrut,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SuratKeluarRequest $request)
    {
        $this->authorize('create', SuratKeluar::class);

        try {
            $data = $request->validated();
            if ($request->hasFile('file')) {
                $data['file'] = $request->file('file');
            }

            $this->service->store($data);

            return redirect()->route('persuratan.surat-keluar.index')
                ->with('success', 'Surat Keluar berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan surat keluar', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menyimpan surat keluar. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $suratKeluar = SuratKeluar::with([
            'indeks',
            'kodeKlasifikasi',
            'unitKerja',
            'createdBy',
            'updatedBy',
        ])->findOrFail($id);

        $this->authorize('view', $suratKeluar);

        return Inertia::render('Persuratan/SuratKeluar/Show', [
            'suratKeluar' => $suratKeluar,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $suratKeluar = SuratKeluar::findOrFail($id);
        $this->authorize('update', $suratKeluar);

        return Inertia::render('Persuratan/SuratKeluar/Edit', [
            'suratKeluar' => $suratKeluar,
            'indeksBerkasOptions' => IndeksSurat::where('level', 1)->orderBy('kode')->get(['id', 'kode', 'nama']),
            'indeksKlasifikasiOptions' => IndeksSurat::where('level', '>', 1)->orderBy('kode')->get(['id', 'kode', 'nama', 'level', 'parent_id']),
            'unitKerja' => UnitKerja::orderBy('nama')->get(['id', 'nama', 'singkatan']),
            'users' => User::select(['id', 'name', 'nip', 'jabatan'])
                ->where('role', '!=', User::ROLE_SUPERADMIN)
                ->orderBy('name')
                ->get(),
            'sifat1Options' => SuratKeluar::SIFAT_1_OPTIONS,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SuratKeluarRequest $request, string $id)
    {
        $suratKeluar = SuratKeluar::findOrFail($id);
        $this->authorize('update', $suratKeluar);

        try {
            $data = $request->validated();
            if ($request->hasFile('file')) {
                $data['file'] = $request->file('file');
            }

            $this->service->update($suratKeluar, $data);

            return redirect()->route('persuratan.surat-keluar.index')
                ->with('success', 'Surat Keluar berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Gagal memperbarui surat keluar', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui surat keluar. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $suratKeluar = SuratKeluar::findOrFail($id);
        $this->authorize('delete', $suratKeluar);

        $this->service->delete($suratKeluar);

        return redirect()->back()->with('success', 'Surat Keluar berhasil dihapus.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $suratKeluar = SuratKeluar::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $suratKeluar);

        $suratKeluar->restore();

        CacheHelper::flush(['persuratan_archive', 'persuratan_list']);

        return redirect()->back()->with('success', 'Surat Keluar berhasil dipulihkan.');
    }

    /**
     * Permanently remove the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $suratKeluar = SuratKeluar::onlyTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $suratKeluar);

        // Delete file
        if ($suratKeluar->file_path) {
            Storage::disk('public')->delete($suratKeluar->file_path);
        }

        $suratKeluar->forceDelete();

        CacheHelper::flush(['persuratan_archive', 'persuratan_list']);

        return redirect()->back()->with('success', 'Surat Keluar berhasil dihapus permanen.');
    }

    /**
     * Generate PDF for Cetak Kartu
     */
    public function cetakKartu(string $id)
    {
        $suratKeluar = SuratKeluar::with([
            'indeks',
            'kodeKlasifikasi',
            'unitKerja',
        ])->findOrFail($id);

        $this->authorize('view', $suratKeluar);

        return Inertia::render('Persuratan/SuratKeluar/CetakKartu', [
            'suratKeluar' => $suratKeluar,
        ]);
    }

    /**
     * Generate Cetak Isi Surat Keluar
     */
    public function cetakIsi(string $id)
    {
        $suratKeluar = SuratKeluar::with([
            'indeks',
            'kodeKlasifikasi',
            'unitKerja',
            'createdBy',
        ])->findOrFail($id);

        $this->authorize('view', $suratKeluar);

        return Inertia::render('Persuratan/SuratKeluar/CetakIsi', [
            'suratKeluar' => $suratKeluar,
        ]);
    }

    /**
     * Preview file surat in browser
     */
    public function previewFile(string $id)
    {
        $suratKeluar = SuratKeluar::findOrFail($id);
        $this->authorize('view', $suratKeluar);

        if (!$suratKeluar->file_path) {
            return redirect()->back()->with('error', 'File surat tidak ditemukan.');
        }

        $filePath = storage_path('app/public/' . $suratKeluar->file_path);

        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'File tidak ditemukan di server.');
        }

        $mimeType = mime_content_type($filePath);

        return response()->file($filePath, ['Content-Type' => $mimeType]);
    }

    /**
     * Download file surat
     */
    public function downloadFile(string $id)
    {
        $suratKeluar = SuratKeluar::findOrFail($id);
        $this->authorize('view', $suratKeluar);

        if (!$suratKeluar->file_path) {
            return redirect()->back()->with('error', 'File surat tidak ditemukan.');
        }

        return response()->download(
            storage_path('app/public/' . $suratKeluar->file_path),
            'Surat_Keluar_' . $suratKeluar->nomor_surat . '.' . pathinfo($suratKeluar->file_path, PATHINFO_EXTENSION)
        );
    }
}
