<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\UnitKerjaRequest;
use App\Models\UnitKerja;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitKerjaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = UnitKerja::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $request->search . '%'])
                    ->orWhereRaw('LOWER(singkatan) LIKE LOWER(?)', ['%' . $request->search . '%']);
            });
        }

        $unitKerja = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Master/UnitKerja/Index', [
            'unitKerja' => $unitKerja,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UnitKerjaRequest $request)
    {
        UnitKerja::create($request->validated());

        return redirect()->back()->with('success', 'Unit Kerja berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UnitKerjaRequest $request, string $id)
    {
        $unitKerja = UnitKerja::findOrFail($id);
        $unitKerja->update($request->validated());

        return redirect()->back()->with('success', 'Unit Kerja berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $unitKerja = UnitKerja::findOrFail($id);
        $unitKerja->delete();

        return redirect()->back()->with('success', 'Unit Kerja berhasil dihapus.');
    }

    /**
     * Display a listing of the archived resources.
     */
    public function archive(Request $request)
    {
        $query = UnitKerja::onlyTrashed();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $request->search . '%'])
                    ->orWhereRaw('LOWER(singkatan) LIKE LOWER(?)', ['%' . $request->search . '%']);
            });
        }

        $unitKerja = $query->latest('deleted_at')->paginate(10)->withQueryString();

        return Inertia::render('Master/UnitKerja/Archive', [
            'unitKerja' => $unitKerja,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $unitKerja = UnitKerja::onlyTrashed()->findOrFail($id);
        $unitKerja->restore();

        return redirect()->back()->with('success', 'Unit Kerja berhasil dipulihkan.');
    }

    /**
     * Permanently remove the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $unitKerja = UnitKerja::onlyTrashed()->findOrFail($id);
        $unitKerja->forceDelete();

        return redirect()->back()->with('success', 'Unit Kerja berhasil dihapus permanen.');
    }
}
