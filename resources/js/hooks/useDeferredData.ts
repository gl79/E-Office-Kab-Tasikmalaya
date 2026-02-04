import { useState, useEffect } from 'react';
import { useMemoryCache } from './useMemoryCache';

/**
 * Custom hook for handling Inertia deferred props with memory caching.
 * Eliminates boilerplate pattern of combining deferred props with cache.
 *
 * @param cacheKey - Unique key for caching (should include user ID for isolation)
 * @param deferredProps - The deferred props from Inertia (may be undefined initially)
 * @param ttlMs - Time to live in milliseconds (default: 60000 = 1 minute)
 * @returns The data (from props, cache, or undefined if still loading)
 *
 * @example
 * const { auth } = usePage<PageProps>().props;
 * const suratMasuk = useDeferredData(
 *     `surat_masuk_${auth.user.id}`,
 *     deferredSuratMasuk,
 *     60_000
 * );
 *
 * if (!suratMasuk) return <LoadingShimmer />;
 */
export function useDeferredData<T>(
    cacheKey: string,
    deferredProps: T | undefined,
    ttlMs: number = 60_000
): T | undefined {
    const { read, write } = useMemoryCache<T>(cacheKey, ttlMs);
    const cachedData = read();

    // Initialize state with deferred props or cached data
    const [data, setData] = useState<T | undefined>(
        () => deferredProps ?? cachedData ?? undefined
    );

    // Update state and cache when deferred props arrive
    useEffect(() => {
        if (deferredProps !== undefined) {
            setData(deferredProps);
            write(deferredProps);
        }
    }, [deferredProps, write]);

    return data;
}

/**
 * Variant that returns both data and loading state
 *
 * @example
 * const { data: suratMasuk, isLoading } = useDeferredDataWithLoading(
 *     `surat_masuk_${auth.user.id}`,
 *     deferredSuratMasuk
 * );
 */
export function useDeferredDataWithLoading<T>(
    cacheKey: string,
    deferredProps: T | undefined,
    ttlMs: number = 60_000
): { data: T | undefined; isLoading: boolean; hasCached: boolean } {
    const { read, write } = useMemoryCache<T>(cacheKey, ttlMs);
    const cachedData = read();
    const hasCached = cachedData !== null;

    const [data, setData] = useState<T | undefined>(
        () => deferredProps ?? cachedData ?? undefined
    );

    useEffect(() => {
        if (deferredProps !== undefined) {
            setData(deferredProps);
            write(deferredProps);
        }
    }, [deferredProps, write]);

    const isLoading = data === undefined;

    return { data, isLoading, hasCached };
}

/**
 * Variant with mutable state - allows manual updates (e.g., after delete operations)
 * Returns setData and updateAndCache for optimistic UI updates
 *
 * @example
 * const { data: suratMasuk, setData, updateAndCache, isLoading, hasCached } = useDeferredDataMutable(
 *     `surat_masuk_${auth.user.id}`,
 *     deferredSuratMasuk
 * );
 *
 * // After successful delete:
 * setData(prev => prev.filter(item => item.id !== deletedId));
 * // Or with cache update:
 * updateAndCache(prev => prev.filter(item => item.id !== deletedId));
 */
export function useDeferredDataMutable<T>(
    cacheKey: string,
    deferredProps: T | undefined,
    ttlMs: number = 60_000
): {
    data: T | undefined;
    setData: React.Dispatch<React.SetStateAction<T | undefined>>;
    updateAndCache: (updater: (prev: T) => T) => void;
    isLoading: boolean;
    hasCached: boolean;
} {
    const { read, write } = useMemoryCache<T>(cacheKey, ttlMs);
    const cachedData = read();
    const hasCached = cachedData !== null;

    const [data, setData] = useState<T | undefined>(
        () => deferredProps ?? cachedData ?? undefined
    );

    useEffect(() => {
        if (deferredProps !== undefined) {
            setData(deferredProps);
            write(deferredProps);
        }
    }, [deferredProps, write]);

    const updateAndCache = (updater: (prev: T) => T) => {
        setData(prev => {
            if (prev === undefined) return prev;
            const next = updater(prev);
            write(next);
            return next;
        });
    };

    const isLoading = data === undefined;

    return { data, setData, updateAndCache, isLoading, hasCached };
}

export default useDeferredData;
