<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\UnitKerja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MasterArchiveController extends Controller
{
    /**
     * Display a listing of the archived resources from Data Master.
     */
    public function index(Request $request)
    {
        // Use UnitKerja policy for general master archive access check
        // All authenticated users can view archives based on viewAny policy
        $this->authorize('viewAny', UnitKerja::class);

        $search = $request->search;

        // Query for Unit Kerja
        $unitKerja = DB::table('unit_kerja')
            ->select(
                'id',
                'nama',
                'deleted_at',
                DB::raw("'Unit Kerja' as type"),
                DB::raw("'unit-kerja' as resource_name")
            )
            ->whereNotNull('deleted_at');

        // Query for Indeks Surat
        $indeksSurat = DB::table('indeks_surat')
            ->select(
                'id',
                'nama',
                'deleted_at',
                DB::raw("'Indeks Surat' as type"),
                DB::raw("'indeks-surat' as resource_name")
            )
            ->whereNotNull('deleted_at');

        // Query for Wilayah Provinsi
        $provinsi = DB::table('wilayah_provinsi')
            ->select(
                'kode as id',
                'nama',
                'deleted_at',
                DB::raw("'Provinsi' as type"),
                DB::raw("'wilayah.provinsi' as resource_name")
            )
            ->whereNotNull('deleted_at');

        // Query for Wilayah Kabupaten
        $kabupaten = DB::table('wilayah_kabupaten')
            ->select(
                DB::raw("CONCAT(provinsi_kode, '.', kode) as id"),
                'nama',
                'deleted_at',
                DB::raw("'Kabupaten' as type"),
                DB::raw("'wilayah.kabupaten' as resource_name")
            )
            ->whereNotNull('deleted_at');

        // Query for Wilayah Kecamatan
        $kecamatan = DB::table('wilayah_kecamatan')
            ->select(
                DB::raw("CONCAT(provinsi_kode, '.', kabupaten_kode, '.', kode) as id"),
                'nama',
                'deleted_at',
                DB::raw("'Kecamatan' as type"),
                DB::raw("'wilayah.kecamatan' as resource_name")
            )
            ->whereNotNull('deleted_at');

        // Query for Wilayah Desa
        $desa = DB::table('wilayah_desa')
            ->select(
                DB::raw("CONCAT(provinsi_kode, '.', kabupaten_kode, '.', kecamatan_kode, '.', kode) as id"),
                'nama',
                'deleted_at',
                DB::raw("'Desa' as type"),
                DB::raw("'wilayah.desa' as resource_name")
            )
            ->whereNotNull('deleted_at');

        // Combine queries
        $query = $unitKerja
            ->union($indeksSurat)
            ->union($provinsi)
            ->union($kabupaten)
            ->union($kecamatan)
            ->union($desa);

        // Apply search if exists
        if ($search) {
            // We need to wrap the union query to search across the combined result
            // Or apply search to each subquery. Applying to subqueries is generally safer for index usage,
            // but for simplicity and "nama" field commonality, wrapping is easier to write but might be slower on huge datasets.
            // Given the context, we'll apply search to the combined result via a subquery or just apply where clause if possible.
            // Laravel's union builder allows chaining where, but it applies to the final query.

            // Search logic for combined query
            $query = DB::table(DB::raw("({$query->toSql()}) as combined_table"))
                ->mergeBindings($query) // Add bindings from subqueries
                ->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $search . '%'])
                        ->orWhereRaw('LOWER(type) LIKE LOWER(?)', ['%' . $search . '%']);
                });
        }

        // Order and Paginate
        $archives = $query->orderBy('deleted_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Master/Archive/Index', [
            'archives' => $archives,
            'filters' => $request->only(['search']),
        ]);
    }
}
