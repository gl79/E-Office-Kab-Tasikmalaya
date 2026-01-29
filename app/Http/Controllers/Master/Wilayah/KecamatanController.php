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

        $kecamatan->delete();

        return redirect()->back()->with('success', 'Kecamatan berhasil dihapus.');
    }

    /**
     * Get kecamatan by kabupaten for dropdown.
     */
    public function getKecamatanByKabupaten(string $provinsiKode, string $kabupatenKode)
    {
        return response()->json(
            WilayahKecamatan::where('provinsi_kode', $provinsiKode)
                ->where('kabupaten_kode', $kabupatenKode)
                ->orderBy('nama')
                ->get()
        );
    }
}
