import { useEffect, useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Eye, Filter, RotateCcw } from 'lucide-react';
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

const formatNoAgenda = (nomor?: string | null): string => {
    if (!nomor) return '-';
    const parts = nomor.split('/');
    return parts.length >= 2 ? parts[1] : nomor;
};

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
    const [showFilters, setShowFilters] = useState(!!(filters.status_formal));
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PenjadwalanHistoryItem | null>(null);
    const [isSyncingSearch, setIsSyncingSearch] = useState(false);

    const rows = historiesData?.data ?? [];
    const currentPage = historiesData?.current_page ?? 1;
    const totalPages = historiesData?.last_page ?? 1;
    const perPage = historiesData?.per_page ?? 10;
    const total = historiesData?.total ?? 0;

    const hasActiveFilters = !!(search || statusFormal);

    const statusFormalSelectOptions = useMemo(
        () =>
            Object.entries(statusFormalOptions).map(([value, label]) => ({
                value,
                label,
            })),
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
                {/* Toolbar */}
                <div className="border-b border-border-default p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-2 flex-1 max-w-2xl">
                                <TextInput
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nomor agenda, nomor surat, perihal..."
                                    className="w-full px-3"
                                />
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowFilters(!showFilters)}
                                    title="Filter Lanjutan"
                                    className="gap-2"
                                >
                                    <Filter className={`h-4 w-4 ${showFilters ? 'text-primary' : ''}`} />
                                    <span>Filter</span>
                                </Button>
                            </div>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <div className="p-4 bg-surface-hover rounded-lg border border-border-default animate-in fade-in slide-in-from-top-2 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">
                                            Status Jadwal
                                        </label>
                                        <FormSelect
                                            options={statusFormalSelectOptions}
                                            value={statusFormal}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusFormalChange(e.target.value)}
                                            placeholder="Semua Status"
                                            className="w-full px-2 text-sm"
                                        />
                                    </div>
                                </div>
                                {hasActiveFilters && (
                                    <div className="flex justify-end">
                                        <Button variant="secondary" size="sm" onClick={resetFilter} className="gap-2">
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            Reset Filter
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {isSyncingSearch && (
                            <p className="text-xs text-text-secondary">Mencari data...</p>
                        )}
                    </div>
                </div>

                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={7} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-border-default">
                            <thead className="bg-surface-hover">
                                <tr>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold uppercase text-text-secondary w-12">No</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">Data Surat</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">Kegiatan</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">Tanggal / Waktu</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">Status</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">Penjadwal</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold uppercase text-text-secondary w-20">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface">
                                {rows.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-surface-hover">
                                        <td className="border border-border-default px-4 py-3 text-center text-sm text-text-secondary">
                                            {(currentPage - 1) * perPage + index + 1}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="font-medium text-text-primary">
                                                {formatNoAgenda(item.surat_masuk?.nomor_agenda)}
                                            </div>
                                            <div className="text-xs text-text-secondary mt-0.5">{item.surat_masuk?.nomor_surat ?? '-'}</div>
                                            <div className="text-xs text-text-secondary italic line-clamp-1 mt-0.5">{item.surat_masuk?.perihal ?? '-'}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="font-medium text-text-primary line-clamp-2">{item.nama_kegiatan}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm text-text-primary">
                                            <div>{item.tanggal_agenda_formatted}</div>
                                            <div className="text-xs text-text-secondary mt-0.5">{item.waktu_lengkap}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant={getPenjadwalanFormalStatusVariant(item.status_formal)}>
                                                    {getPenjadwalanFormalStatusLabel(item.status_formal)}
                                                </Badge>
                                                <Badge variant={getDisposisiVariant(item.status_disposisi)}>
                                                    {getDisposisiLabel(item.status_disposisi)}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="font-medium text-text-primary">{item.created_by?.name ?? '-'}</div>
                                            <div className="text-xs text-text-secondary mt-0.5">Dibuat: {item.created_at_formatted ?? '-'}</div>
                                            <div className="text-xs text-text-secondary">Diubah: {item.updated_at_formatted ?? '-'}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setDetailModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border-default bg-surface hover:bg-surface-hover text-text-primary transition-colors"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="border border-border-default px-4 py-8 text-center text-text-secondary">
                                            {hasActiveFilters ? 'Tidak ada data yang cocok dengan filter.' : 'Tidak ada data history penjadwalan.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="border-t border-border-default p-4">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-text-secondary">
                            Menampilkan {rows.length} dari {total} data
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={changePage}
                        />
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Riwayat Edit Jadwal"
                size="xl"
            >
                {selectedItem && (
                    <div className="space-y-5">
                        {/* Identitas Surat */}
                        <div>
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Identitas Surat</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-text-secondary">No Agenda</p>
                                    <p className="font-medium text-text-primary mt-0.5">
                                        {formatNoAgenda(selectedItem.surat_masuk?.nomor_agenda)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-text-secondary">Nomor Surat</p>
                                    <p className="font-medium text-text-primary mt-0.5">{selectedItem.surat_masuk?.nomor_surat ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary">Asal Surat</p>
                                    <p className="font-medium text-text-primary mt-0.5">{selectedItem.surat_masuk?.asal_surat ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary">Perihal</p>
                                    <p className="font-medium text-text-primary mt-0.5">{selectedItem.surat_masuk?.perihal ?? '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detail Jadwal */}
                        <div className="pt-4 border-t border-border-default">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Detail Jadwal</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="sm:col-span-2">
                                    <p className="text-text-secondary">Nama Kegiatan</p>
                                    <p className="font-medium text-text-primary mt-0.5">{selectedItem.nama_kegiatan}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary">Tanggal</p>
                                    <p className="font-medium text-text-primary mt-0.5">{selectedItem.tanggal_agenda_formatted}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary">Waktu</p>
                                    <p className="font-medium text-text-primary mt-0.5">{selectedItem.waktu_lengkap} WIB</p>
                                </div>
                                {selectedItem.dihadiri_oleh && (
                                    <div>
                                        <p className="text-text-secondary">Dihadiri Oleh</p>
                                        <p className="font-medium text-text-primary mt-0.5">{selectedItem.dihadiri_oleh}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-text-secondary">Status Jadwal</p>
                                    <div className="mt-1">
                                        <Badge variant={getPenjadwalanFormalStatusVariant(selectedItem.status_formal)}>
                                            {getPenjadwalanFormalStatusLabel(selectedItem.status_formal)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-text-secondary">Status Disposisi</p>
                                    <div className="mt-1">
                                        <Badge variant={getDisposisiVariant(selectedItem.status_disposisi)}>
                                            {getDisposisiLabel(selectedItem.status_disposisi)}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-text-secondary">Penjadwal</p>
                                    <p className="font-medium text-text-primary mt-0.5">
                                        {selectedItem.created_by?.name ?? '-'}
                                        {selectedItem.created_at_formatted && (
                                            <span className="text-text-secondary font-normal ml-2">pada {selectedItem.created_at_formatted}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Riwayat Perubahan */}
                        <div className="pt-4 border-t border-border-default">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                                Riwayat Perubahan
                                {selectedItem.histories.length > 0 && (
                                    <span className="ml-2 normal-case font-normal text-text-muted">
                                        ({selectedItem.histories.length} kali edit)
                                    </span>
                                )}
                            </h3>

                            {selectedItem.histories.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedItem.histories.map((history, idx) => (
                                        <div key={history.id} className="rounded-lg border border-border-default overflow-hidden">
                                            <div className="bg-surface-hover px-4 py-2 text-xs text-text-secondary flex items-center justify-between">
                                                <span>
                                                    Edit ke-{idx + 1} oleh{' '}
                                                    <span className="font-medium text-text-primary">{history.changed_by?.name ?? 'Sistem'}</span>
                                                </span>
                                                <span>{history.created_at_formatted ?? '-'}</span>
                                            </div>
                                            {history.changes.length > 0 ? (
                                                <div className="divide-y divide-border-default">
                                                    {history.changes.map((change) => (
                                                        <div key={`${history.id}-${change.field}`} className="px-4 py-3 text-sm">
                                                            <p className="font-medium text-text-primary mb-2">{change.label}</p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="rounded border border-border-default bg-surface-hover px-3 py-2">
                                                                    <p className="text-xs text-text-secondary mb-1">Sebelum</p>
                                                                    <p className="text-text-primary">{change.old_value || '-'}</p>
                                                                </div>
                                                                <div className="rounded border border-primary/40 bg-surface px-3 py-2">
                                                                    <p className="text-xs text-text-secondary mb-1">Sesudah</p>
                                                                    <p className="text-text-primary font-medium">{change.new_value || '-'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="px-4 py-3 text-sm text-text-secondary">Tidak ada perubahan field terdeteksi.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary">Belum ada riwayat perubahan untuk jadwal ini.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
