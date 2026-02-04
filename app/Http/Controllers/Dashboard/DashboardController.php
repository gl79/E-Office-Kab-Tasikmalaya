<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\IndeksSurat;
use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use App\Models\UnitKerja;
use App\Models\User;
use App\Models\WilayahDesa;
use App\Models\WilayahKabupaten;
use App\Models\WilayahKecamatan;
use App\Models\WilayahProvinsi;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with cached statistics.
     */
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => Inertia::defer(function () {
                // Cache dashboard stats for 5 minutes to reduce database queries
                return Cache::remember('dashboard_stats', 60, function () {
                    return $this->calculateStats();
                });
            }),
        ]);
    }

    /**
     * Calculate all dashboard statistics.
     */
    protected function calculateStats(): array
    {
        // Count archived items from Master Data
        $masterArchiveCount =
            User::onlyTrashed()->count() +
            UnitKerja::onlyTrashed()->count() +
            IndeksSurat::onlyTrashed()->count() +
            WilayahProvinsi::onlyTrashed()->count() +
            WilayahKabupaten::onlyTrashed()->count() +
            WilayahKecamatan::onlyTrashed()->count() +
            WilayahDesa::onlyTrashed()->count();

        // Count archived items from Persuratan
        $persuratanArchiveCount =
            SuratMasuk::onlyTrashed()->count() +
            SuratKeluar::onlyTrashed()->count();

        return [
            'wilayah' => [
                'provinsi' => WilayahProvinsi::count(),
                'kabupaten' => WilayahKabupaten::count(),
                'kecamatan' => WilayahKecamatan::count(),
                'desa' => WilayahDesa::count(),
            ],
            'master' => [
                'pengguna' => User::count(),
                'unit_kerja' => UnitKerja::count(),
                'indeks_surat' => IndeksSurat::count(),
            ],
            'persuratan' => [
                'surat_masuk' => SuratMasuk::count(),
                'surat_keluar' => SuratKeluar::count(),
            ],
            'archive' => [
                'master' => $masterArchiveCount,
                'persuratan' => $persuratanArchiveCount,
                'total' => $masterArchiveCount + $persuratanArchiveCount,
            ],
        ];
    }

    /**
     * Clear dashboard cache (useful after data changes).
     */
    public static function clearCache(): void
    {
        Cache::forget('dashboard_stats');
    }
}
