<?php

namespace App\Http\Controllers\Master\Wilayah;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Wilayah\DesaRequest;
use App\Models\WilayahDesa;
use App\Support\CacheHelper;
use App\Support\WilayahHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DesaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', WilayahDesa::class);

        $query = WilayahDesa::query()
            ->select(['provinsi_kode', 'kabupaten_kode', 'kecamatan_kode', 'kode', 'nama', 'latitude', 'longitude', 'alamat', 'created_at'])
            ->with(['kecamatan:provinsi_kode,kabupaten_kode,kode,nama']);

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

        return Inertia::render('Master/Wilayah/Desa/Index', [
            'desa' => Inertia::defer(fn() => CacheHelper::tags(['wilayah'])->remember('desa_list_' . request('kecamatan_kode', 'all'), 60, function () use ($query) {
                return $query->orderBy('provinsi_kode')
                    ->orderBy('kabupaten_kode')
                    ->orderBy('kecamatan_kode')
                    ->orderBy('kode')
                    ->get();
            })),
            'filters' => $request->only(['search', 'provinsi_kode', 'kabupaten_kode', 'kecamatan_kode']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DesaRequest $request)
    {
        $this->authorize('create', WilayahDesa::class);

        WilayahDesa::create($request->validated());

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Desa berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DesaRequest $request, string $provinsi_kode, string $kabupaten_kode, string $kecamatan_kode, string $kode)
    {
        $desa = WilayahDesa::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kecamatan_kode', $kecamatan_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('update', $desa);

        $desa->update($request->validated());

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Desa berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function destroy(string $provinsi_kode, string $kabupaten_kode, string $kecamatan_kode, string $kode)
    {
        $desa = WilayahDesa::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kecamatan_kode', $kecamatan_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('delete', $desa);

        $desa->delete();

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Desa berhasil dihapus.');
    }

    /**
     * Get desa by kecamatan for dropdown.
     */
    public function getDesaByKecamatan(string $provinsiKode, string $kabupatenKode, string $kecamatanKode)
    {
        return response()->json(
            WilayahDesa::where('provinsi_kode', $provinsiKode)
                ->where('kabupaten_kode', $kabupatenKode)
                ->where('kecamatan_kode', $kecamatanKode)
                ->orderBy('nama')
                ->get()
        );
    }
}
