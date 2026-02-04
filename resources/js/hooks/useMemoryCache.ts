import { useCallback } from 'react';

type CacheEntry<T> = {
    ts: number;
    data: T;
};

const memoryCache: Record<string, CacheEntry<unknown>> = {};

export function useMemoryCache<T>(key: string, ttlMs: number) {
    const read = useCallback((): T | null => {
        const entry = memoryCache[key] as CacheEntry<T> | undefined;
        if (!entry) return null;
        if (Date.now() - entry.ts > ttlMs) return null;
        return entry.data;
    }, [key, ttlMs]);

    const write = useCallback((data: T) => {
        memoryCache[key] = { ts: Date.now(), data };
    }, [key]);

    return { read, write };
}
