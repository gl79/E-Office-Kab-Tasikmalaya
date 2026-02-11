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
     * Display a listing of the resource as a tree.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', IndeksSurat::class);

        return Inertia::render('Master/IndeksSurat/Index', [
            'indeksSurat' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember('indeks_surat_tree_v3', 60, function () {
                return $this->buildFlatTree();
            })),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Build a flat tree array from root items with recursive children.
     */
    private function buildFlatTree(): array
    {
        $roots = IndeksSurat::query()
            ->whereNull('parent_id')
            ->with('childrenRecursive')
            ->orderBy('urutan')
            ->orderBy('kode')
            ->get();

        $flat = [];
        $this->flattenTree($roots, $flat);

        return $flat;
    }

    /**
     * Recursively flatten a tree collection into a flat array.
     */
    private function flattenTree($items, array &$flat): void
    {
        foreach ($items as $item) {
            $children = $item->relationLoaded('childrenRecursive') ? $item->childrenRecursive : collect();
            $flat[] = [
                'id' => $item->id,
                'kode' => $item->kode,
                'nama' => $item->nama,
                'level' => $item->level,
                'parent_id' => $item->parent_id,
                'has_children' => $children->isNotEmpty(),
            ];
            if ($children->isNotEmpty()) {
                $this->flattenTree($children, $flat);
            }
        }
    }

    /**
     * Store a newly created code (primer or sub-code).
     */
    public function store(IndeksSuratRequest $request)
    {
        $this->authorize('create', IndeksSurat::class);

        if ($request->filled('parent_id')) {
            // Tambah sub-kode
            $parent = IndeksSurat::findOrFail($request->parent_id);
            $kode = IndeksSurat::generateNextChildKode($parent->id);

            IndeksSurat::create([
                'kode' => $kode,
                'nama' => $request->nama,
                'parent_id' => $parent->id,
                'level' => $parent->level + 1,
            ]);

            CacheHelper::flush(['master_list']);
            CacheHelper::flush(['master_archive']);

            return redirect()->back()->with('success', 'Sub kode klasifikasi berhasil ditambahkan.');
        }

        // Tambah kode primer baru
        $maxUrutan = IndeksSurat::whereNull('parent_id')->max('urutan') ?? 0;

        IndeksSurat::create([
            'kode' => $request->kode,
            'nama' => $request->nama,
            'parent_id' => null,
            'level' => 1,
            'urutan' => $maxUrutan + 1,
        ]);

        CacheHelper::flush(['master_list']);
        CacheHelper::flush(['master_archive']);

        return redirect()->back()->with('success', 'Kode klasifikasi primer berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage (nama only).
     */
    public function update(IndeksSuratRequest $request, string $id)
    {
        $indeksSurat = IndeksSurat::findOrFail($id);
        $this->authorize('update', $indeksSurat);

        $indeksSurat->update(['nama' => $request->nama]);

        CacheHelper::flush(['master_list']);
        CacheHelper::flush(['master_archive']);

        return redirect()->back()->with('success', 'Indeks Surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $indeksSurat = IndeksSurat::findOrFail($id);
        $this->authorize('delete', $indeksSurat);

        // Prevent deleting system-level (primer) codes
        if ($indeksSurat->isSystemLevel()) {
            return redirect()->back()->with('error', 'Kode primer tidak dapat dihapus.');
        }

        // Prevent deleting if has children
        if ($indeksSurat->hasChildren()) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus kode yang masih memiliki sub-kode. Hapus sub-kode terlebih dahulu.');
        }

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

        $query = IndeksSurat::onlyTrashed()->select(['id', 'kode', 'nama', 'level', 'deleted_at']);

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

    /**
     * Get the next auto-generated kode for a parent.
     */
    public function nextKode(string $parentId)
    {
        $this->authorize('create', IndeksSurat::class);

        return response()->json([
            'kode' => IndeksSurat::generateNextChildKode($parentId),
        ]);
    }
}
