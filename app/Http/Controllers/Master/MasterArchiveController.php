<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\IndeksSurat;
use App\Models\UnitKerja;
use App\Models\WilayahDesa;
use App\Models\WilayahKabupaten;
use App\Models\WilayahKecamatan;
use App\Models\WilayahProvinsi;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        $page = $request->page ?? 1;

        $cacheKey = 'master_archive_index_' . md5($search . '_' . $page);

        return Inertia::render('Master/Archive/Index', [
            'archives' => Inertia::defer(fn() => CacheHelper::tags(['master_archive'])->remember($cacheKey, 60, function () use ($search) {
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
                    // Search logic for combined query
                    $query = DB::table(DB::raw("({$query->toSql()}) as combined_table"))
                        ->mergeBindings($query) // Add bindings from subqueries
                        ->where(function ($q) use ($search) {
                            $q->whereRaw('LOWER(nama) LIKE LOWER(?)', ['%' . $search . '%'])
                                ->orWhereRaw('LOWER(type) LIKE LOWER(?)', ['%' . $search . '%']);
                        });
                }

                // Order and Paginate
                return $query->orderBy('deleted_at', 'desc')
                    ->paginate(10)
                    ->withQueryString();
            })),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Restore all archived data master resources.
     */
    public function restoreAll()
    {
        DB::beginTransaction();
        try {
            $counts = [
                'unit_kerja' => UnitKerja::onlyTrashed()->count(),
                'indeks_surat' => IndeksSurat::onlyTrashed()->count(),
                'provinsi' => WilayahProvinsi::onlyTrashed()->count(),
                'kabupaten' => WilayahKabupaten::onlyTrashed()->count(),
                'kecamatan' => WilayahKecamatan::onlyTrashed()->count(),
                'desa' => WilayahDesa::onlyTrashed()->count(),
            ];

            // Restore all
            UnitKerja::onlyTrashed()->update(['deleted_by' => null]);
            UnitKerja::onlyTrashed()->restore();

            IndeksSurat::onlyTrashed()->update(['deleted_by' => null]);
            IndeksSurat::onlyTrashed()->restore();

            WilayahProvinsi::onlyTrashed()->restore();
            WilayahKabupaten::onlyTrashed()->restore();
            WilayahKecamatan::onlyTrashed()->restore();
            WilayahDesa::onlyTrashed()->restore();

            DB::commit();
            CacheHelper::flush(['master_archive']);

            $total = array_sum($counts);
            return redirect()->back()
                ->with('success', "{$total} data berhasil dipulihkan.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal memulihkan semua data: ' . $e->getMessage());
        }
    }

    /**
     * Permanently delete all archived data master resources.
     */
    public function forceDeleteAll()
    {
        DB::beginTransaction();
        try {
            $counts = [
                'unit_kerja' => UnitKerja::onlyTrashed()->count(),
                'indeks_surat' => IndeksSurat::onlyTrashed()->count(),
                'provinsi' => WilayahProvinsi::onlyTrashed()->count(),
                'kabupaten' => WilayahKabupaten::onlyTrashed()->count(),
                'kecamatan' => WilayahKecamatan::onlyTrashed()->count(),
                'desa' => WilayahDesa::onlyTrashed()->count(),
            ];

            // Delete all permanently (order matters for foreign keys: desa -> kecamatan -> kabupaten -> provinsi)
            WilayahDesa::onlyTrashed()->forceDelete();
            WilayahKecamatan::onlyTrashed()->forceDelete();
            WilayahKabupaten::onlyTrashed()->forceDelete();
            WilayahProvinsi::onlyTrashed()->forceDelete();

            IndeksSurat::onlyTrashed()->forceDelete();
            UnitKerja::onlyTrashed()->forceDelete();

            DB::commit();
            CacheHelper::flush(['master_archive']);

            $total = array_sum($counts);
            return redirect()->back()
                ->with('success', "{$total} data berhasil dihapus permanen.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal menghapus semua data: ' . $e->getMessage());
        }
    }
}

