<?php

namespace App\Http\Controllers\Master\Wilayah;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Wilayah\KabupatenRequest;
use App\Models\WilayahKabupaten;
use App\Support\CacheHelper;
use App\Support\WilayahHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KabupatenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', WilayahKabupaten::class);

        $query = WilayahKabupaten::query()
            ->select(['provinsi_kode', 'kode', 'nama', 'created_at'])
            ->with(['provinsi:kode,nama']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $request->search . '%'])
                    ->orWhereRaw('LOWER(kode) LIKE LOWER(?)', ['%' . $request->search . '%']);
            });
        }

        if ($request->provinsi_kode) {
            $query->where('provinsi_kode', $request->provinsi_kode);
        }

        return Inertia::render('Master/Wilayah/Kabupaten/Index', [
            'kabupaten' => Inertia::defer(fn() => CacheHelper::tags(['wilayah'])->remember('kabupaten_list_' . request('provinsi_kode', 'all'), 60, function () use ($query) {
                return $query->withCount('kecamatan')
                    ->orderBy('provinsi_kode')
                    ->orderBy('kode')
                    ->get();
            })),
            'filters' => $request->only(['search', 'provinsi_kode']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(KabupatenRequest $request)
    {
        $this->authorize('create', WilayahKabupaten::class);

        WilayahKabupaten::create($request->validated());

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Kabupaten berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(KabupatenRequest $request, string $provinsi_kode, string $kode)
    {
        $kabupaten = WilayahKabupaten::where('provinsi_kode', $provinsi_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('update', $kabupaten);

        $kabupaten->update($request->validated());

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Kabupaten berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function destroy(string $provinsi_kode, string $kode)
    {
        $kabupaten = WilayahKabupaten::where('provinsi_kode', $provinsi_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('delete', $kabupaten);

        $kabupaten->forceDelete();

        CacheHelper::flush(['wilayah']);
        WilayahHelper::clearCache();

        return redirect()->back()->with('success', 'Kabupaten berhasil dihapus.');
    }

    /**
     * Get kabupaten by provinsi for dropdown.
     */
    public function getKabupatenByProvinsi(string $provinsiKode)
    {
        $this->authorize('viewAny', WilayahKabupaten::class);

        return response()->json(
            WilayahKabupaten::where('provinsi_kode', $provinsiKode)
                ->orderBy('nama')
                ->get()
        );
    }
}

