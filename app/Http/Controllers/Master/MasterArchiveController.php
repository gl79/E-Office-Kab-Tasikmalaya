<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
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

        // Combine queries
        $query = $unitKerja->union($indeksSurat);

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
