import { useEffect, useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Eye, RotateCcw, Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge, Button, Modal, Pagination } from '@/Components/ui';
import { FormSelect, TextInput } from '@/Components/form';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataWithLoading } from '@/hooks';
import type { PageProps } from '@/types';
import { getDisposisiLabel, getDisposisiVariant, getPenjadwalanFormalStatusLabel, getPenjadwalanFormalStatusVariant } from '@/utils/badgeVariants';

interface HistoryChange {
    field: string;
    label: string;
    old_value: string;
    new_value: string;
}

interface JadwalHistoryItem {
    id: string;
    changed_by: { id: number; name: string } | null;
    created_at_formatted: string | null;
    changes: HistoryChange[];
}

interface PenjadwalanHistoryItem {
    id: string;
    nama_kegiatan: string;
    tanggal_agenda_formatted: string;
    waktu_lengkap: string;
    status_formal: string;
    status_disposisi: string;
    dihadiri_oleh: string | null;
    surat_masuk: {
        id: string;
        nomor_agenda: string;
        nomor_surat: string;
        asal_surat: string;
        perihal: string;
    } | null;
    created_by: { id: number; name: string } | null;
    created_at_formatted: string | null;
    updated_at_formatted: string | null;
    histories: JadwalHistoryItem[];
}

interface PaginatedHistories {
    data: PenjadwalanHistoryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props extends PageProps {
    histories?: PaginatedHistories;
    statusFormalOptions: Record<string, string>;
    filters: {
        search?: string;
        status_formal?: string;
    };
}

const CACHE_TTL_MS = 60_000;

export default function Index({
    histories: initialHistories,
    statusFormalOptions,
    filters,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const cacheKey = `penjadwalan_history_${auth.user.id}_${filters.search ?? ''}_${filters.status_formal ?? ''}_${initialHistories?.current_page ?? 1}`;
    const {
        data: historiesData,
        isLoading,
        hasCached,
    } = useDeferredDataWithLoading<PaginatedHistories>(cacheKey, initialHistories, CACHE_TTL_MS);

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFormal, setStatusFormal] = useState(filters.status_formal ?? '');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PenjadwalanHistoryItem | null>(null);
    const [isSyncingSearch, setIsSyncingSearch] = useState(false);

    const rows = historiesData?.data ?? [];
    const currentPage = historiesData?.current_page ?? 1;
    const totalPages = historiesData?.last_page ?? 1;
    const perPage = historiesData?.per_page ?? 10;
    const total = historiesData?.total ?? 0;

    const statusFormalSelectOptions = useMemo(
        () => [
            { value: '', label: 'Semua Status' },
            ...Object.entries(statusFormalOptions).map(([value, label]) => ({
                value,
                label,
            })),
        ],
        [statusFormalOptions]
    );

    const navigateWithFilters = (nextSearch: string, nextStatusFormal: string, page = 1) => {
        router.get(
            route('penjadwalan.history.index'),
            {
                search: nextSearch || undefined,
                status_formal: nextStatusFormal || undefined,
                page,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        setIsSyncingSearch(true);

        const timer = window.setTimeout(() => {
            navigateWithFilters(search, statusFormal, 1);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [search, statusFormal, filters.search]);

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatusFormal(filters.status_formal ?? '');
        setIsSyncingSearch(false);
    }, [filters.search, filters.status_formal]);

    const handleStatusFormalChange = (value: string) => {
        setStatusFormal(value);
        navigateWithFilters(search, value, 1);
    };

    const resetFilter = () => {
        setSearch('');
        setStatusFormal('');
        navigateWithFilters('', '', 1);
    };

    const changePage = (page: number) => {
        navigateWithFilters(search, statusFormal, page);
    };

    return (
        <>
            <Head title="History Penjadwalan" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">History Penjadwalan</h1>
                <p className="mt-1 text-sm text-text-secondary">Riwayat penjadwalan surat dan seluruh perubahan jadwal</p>
            </div>

            <div className="rounded-lg border border-border-default bg-surface">
                <div className="border-b border-border-default p-4">
                    <div className="space-y-3">
                        <div className="flex gap-2 max-w-md">
                            <TextInput
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nomor agenda, nomor surat, perihal..."
                                className="w-full px-3"
                            />
                            <Button variant="secondary" disabled>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,320px)_auto] sm:items-center">
                            <FormSelect
                                options={statusFormalSelectOptions}
                                value={statusFormal}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusFormalChange(e.target.value)}
                                className="w-full px-2"
                            />
                            <Button variant="secondary" onClick={resetFilter} className="gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </Button>
                        </div>

                        {isSyncingSearch && (
                            <p className="text-xs text-text-secondary">Mencari data...</p>
                        )}
                    </div>
                </div>

                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={7} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-border-default">
                            <thead className="bg-surface-hover">
                                <tr>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold uppercase text-text-secondary">No</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">Data Surat</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">Tanggal Penjadwalan</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">Status</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">User Penjadwal</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">Waktu</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold uppercase text-text-secondary">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface">
                                {rows.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-surface-hover">
                                        <td className="border border-border-default px-4 py-3 text-center text-sm text-text-secondary">
                                            {(currentPage - 1) * perPage + index + 1}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="font-medium text-text-primary">{item.surat_masuk?.nomor_agenda ?? '-'}</div>
                                            <div className="text-xs text-text-secondary">{item.surat_masuk?.nomor_surat ?? '-'}</div>
                                            <div className="line-clamp-1 text-xs text-text-secondary">{item.surat_masuk?.perihal ?? '-'}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm text-text-primary">
                                            <div>{item.tanggal_agenda_formatted}</div>
                                            <div className="text-xs text-text-secondary">{item.waktu_lengkap}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="flex flex-wrap gap-1">
                                                <Badge variant={getPenjadwalanFormalStatusVariant(item.status_formal)}>
                                                    {getPenjadwalanFormalStatusLabel(item.status_formal)}
                                                </Badge>
                                                <Badge variant={getDisposisiVariant(item.status_disposisi)}>
                                                    {getDisposisiLabel(item.status_disposisi)}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm text-text-primary">
                                            {item.created_by?.name ?? '-'}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="text-text-secondary">Dibuat: {item.created_at_formatted ?? '-'}</div>
                                            <div className="text-text-secondary">Diubah: {item.updated_at_formatted ?? '-'}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setDetailModalOpen(true);
                                                }}
                                                className="gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Detail
                                            </Button>
                                        </td>
                                    </tr>
                                ))}

                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="border border-border-default px-4 py-8 text-center text-text-secondary">
                                            Tidak ada data history penjadwalan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-border-default p-4">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-text-secondary">
                            Menampilkan {rows.length} data dari total {total} data
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={changePage}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Riwayat Edit Jadwal"
                size="xl"
            >
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-border-default bg-surface-hover p-4 text-sm">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <p className="text-text-primary"><span className="text-text-secondary">Nomor Agenda:</span> {selectedItem.surat_masuk?.nomor_agenda ?? '-'}</p>
                                <p className="text-text-primary"><span className="text-text-secondary">Nomor Surat:</span> {selectedItem.surat_masuk?.nomor_surat ?? '-'}</p>
                                <p className="text-text-primary sm:col-span-2"><span className="text-text-secondary">Perihal:</span> {selectedItem.surat_masuk?.perihal ?? '-'}</p>
                            </div>
                        </div>

                        {selectedItem.histories.length > 0 ? (
                            <div className="space-y-3">
                                {selectedItem.histories.map((history, idx) => (
                                    <div key={history.id} className="rounded-lg border border-border-default p-4">
                                        <div className="mb-3 text-sm text-text-secondary">
                                            Edit #{idx + 1} oleh <span className="font-medium text-text-primary">{history.changed_by?.name ?? 'Sistem'}</span> pada {history.created_at_formatted ?? '-'}
                                        </div>
                                        {history.changes.length > 0 ? (
                                            <div className="space-y-2">
                                                {history.changes.map((change) => (
                                                    <div key={`${history.id}-${change.field}`} className="rounded border border-border-default bg-surface-hover p-3 text-sm">
                                                        <p className="font-medium text-text-primary">{change.label}</p>
                                                        <p className="text-text-secondary">Sebelum: {change.old_value}</p>
                                                        <p className="text-text-secondary">Sesudah: {change.new_value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-text-secondary">Tidak ada perubahan field terdeteksi.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-secondary">Belum ada riwayat perubahan untuk jadwal ini.</p>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
