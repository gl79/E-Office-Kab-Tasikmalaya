<?php

namespace App\Support;

use Illuminate\Cache\TaggableStore;
use Illuminate\Cache\TaggedCache;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheHelper
{
    /**
     * Cache key prefixes for each tag group.
     * Used for key-based invalidation when tagging is not supported.
     */
    private static array $tagKeyPrefixes = [
        'penjadwalan' => [
            'jadwal_index_',
            'tentatif_menunggu_',
            'tentatif_sudah_',
            'calendar_data_',
        ],
        'persuratan_list' => [
            'surat_masuk_list',
            'surat_keluar_list',
        ],
        'persuratan_archive' => [
            'persuratan_archive_',
        ],
        'dashboard' => [
            'dashboard_stats',
        ],
        'cuti' => [
            'cuti_index_',
            'cuti_archive_',
        ],
    ];

    /**
     * Return a cache repository with tags if supported, otherwise fallback.
     *
     * @param array<int, string> $tags
     * @return Repository|TaggedCache
     */
    public static function tags(array $tags): Repository|TaggedCache
    {
        $store = Cache::getStore();

        if ($store instanceof TaggableStore) {
            return Cache::tags($tags);
        }

        return Cache::store();
    }

    /**
     * Check if the current cache store supports tagging.
     */
    public static function supportsTagging(): bool
    {
        return Cache::getStore() instanceof TaggableStore;
    }

    /**
     * Flush cache for tags if supported.
     * When tagging is not supported, attempts to forget known cache keys
     * associated with the given tags instead of flushing entire cache.
     *
     * @param array<int, string> $tags
     */
    public static function flush(array $tags): void
    {
        $store = Cache::getStore();

        if ($store instanceof TaggableStore) {
            Cache::tags($tags)->flush();
            return;
        }

        // Fallback: forget known cache keys for these tags
        // This is safer than flushing the entire cache
        self::forgetKeysByTags($tags);
    }

    /**
     * Forget cache keys associated with given tags.
     * Used as fallback when cache tagging is not supported.
     *
     * @param array<int, string> $tags
     */
    private static function forgetKeysByTags(array $tags): void
    {
        $forgottenKeys = [];

        foreach ($tags as $tag) {
            if (isset(self::$tagKeyPrefixes[$tag])) {
                foreach (self::$tagKeyPrefixes[$tag] as $keyPrefix) {
                    // For exact keys (no underscore at end), forget directly
                    if (!str_ends_with($keyPrefix, '_')) {
                        Cache::forget($keyPrefix);
                        $forgottenKeys[] = $keyPrefix;
                    }
                    // For prefixed keys, we log a warning since we can't enumerate them
                    // In production, consider using Redis SCAN or a key registry
                }
            }
        }

        if (count($forgottenKeys) > 0) {
            Log::debug('CacheHelper: Forgot cache keys', [
                'tags' => $tags,
                'keys' => $forgottenKeys,
            ]);
        } else {
            Log::warning('CacheHelper: No cache keys found for tags (tagging not supported)', [
                'tags' => $tags,
                'hint' => 'Consider using Redis or Memcached for tag support',
            ]);
        }
    }

    /**
     * Forget a specific cache key.
     */
    public static function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Remember a value in cache with optional tags.
     *
     * @param array<int, string> $tags
     * @param string $key
     * @param int $ttl Time to live in seconds
     * @param callable $callback
     * @return mixed
     */
    public static function remember(array $tags, string $key, int $ttl, callable $callback): mixed
    {
        return self::tags($tags)->remember($key, $ttl, $callback);
    }
}
