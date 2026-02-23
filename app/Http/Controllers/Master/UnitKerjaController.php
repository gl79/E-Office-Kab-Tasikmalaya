<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\UnitKerjaRequest;
use App\Models\UnitKerja;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitKerjaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', UnitKerja::class);

        // Client-side search optimization: Return all data
        // For larger datasets, we would keep server-side pagination, 
        // but for Unit Kerja (small), client-side is faster and smoother.
        return Inertia::render('Master/UnitKerja/Index', [
            'unitKerja' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember('unit_kerja_list', 60, function () {
                return UnitKerja::query()
                    ->select(['id', 'nama', 'singkatan', 'created_at', 'updated_at'])
                    ->latest()
                    ->get();
            })),
            'filters' => $request->only(['search']), // Keep for consistent props, though unused for filtering
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UnitKerjaRequest $request)
    {
        $this->authorize('create', UnitKerja::class);

        UnitKerja::create($request->validated());

        CacheHelper::flush(['master_list']);

        return redirect()->back()->with('success', 'Unit Kerja berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UnitKerjaRequest $request, string $id)
    {
        $unitKerja = UnitKerja::findOrFail($id);
        $this->authorize('update', $unitKerja);

        $unitKerja->update($request->validated());

        CacheHelper::flush(['master_list']);

        return redirect()->back()->with('success', 'Unit Kerja berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function destroy(string $id)
    {
        $unitKerja = UnitKerja::findOrFail($id);
        $this->authorize('delete', $unitKerja);

        $unitKerja->delete();

        CacheHelper::flush(['master_list']);

        return redirect()->back()->with('success', 'Unit Kerja berhasil dihapus.');
    }
}
