<?php

namespace App\Http\Controllers\Master\Wilayah;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Wilayah\ProvinsiRequest;
use App\Models\WilayahProvinsi;
use App\Support\CacheHelper;
use App\Support\WilayahHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProvinsiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', WilayahProvinsi::class);

        $query = WilayahProvinsi::query();

        if ($request->search) {
            $query->whereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $request->search . '%'])
                ->orWhereRaw('LOWER(kode) LIKE LOWER(?)', ['%' . $request->search . '%']);
        }

        return Inertia::render('Master/Wilayah/Provinsi/Index', [
            'provinsi' => Inertia::defer(fn() => CacheHelper::tags(['wilayah'])->remember('provinsi_list', 60, function () use ($query) {
                return $query->withCount('kabupaten')
                    ->orderBy('kode')
                    ->get();
            })),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProvinsiRequest $request)
    {
        $this->authorize('create', WilayahProvinsi::class);

        WilayahProvinsi::create($request->validated());

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Provinsi berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProvinsiRequest $request, string $kode)
    {
        $provinsi = WilayahProvinsi::findOrFail($kode);
        $this->authorize('update', $provinsi);

        $provinsi->update($request->validated());

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Provinsi berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function destroy(string $kode)
    {
        $provinsi = WilayahProvinsi::findOrFail($kode);
        $this->authorize('delete', $provinsi);

        $provinsi->delete();

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Provinsi berhasil dihapus.');
    }

    /**
     * Get all resources for dropdown.
     */
    public function getAll()
    {
        $this->authorize('viewAny', WilayahProvinsi::class);

        return response()->json(WilayahProvinsi::orderBy('nama')->get());
    }
}

