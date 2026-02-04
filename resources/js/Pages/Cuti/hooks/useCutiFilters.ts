import { useMemo, useState } from 'react';
import type { CutiItem } from '@/types/cuti';

interface CutiFilterOptions {
    initialSearch?: string;
    initialStatus?: string;
    itemsPerPage?: number;
}

export function useCutiFilters(
    data: CutiItem[],
    options: CutiFilterOptions = {}
) {
    const [search, setSearch] = useState(options.initialSearch ?? '');
    const [status, setStatus] = useState(options.initialStatus ?? '');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = options.itemsPerPage ?? 10;

    const filteredData = useMemo(() => {
        const lowerSearch = search.toLowerCase();

        return data.filter((item) => {
            const matchesSearch = !search || [
                item.pegawai?.name,
                item.pegawai?.nip,
                item.pegawai?.jabatan,
                item.atasan?.name,
                item.atasan?.nip,
                item.jenis_cuti,
                item.alasan_cuti,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(lowerSearch));

            const matchesStatus = !status || item.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [data, search, status]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

    const updateSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const updateStatus = (value: string) => {
        setStatus(value);
        setCurrentPage(1);
    };

    return {
        search,
        status,
        currentPage,
        itemsPerPage,
        filteredData,
        paginatedData,
        totalPages,
        setCurrentPage,
        setSearch: updateSearch,
        setStatus: updateStatus,
    };
}
