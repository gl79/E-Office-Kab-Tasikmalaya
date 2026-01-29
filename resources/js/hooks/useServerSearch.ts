import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

interface UseServerSearchProps {
    url: string;
    initialSearch?: string;
    filters?: Record<string, any>;
    delay?: number;
}

export function useServerSearch({ 
    url, 
    initialSearch = '', 
    filters = {}, 
    delay = 300 
}: UseServerSearchProps) {
    const [search, setSearch] = useState(initialSearch);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const handler = setTimeout(() => {
            router.get(
                url,
                { 
                    search: search,
                    ...filters,
                    page: 1 // Reset to page 1 on new search
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [search, JSON.stringify(filters)]);

    return {
        search,
        setSearch,
    };
}
