<?php

namespace App\Http\Controllers\Master\Wilayah;

use App\Http\Controllers\Controller;
use App\Models\WilayahDesa;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DesaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = WilayahDesa::query()->with(['kecamatan.kabupaten.provinsi']);

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

        if ($request->kecamatan_kode) {
            $query->where('kecamatan_kode', $request->kecamatan_kode);
        }

        $data = $query->orderBy('provinsi_kode')
            ->orderBy('kabupaten_kode')
            ->orderBy('kecamatan_kode')
            ->orderBy('kode')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Master/Wilayah/Desa/Index', [
            'data' => $data,
            'filters' => $request->only(['search', 'provinsi_kode', 'kabupaten_kode', 'kecamatan_kode']),
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
            'kecamatan_kode' => [
                'required',
                Rule::exists('wilayah_kecamatan', 'kode')->where(function ($query) use ($request) {
                    return $query->where('provinsi_kode', $request->provinsi_kode)
                        ->where('kabupaten_kode', $request->kabupaten_kode);
                }),
            ],
            'kode' => [
                'required',
                'string',
                'size:4',
                Rule::unique('wilayah_desa')->where(function ($query) use ($request) {
                    return $query->where('provinsi_kode', $request->provinsi_kode)
                        ->where('kabupaten_kode', $request->kabupaten_kode)
                        ->where('kecamatan_kode', $request->kecamatan_kode);
                }),
            ],
            'nama' => 'required|string|max:255',
        ]);

        WilayahDesa::create($validated);

        return redirect()->back()->with('success', 'Desa berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $provinsi_kode, string $kabupaten_kode, string $kecamatan_kode, string $kode)
    {
        $desa = WilayahDesa::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kecamatan_kode', $kecamatan_kode)
            ->where('kode', $kode)
            ->firstOrFail();

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        $desa->update($validated);

        return redirect()->back()->with('success', 'Desa berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $provinsi_kode, string $kabupaten_kode, string $kecamatan_kode, string $kode)
    {
        $desa = WilayahDesa::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kecamatan_kode', $kecamatan_kode)
            ->where('kode', $kode)
            ->firstOrFail();

        $desa->delete();

        return redirect()->back()->with('success', 'Desa berhasil dihapus.');
    }
}
