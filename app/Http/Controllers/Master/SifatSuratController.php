<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\SifatSurat;
use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SifatSuratController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', SifatSurat::class);

        return Inertia::render('Master/SifatSurat/Index', [
            'sifatSurat' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember('sifat_surat_list', 60, function () {
                return SifatSurat::query()
                    ->select(['id', 'nama', 'created_at', 'updated_at'])
                    ->orderBy('nama', 'asc')
                    ->get();
            })),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', SifatSurat::class);

        $validated = $this->validateNama($request);

        SifatSurat::create($validated);

        CacheHelper::flush(['master_list', 'persuratan_list']);

        return redirect()->back()->with('success', 'Sifat Surat berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $sifatSurat = SifatSurat::findOrFail($id);
        $this->authorize('update', $sifatSurat);

        $validated = $this->validateNama($request, $id);
        $oldValue = SifatSurat::normalizeValue($sifatSurat->nama);
        $newValue = SifatSurat::normalizeValue($validated['nama']);

        DB::transaction(function () use ($sifatSurat, $validated, $oldValue, $newValue) {
            $sifatSurat->update($validated);

            if ($oldValue !== $newValue) {
                SuratMasuk::where('sifat', $oldValue)->update(['sifat' => $newValue]);
                SuratKeluar::where('sifat_1', $oldValue)->update(['sifat_1' => $newValue]);
            }
        });

        CacheHelper::flush(['master_list', 'persuratan_list']);

        return redirect()->back()->with('success', 'Sifat Surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $sifatSurat = SifatSurat::findOrFail($id);
        $this->authorize('delete', $sifatSurat);

        $value = SifatSurat::normalizeValue($sifatSurat->nama);
        $isUsed = SuratMasuk::where('sifat', $value)->exists()
            || SuratKeluar::where('sifat_1', $value)->exists();

        if ($isUsed) {
            return redirect()->back()->with('error', 'Sifat Surat tidak dapat dihapus karena masih digunakan pada data persuratan.');
        }

        $sifatSurat->delete();

        CacheHelper::flush(['master_list', 'persuratan_list']);

        return redirect()->back()->with('success', 'Sifat Surat berhasil dihapus.');
    }

    /**
     * Validate input and protect normalized key collisions/length.
     *
     * @return array{nama: string}
     */
    private function validateNama(Request $request, ?string $ignoreId = null): array
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:sifat_surat,nama' . ($ignoreId ? ',' . $ignoreId : ''),
        ]);

        $normalized = SifatSurat::normalizeValue($validated['nama']);
        if ($normalized === '' || strlen($normalized) > 20) {
            throw ValidationException::withMessages([
                'nama' => 'Nama Sifat Surat terlalu panjang atau tidak valid untuk digunakan pada persuratan.',
            ]);
        }

        $duplicateNormalized = SifatSurat::query()
            ->when($ignoreId, fn($query) => $query->where('id', '!=', $ignoreId))
            ->pluck('nama')
            ->contains(fn(string $nama) => SifatSurat::normalizeValue($nama) === $normalized);

        if ($duplicateNormalized) {
            throw ValidationException::withMessages([
                'nama' => 'Nama Sifat Surat menghasilkan kode yang sama dengan data lain. Gunakan nama berbeda.',
            ]);
        }

        return $validated;
    }
}
