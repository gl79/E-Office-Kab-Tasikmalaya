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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with cached statistics.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'stats' => Inertia::defer(function () use ($user) {
                $cacheKey = 'dashboard_stats_' . $user->id;

                return Cache::remember($cacheKey, 60, function () use ($user) {
                    return $this->calculateStats($user);
                });
            }),
        ]);
    }

    /**
     * Calculate dashboard statistics based on user role.
     */
    protected function calculateStats(User $user): array
    {
        $isAdmin = $user->isSuperAdmin() || $user->isTU();

        // Surat masuk count: admin sees all, others see only addressed to them
        if ($isAdmin) {
            $suratMasukCount = SuratMasuk::count();
        } else {
            $suratMasukCount = SuratMasuk::whereHas('tujuans', function ($q) use ($user) {
                $q->where('tujuan_id', $user->id);
            })->count();
        }

        $suratKeluarCount = SuratKeluar::count();

        $stats = [
            'persuratan' => [
                'surat_masuk' => $suratMasukCount,
                'surat_keluar' => $suratKeluarCount,
            ],
        ];

        // Admin/TU get full stats
        if ($isAdmin) {
            $masterArchiveCount =
                User::onlyTrashed()->count() +
                UnitKerja::onlyTrashed()->count() +
                IndeksSurat::onlyTrashed()->count() +
                WilayahProvinsi::onlyTrashed()->count() +
                WilayahKabupaten::onlyTrashed()->count() +
                WilayahKecamatan::onlyTrashed()->count() +
                WilayahDesa::onlyTrashed()->count();

            $persuratanArchiveCount =
                SuratMasuk::onlyTrashed()->count() +
                SuratKeluar::onlyTrashed()->count();

            $stats['wilayah'] = [
                'provinsi' => WilayahProvinsi::count(),
                'kabupaten' => WilayahKabupaten::count(),
                'kecamatan' => WilayahKecamatan::count(),
                'desa' => WilayahDesa::count(),
            ];
            $stats['master'] = [
                'pengguna' => User::count(),
                'unit_kerja' => UnitKerja::count(),
                'indeks_surat' => IndeksSurat::count(),
            ];
            $stats['archive'] = [
                'master' => $masterArchiveCount,
                'persuratan' => $persuratanArchiveCount,
                'total' => $masterArchiveCount + $persuratanArchiveCount,
            ];
        }

        return $stats;
    }

    /**
     * Clear dashboard cache (useful after data changes).
     */
    public static function clearCache(): void
    {
        // Clear all dashboard caches by forgetting the pattern
        Cache::forget('dashboard_stats');

        // Also clear per-user caches
        $userIds = User::pluck('id');
        foreach ($userIds as $id) {
            Cache::forget('dashboard_stats_' . $id);
        }
    }
}
