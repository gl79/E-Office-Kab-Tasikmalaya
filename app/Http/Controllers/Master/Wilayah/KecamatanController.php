<?php

namespace App\Http\Controllers\Master\Wilayah;

use App\Http\Controllers\Controller;
use App\Models\WilayahKecamatan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class KecamatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', WilayahKecamatan::class);

        $query = WilayahKecamatan::query()->with(['kabupaten.provinsi']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $request->search . '%'])
                    ->orWhereRaw('LOWER(kode) LIKE LOWER(?)', ['%' . $request->search . '%']);
            });
        }

        if ($request->provinsi_kode) {
            $query->where('provinsi_kode', $request->provinsi_kode);
        }

        if ($request->kabupaten_kode) {
            $query->where('kabupaten_kode', $request->kabupaten_kode);
        }

        $data = $query->withCount('desa')
            ->orderBy('provinsi_kode')
            ->orderBy('kabupaten_kode')
            ->orderBy('kode')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Master/Wilayah/Kecamatan/Index', [
            'data' => $data,
            'filters' => $request->only(['search', 'provinsi_kode', 'kabupaten_kode']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', WilayahKecamatan::class);

        $validated = $request->validate([
            'provinsi_kode' => 'required|exists:wilayah_provinsi,kode',
            'kabupaten_kode' => [
                'required',
                Rule::exists('wilayah_kabupaten', 'kode')->where(function ($query) use ($request) {
                    return $query->where('provinsi_kode', $request->provinsi_kode);
                }),
            ],
            'kode' => [
                'required',
                'string',
                'size:2',
                Rule::unique('wilayah_kecamatan')->where(function ($query) use ($request) {
                    return $query->where('provinsi_kode', $request->provinsi_kode)
                        ->where('kabupaten_kode', $request->kabupaten_kode);
                }),
            ],
            'nama' => 'required|string|max:255',
        ]);

        WilayahKecamatan::create($validated);

        return redirect()->back()->with('success', 'Kecamatan berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $provinsi_kode, string $kabupaten_kode, string $kode)
    {
        $kecamatan = WilayahKecamatan::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('update', $kecamatan);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        $kecamatan->update($validated);

        return redirect()->back()->with('success', 'Kecamatan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $provinsi_kode, string $kabupaten_kode, string $kode)
    {
        $kecamatan = WilayahKecamatan::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('delete', $kecamatan);

        $kecamatan->delete();

        return redirect()->back()->with('success', 'Kecamatan berhasil dihapus.');
    }

    /**
     * Get kecamatan by kabupaten for dropdown.
     */
    public function getKecamatanByKabupaten(string $provinsiKode, string $kabupatenKode)
    {
        $this->authorize('viewAny', WilayahKecamatan::class);

        return response()->json(
            WilayahKecamatan::where('provinsi_kode', $provinsiKode)
                ->where('kabupaten_kode', $kabupatenKode)
                ->orderBy('nama')
                ->get()
        );
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $parts = explode('.', $id);
        if (count($parts) !== 3) {
            return redirect()->back()->with('error', 'Invalid ID format.');
        }
        [$provinsi_kode, $kabupaten_kode, $kode] = $parts;

        $kecamatan = WilayahKecamatan::onlyTrashed()
            ->where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('restore', $kecamatan);

        $kecamatan->restore();

        return redirect()->back()->with('success', 'Kecamatan berhasil dipulihkan.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function forceDelete(string $id)
    {
        $parts = explode('.', $id);
        if (count($parts) !== 3) {
            return redirect()->back()->with('error', 'Invalid ID format.');
        }
        [$provinsi_kode, $kabupaten_kode, $kode] = $parts;

        $kecamatan = WilayahKecamatan::onlyTrashed()
            ->where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('forceDelete', $kecamatan);

        $kecamatan->forceDelete();

        return redirect()->back()->with('success', 'Kecamatan berhasil dihapus permanen.');
    }
}
