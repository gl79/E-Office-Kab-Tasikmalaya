<?php

namespace App\Http\Controllers\Master\Wilayah;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Wilayah\DesaRequest;
use App\Models\WilayahDesa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DesaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', WilayahDesa::class);

        $query = WilayahDesa::query()
            ->select(['provinsi_kode', 'kabupaten_kode', 'kecamatan_kode', 'kode', 'nama', 'created_at'])
            ->with(['kecamatan:provinsi_kode,kabupaten_kode,kode,nama']);

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

        if ($request->kecamatan_kode) {
            $query->where('kecamatan_kode', $request->kecamatan_kode);
        }

        $data = $query->orderBy('provinsi_kode')
            ->orderBy('kabupaten_kode')
            ->orderBy('kecamatan_kode')
            ->orderBy('kode')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Master/Wilayah/Desa/Index', [
            'data' => $data,
            'filters' => $request->only(['search', 'provinsi_kode', 'kabupaten_kode', 'kecamatan_kode']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DesaRequest $request)
    {
        $this->authorize('create', WilayahDesa::class);

        WilayahDesa::create($request->validated());

        return redirect()->back()->with('success', 'Desa berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DesaRequest $request, string $provinsi_kode, string $kabupaten_kode, string $kecamatan_kode, string $kode)
    {
        $desa = WilayahDesa::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kecamatan_kode', $kecamatan_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('update', $desa);

        $desa->update($request->validated());

        return redirect()->back()->with('success', 'Desa berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $provinsi_kode, string $kabupaten_kode, string $kecamatan_kode, string $kode)
    {
        $desa = WilayahDesa::where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kecamatan_kode', $kecamatan_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('delete', $desa);

        $desa->delete();

        \Illuminate\Support\Facades\Cache::tags(['master_archive'])->flush();

        return redirect()->back()->with('success', 'Desa berhasil dihapus.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $parts = explode('.', $id);
        if (count($parts) !== 4) {
            return redirect()->back()->with('error', 'Invalid ID format.');
        }
        [$provinsi_kode, $kabupaten_kode, $kecamatan_kode, $kode] = $parts;

        $desa = WilayahDesa::onlyTrashed()
            ->where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kecamatan_kode', $kecamatan_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('restore', $desa);

        $desa->restore();

        \Illuminate\Support\Facades\Cache::tags(['master_archive'])->flush();

        return redirect()->back()->with('success', 'Desa berhasil dipulihkan.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function forceDelete(string $id)
    {
        $parts = explode('.', $id);
        if (count($parts) !== 4) {
            return redirect()->back()->with('error', 'Invalid ID format.');
        }
        [$provinsi_kode, $kabupaten_kode, $kecamatan_kode, $kode] = $parts;

        $desa = WilayahDesa::onlyTrashed()
            ->where('provinsi_kode', $provinsi_kode)
            ->where('kabupaten_kode', $kabupaten_kode)
            ->where('kecamatan_kode', $kecamatan_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('forceDelete', $desa);

        $desa->forceDelete();

        \Illuminate\Support\Facades\Cache::tags(['master_archive'])->flush();

        return redirect()->back()->with('success', 'Desa berhasil dihapus permanen.');
    }
}
