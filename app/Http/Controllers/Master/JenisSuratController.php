<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\JenisSurat;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JenisSuratController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', JenisSurat::class);

        // Client-side search optimization: Return all data
        // Similar to Unit Kerja, Jenis Surat data is small enough for client-side handling.
        return Inertia::render('Master/JenisSurat/Index', [
            'jenisSurat' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember('jenis_surat_list', 60, function () {
                return JenisSurat::query()
                    ->select(['id', 'nama', 'created_at', 'updated_at'])
                    ->orderBy('nama', 'asc')
                    ->get();
            })),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', JenisSurat::class);

        $request->validate([
            'nama' => 'required|string|max:255|unique:jenis_surat,nama',
        ]);

        JenisSurat::create($request->only('nama'));

        CacheHelper::flush(['master_list']);

        return redirect()->back()->with('success', 'Jenis Surat berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $jenisSurat = JenisSurat::findOrFail($id);
        $this->authorize('update', $jenisSurat);

        $request->validate([
            'nama' => 'required|string|max:255|unique:jenis_surat,nama,' . $id,
        ]);

        $jenisSurat->update($request->only('nama'));

        CacheHelper::flush(['master_list']);

        return redirect()->back()->with('success', 'Jenis Surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $jenisSurat = JenisSurat::findOrFail($id);
        $this->authorize('delete', $jenisSurat);

        $jenisSurat->delete();

        CacheHelper::flush(['master_list']);

        return redirect()->back()->with('success', 'Jenis Surat berhasil dihapus.');
    }
}
