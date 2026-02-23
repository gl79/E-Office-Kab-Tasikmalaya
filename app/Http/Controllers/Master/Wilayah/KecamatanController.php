<?php

namespace App\Http\Controllers\Master\Wilayah;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Wilayah\KecamatanRequest;
use App\Models\WilayahKecamatan;
use App\Support\CacheHelper;
use App\Support\WilayahHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KecamatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', WilayahKecamatan::class);

        $query = WilayahKecamatan::query()
            ->select(['provinsi_kode', 'kabupaten_kode', 'kode', 'nama', 'created_at'])
            ->with(['kabupaten:provinsi_kode,kode,nama', 'kabupaten.provinsi:kode,nama']);

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

        return Inertia::render('Master/Wilayah/Kecamatan/Index', [
            'kecamatan' => Inertia::defer(fn() => CacheHelper::tags(['wilayah'])->remember('kecamatan_list_' . request('provinsi_kode', 'all') . '_' . request('kabupaten_kode', 'all'), 60, function () use ($query) {
                return $query->withCount('desa')
                    ->orderBy('provinsi_kode')
                    ->orderBy('kabupaten_kode')
                    ->orderBy('kode')
                    ->get();
            })),
            'filters' => $request->only(['search', 'provinsi_kode', 'kabupaten_kode']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(KecamatanRequest $request)
    {
        $this->authorize('create', WilayahKecamatan::class);

        WilayahKecamatan::create($request->validated());

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Kecamatan berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(KecamatanRequest $request, string $provinsi_kode, string $kabupaten_kode, string $kode)
    {
        $kecamatan = WilayahKecamatan::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('update', $kecamatan);

        $kecamatan->update($request->validated());

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Kecamatan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function destroy(string $provinsi_kode, string $kabupaten_kode, string $kode)
    {
        $kecamatan = WilayahKecamatan::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('delete', $kecamatan);

        $kecamatan->delete();

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

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
}

