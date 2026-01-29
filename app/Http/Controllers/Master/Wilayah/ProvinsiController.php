<?php

namespace App\Http\Controllers\Master\Wilayah;

use App\Http\Controllers\Controller;
use App\Models\WilayahProvinsi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProvinsiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = WilayahProvinsi::query();

        if ($request->search) {
            $query->whereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $request->search . '%'])
                ->orWhereRaw('LOWER(kode) LIKE LOWER(?)', ['%' . $request->search . '%']);
        }

        $data = $query->withCount('kabupaten')
            ->orderBy('kode')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Master/Wilayah/Provinsi/Index', [
            'data' => $data,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|string|size:2|unique:wilayah_provinsi,kode',
            'nama' => 'required|string|max:255',
        ]);

        WilayahProvinsi::create($validated);

        return redirect()->back()->with('success', 'Provinsi berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $kode)
    {
        $provinsi = WilayahProvinsi::findOrFail($kode);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        $provinsi->update($validated);

        return redirect()->back()->with('success', 'Provinsi berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $kode)
    {
        $provinsi = WilayahProvinsi::findOrFail($kode);
        $provinsi->delete(); // Cascade delete handled by database foreign keys

        return redirect()->back()->with('success', 'Provinsi berhasil dihapus.');
    }

    /**
     * Get all resources for dropdown.
     */
    public function getAll()
    {
        return response()->json(WilayahProvinsi::orderBy('nama')->get());
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $kode)
    {
        $provinsi = WilayahProvinsi::onlyTrashed()->findOrFail($kode);
        $provinsi->restore();

        return redirect()->back()->with('success', 'Provinsi berhasil dipulihkan.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function forceDelete(string $kode)
    {
        $provinsi = WilayahProvinsi::onlyTrashed()->findOrFail($kode);
        $provinsi->forceDelete();

        return redirect()->back()->with('success', 'Provinsi berhasil dihapus permanen.');
    }
}
