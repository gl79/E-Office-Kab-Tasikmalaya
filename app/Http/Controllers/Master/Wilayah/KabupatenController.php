<?php

namespace App\Http\Controllers\Master\Wilayah;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Wilayah\KabupatenRequest;
use App\Models\WilayahKabupaten;
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

        $data = $query->withCount('kecamatan')
            ->orderBy('provinsi_kode')
            ->orderBy('kode')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Master/Wilayah/Kabupaten/Index', [
            'data' => $data,
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

        return redirect()->back()->with('success', 'Kabupaten berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $provinsi_kode, string $kode)
    {
        $kabupaten = WilayahKabupaten::where('provinsi_kode', $provinsi_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('delete', $kabupaten);

        $kabupaten->delete();

        \Illuminate\Support\Facades\Cache::tags(['master_archive'])->flush();

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

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $parts = explode('.', $id);
        if (count($parts) !== 2) {
            return redirect()->back()->with('error', 'Invalid ID format.');
        }
        [$provinsi_kode, $kode] = $parts;

        $kabupaten = WilayahKabupaten::onlyTrashed()
            ->where('provinsi_kode', $provinsi_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('restore', $kabupaten);

        $kabupaten->restore();

        \Illuminate\Support\Facades\Cache::tags(['master_archive'])->flush();

        return redirect()->back()->with('success', 'Kabupaten berhasil dipulihkan.');
    }

    /**
     * Remove the specified resource from storage permanently.
     */
    public function forceDelete(string $id)
    {
        $parts = explode('.', $id);
        if (count($parts) !== 2) {
            return redirect()->back()->with('error', 'Invalid ID format.');
        }
        [$provinsi_kode, $kode] = $parts;

        $kabupaten = WilayahKabupaten::onlyTrashed()
            ->where('provinsi_kode', $provinsi_kode)
            ->where('kode', $kode)
            ->firstOrFail();
        $this->authorize('forceDelete', $kabupaten);

        $kabupaten->forceDelete();

        \Illuminate\Support\Facades\Cache::tags(['master_archive'])->flush();

        return redirect()->back()->with('success', 'Kabupaten berhasil dihapus permanen.');
    }
}
