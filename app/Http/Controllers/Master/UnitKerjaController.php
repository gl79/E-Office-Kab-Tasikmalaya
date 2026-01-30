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
        $this->authorize('viewAny', UnitKerja::class);

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
        $this->authorize('create', UnitKerja::class);

        UnitKerja::create($request->validated());

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

        return redirect()->back()->with('success', 'Unit Kerja berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $unitKerja = UnitKerja::findOrFail($id);
        $this->authorize('delete', $unitKerja);

        $unitKerja->delete();

        return redirect()->back()->with('success', 'Unit Kerja berhasil dihapus.');
    }

    /**
     * Display a listing of the archived resources.
     */
    public function archive(Request $request)
    {
        $this->authorize('viewAny', UnitKerja::class);

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
        $this->authorize('restore', $unitKerja);

        $unitKerja->restore();

        return redirect()->back()->with('success', 'Unit Kerja berhasil dipulihkan.');
    }

    /**
     * Permanently remove the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $unitKerja = UnitKerja::onlyTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $unitKerja);

        $unitKerja->forceDelete();

        return redirect()->back()->with('success', 'Unit Kerja berhasil dihapus permanen.');
    }
}
