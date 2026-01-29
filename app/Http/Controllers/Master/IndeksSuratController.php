<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\IndeksSuratRequest;
use App\Models\IndeksSurat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IndeksSuratController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = IndeksSurat::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereRaw('LOWER(kode) LIKE LOWER(?)', ['%' . $request->search . '%'])
                    ->orWhereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $request->search . '%']);
            });
        }

        $indeksSurat = $query->orderBy('urutan', 'asc')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Master/IndeksSurat/Index', [
            'indeksSurat' => $indeksSurat,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(IndeksSuratRequest $request)
    {
        IndeksSurat::create($request->validated());

        return redirect()->back()->with('success', 'Indeks Surat berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(IndeksSuratRequest $request, string $id)
    {
        $indeksSurat = IndeksSurat::findOrFail($id);
        $indeksSurat->update($request->validated());

        return redirect()->back()->with('success', 'Indeks Surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $indeksSurat = IndeksSurat::findOrFail($id);
        $indeksSurat->delete();

        return redirect()->back()->with('success', 'Indeks Surat berhasil dihapus.');
    }

    /**
     * Display a listing of the archived resources.
     */
    public function archive(Request $request)
    {
        $query = IndeksSurat::onlyTrashed();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereRaw('LOWER(kode) LIKE LOWER(?)', ['%' . $request->search . '%'])
                    ->orWhereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $request->search . '%']);
            });
        }

        $indeksSurat = $query->latest('deleted_at')->paginate(10)->withQueryString();

        return Inertia::render('Master/IndeksSurat/Archive', [
            'indeksSurat' => $indeksSurat,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $indeksSurat = IndeksSurat::onlyTrashed()->findOrFail($id);
        $indeksSurat->restore();

        return redirect()->back()->with('success', 'Indeks Surat berhasil dipulihkan.');
    }

    /**
     * Permanently remove the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $indeksSurat = IndeksSurat::onlyTrashed()->findOrFail($id);
        $indeksSurat->forceDelete();

        return redirect()->back()->with('success', 'Indeks Surat berhasil dihapus permanen.');
    }
}
