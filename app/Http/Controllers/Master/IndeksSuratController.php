<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\IndeksSuratRequest;
use App\Models\IndeksSurat;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IndeksSuratController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', IndeksSurat::class);

        // Client-side search optimization: Return all data
        return Inertia::render('Master/IndeksSurat/Index', [
            'indeksSurat' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember('indeks_surat_list', 60, function () {
                return IndeksSurat::query()
                    ->select(['id', 'kode', 'nama', 'urutan', 'created_at', 'updated_at'])
                    ->orderBy('urutan', 'asc')
                    ->latest()
                    ->get();
            })),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(IndeksSuratRequest $request)
    {
        $this->authorize('create', IndeksSurat::class);

        IndeksSurat::create($request->validated());

        CacheHelper::flush(['master_list']);
        CacheHelper::flush(['master_archive']);

        return redirect()->back()->with('success', 'Indeks Surat berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(IndeksSuratRequest $request, string $id)
    {
        $indeksSurat = IndeksSurat::findOrFail($id);
        $this->authorize('update', $indeksSurat);

        $indeksSurat->update($request->validated());

        CacheHelper::flush(['master_list']);
        CacheHelper::flush(['master_archive']);

        return redirect()->back()->with('success', 'Indeks Surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $indeksSurat = IndeksSurat::findOrFail($id);
        $this->authorize('delete', $indeksSurat);

        $indeksSurat->delete();

        CacheHelper::flush(['master_list']);
        CacheHelper::flush(['master_archive']);

        return redirect()->back()->with('success', 'Indeks Surat berhasil dihapus.');
    }

    /**
     * Display a listing of the archived resources.
     */
    public function archive(Request $request)
    {
        $this->authorize('viewAny', IndeksSurat::class);

        $query = IndeksSurat::onlyTrashed()->select(['id', 'kode', 'nama', 'deleted_at']);

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
        $this->authorize('restore', $indeksSurat);

        $indeksSurat->restore();

        CacheHelper::flush(['master_list']);
        CacheHelper::flush(['master_archive']);

        return redirect()->back()->with('success', 'Indeks Surat berhasil dipulihkan.');
    }

    /**
     * Permanently remove the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $indeksSurat = IndeksSurat::onlyTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $indeksSurat);

        $indeksSurat->forceDelete();

        CacheHelper::flush(['master_list']);
        CacheHelper::flush(['master_archive']);

        return redirect()->back()->with('success', 'Indeks Surat berhasil dihapus permanen.');
    }
}

