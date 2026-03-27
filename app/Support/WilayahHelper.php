<?php

namespace App\Support;

use App\Models\WilayahDesa;
use App\Models\WilayahKabupaten;
use App\Models\WilayahKecamatan;
use App\Models\WilayahProvinsi;
use Illuminate\Support\Facades\Cache;

/**
 * Helper class untuk operasi wilayah dengan caching.
 * Mengatasi N+1 query problem dengan batch loading dan caching.
 */
class WilayahHelper
{
    /**
     * Cache TTL in seconds (1 hour)
     */
    private const CACHE_TTL = 3600;

    /**
     * In-memory cache untuk request yang sama
     */
    private static ?array $memoryCache = null;

    /**
     * Get wilayah text from kode_wilayah dengan caching.
     * Format kode: xx.xx.xx.xxxx (provinsi.kabupaten.kecamatan.desa)
     *
     * @param string $kodeWilayah
     * @return string
     */
    public static function getWilayahText(string $kodeWilayah): string
    {
        $parts = explode('.', $kodeWilayah);

        if (count($parts) < 4) {
            return '';
        }

        [$provinsiKode, $kabupatenKode, $kecamatanKode, $desaKode] = $parts;

        // Load cache if not loaded
        self::loadCache();

        $names = [];

        // Lookup from cache (O(1) instead of database query)
        $desaKey = "{$provinsiKode}.{$kabupatenKode}.{$kecamatanKode}.{$desaKode}";
        $kecamatanKey = "{$provinsiKode}.{$kabupatenKode}.{$kecamatanKode}";
        $kabupatenKey = "{$provinsiKode}.{$kabupatenKode}";

        if (isset(self::$memoryCache['desa'][$desaKey])) {
            $names[] = self::$memoryCache['desa'][$desaKey];
        }

        if (isset(self::$memoryCache['kecamatan'][$kecamatanKey])) {
            $names[] = 'Kec. ' . self::$memoryCache['kecamatan'][$kecamatanKey];
        }

        if (isset(self::$memoryCache['kabupaten'][$kabupatenKey])) {
            $names[] = self::$memoryCache['kabupaten'][$kabupatenKey];
        }

        if (isset(self::$memoryCache['provinsi'][$provinsiKode])) {
            $names[] = self::$memoryCache['provinsi'][$provinsiKode];
        }

        return implode(', ', $names);
    }

    /**
     * Get detailed wilayah components.
     *
     * @param string $kodeWilayah
     * @return array{provinsi: ?string, kabupaten: ?string, kecamatan: ?string, desa: ?string}
     */
    public static function getWilayahDetails(string $kodeWilayah): array
    {
        $parts = explode('.', $kodeWilayah);

        $result = [
            'provinsi' => null,
            'kabupaten' => null,
            'kecamatan' => null,
            'desa' => null,
        ];

        if (count($parts) < 2) {
            return $result;
        }

        self::loadCache();

        $provinsiKode = $parts[0] ?? '';
        $kabupatenKode = $parts[1] ?? '';
        $kecamatanKode = $parts[2] ?? '';
        $desaKode = $parts[3] ?? '';

        $provinsiKey = $provinsiKode;
        $kabupatenKey = "{$provinsiKode}.{$kabupatenKode}";
        $kecamatanKey = "{$provinsiKode}.{$kabupatenKode}.{$kecamatanKode}";
        $desaKey = "{$provinsiKode}.{$kabupatenKode}.{$kecamatanKode}.{$desaKode}";

        if ($provinsiKode && isset(self::$memoryCache['provinsi'][$provinsiKey])) {
            $result['provinsi'] = self::$memoryCache['provinsi'][$provinsiKey];
        }

        if ($kabupatenKode && isset(self::$memoryCache['kabupaten'][$kabupatenKey])) {
            $result['kabupaten'] = self::$memoryCache['kabupaten'][$kabupatenKey];
        }

        if ($kecamatanKode && isset(self::$memoryCache['kecamatan'][$kecamatanKey])) {
            $result['kecamatan'] = self::$memoryCache['kecamatan'][$kecamatanKey];
        }

        if ($desaKode && isset(self::$memoryCache['desa'][$desaKey])) {
            $result['desa'] = self::$memoryCache['desa'][$desaKey];
        }

        return $result;
    }

    /**
     * Get latitude and longitude from kode wilayah.
     * Prioritizes Desa coordinate, fallbacks to Kecamatan.
     * 
     * @param string $kodeWilayah 
     * @return array{lat: float|null, lng: float|null}
     */
    public static function getWilayahCoordinates(string $kodeWilayah): array
    {
        $parts = explode('.', $kodeWilayah);
        $result = ['lat' => null, 'lng' => null];

        // Format is normally 32.06.xx.xxxx
        if (count($parts) < 3 || $parts[0] !== '32' || $parts[1] !== '06') {
            return $result;
        }

        $kecamatanKode = $parts[2];
        $desaKode = $parts[3] ?? '';

        // Try getting Desa coordinates first
        if ($desaKode !== '') {
            $desa = WilayahDesa::query()
                ->where('provinsi_kode', $parts[0])
                ->where('kabupaten_kode', $parts[1])
                ->where('kecamatan_kode', $kecamatanKode)
                ->where('kode', $desaKode)
                ->first(['latitude', 'longitude']);

            if ($desa && $desa->latitude && $desa->longitude) {
                $result['lat'] = (float) $desa->latitude;
                $result['lng'] = (float) $desa->longitude;
                return $result;
            }
        }

        // Fallback to Kecamatan
        $kecamatan = WilayahKecamatan::query()
            ->where('provinsi_kode', $parts[0])
            ->where('kabupaten_kode', $parts[1])
            ->where('kode', $kecamatanKode)
            ->first(['latitude', 'longitude']);

        if ($kecamatan && $kecamatan->latitude && $kecamatan->longitude) {
            $result['lat'] = (float) $kecamatan->latitude;
            $result['lng'] = (float) $kecamatan->longitude;
        }

        return $result;
    }

    /**
     * Get individual wilayah name by type and kode.
     *
     * @param string $type provinsi|kabupaten|kecamatan|desa
     * @param string $kode Full kode wilayah
     * @return string|null
     */
    public static function getName(string $type, string $kode): ?string
    {
        self::loadCache();

        return self::$memoryCache[$type][$kode] ?? null;
    }

    /**
     * Load wilayah data into cache.
     * Uses Laravel Cache for persistence + in-memory cache for current request.
     */
    private static function loadCache(): void
    {
        if (self::$memoryCache !== null) {
            return;
        }

        self::$memoryCache = Cache::remember('wilayah_lookup_cache', self::CACHE_TTL, function () {
            return [
                'provinsi' => self::loadProvinsi(),
                'kabupaten' => self::loadKabupaten(),
                'kecamatan' => self::loadKecamatan(),
                'desa' => self::loadDesa(),
            ];
        });
    }

    /**
     * Load provinsi data: kode => nama
     */
    private static function loadProvinsi(): array
    {
        return WilayahProvinsi::pluck('nama', 'kode')->toArray();
    }

    /**
     * Load kabupaten data: "provinsi_kode.kode" => nama
     */
    private static function loadKabupaten(): array
    {
        return WilayahKabupaten::get(['provinsi_kode', 'kode', 'nama'])
            ->mapWithKeys(fn($item) => [
                "{$item->provinsi_kode}.{$item->kode}" => $item->nama
            ])
            ->toArray();
    }

    /**
     * Load kecamatan data: "provinsi_kode.kabupaten_kode.kode" => nama
     */
    private static function loadKecamatan(): array
    {
        return WilayahKecamatan::get(['provinsi_kode', 'kabupaten_kode', 'kode', 'nama'])
            ->mapWithKeys(fn($item) => [
                "{$item->provinsi_kode}.{$item->kabupaten_kode}.{$item->kode}" => $item->nama
            ])
            ->toArray();
    }

    /**
     * Load desa data: "provinsi_kode.kabupaten_kode.kecamatan_kode.kode" => nama
     */
    private static function loadDesa(): array
    {
        return WilayahDesa::get(['provinsi_kode', 'kabupaten_kode', 'kecamatan_kode', 'kode', 'nama'])
            ->mapWithKeys(fn($item) => [
                "{$item->provinsi_kode}.{$item->kabupaten_kode}.{$item->kecamatan_kode}.{$item->kode}" => $item->nama
            ])
            ->toArray();
    }

    /**
     * Clear wilayah cache.
     * Call this when wilayah data is updated.
     */
    public static function clearCache(): void
    {
        Cache::forget('wilayah_lookup_cache');
        self::$memoryCache = null;
    }

    /**
     * Preload cache (useful for batch operations).
     */
    public static function preload(): void
    {
        self::loadCache();
    }
}
