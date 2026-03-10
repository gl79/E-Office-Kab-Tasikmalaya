import { useMemo, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Eye, Filter, RotateCcw, ExternalLink } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge, Button, Modal, Pagination } from '@/Components/ui';
import { FormSelect, TextInput } from '@/Components/form';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks';
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
    status: string;
    status_label: string;
    status_formal: string;
    status_formal_label: string;
    status_disposisi: string;
    status_disposisi_label: string;
    sumber_jadwal: string | null;
    sumber_jadwal_label: string | null;
    dihadiri_oleh: string | null;
    surat_masuk: {
        id: string;
        nomor_agenda: string;
        nomor_surat: string;
        asal_surat: string;
        perihal: string;
    } | null;
    created_by: { id: number; name: string } | null;
    updated_by: { id: number; name: string } | null;
    created_at_formatted: string | null;
    updated_at_formatted: string | null;
    file_path: string | null;
    file_url: string | null;
    histories: JadwalHistoryItem[];
}

interface Props extends PageProps {
    histories?: PenjadwalanHistoryItem[];
    statusFormalOptions: Record<string, string>;
}

const formatNoAgenda = (nomor?: string | null): string => {
    if (!nomor) return '-';
    const parts = nomor.split('/');
    return parts.length >= 2 ? parts[1] : nomor;
};

export default function Index({
    histories: initialHistories,
    statusFormalOptions,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const cacheKey = `penjadwalan_history_${auth.user.id}`;

    const {
        data: allData,
        isLoading,
        hasCached,
    } = useDeferredDataMutable<PenjadwalanHistoryItem[]>(cacheKey, initialHistories);

    // Client-side search & filter state
    const [search, setSearch] = useState('');
    const [statusFormal, setStatusFormal] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Detail modal state
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PenjadwalanHistoryItem | null>(null);

    const hasActiveFilters = !!(search || statusFormal);

    const statusFormalSelectOptions = useMemo(
        () =>
            Object.entries(statusFormalOptions).map(([value, label]) => ({
                value,
                label,
            })),
        [statusFormalOptions]
    );

    // Client-side filtering — instant, no delay, no URL change
    const filteredData = useMemo(() => {
        if (!allData) return [];
        let data = allData;

        // Search filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter((item) =>
                item.nama_kegiatan?.toLowerCase().includes(lowerSearch) ||
                item.surat_masuk?.nomor_agenda?.toLowerCase().includes(lowerSearch) ||
                item.surat_masuk?.nomor_surat?.toLowerCase().includes(lowerSearch) ||
                item.surat_masuk?.asal_surat?.toLowerCase().includes(lowerSearch) ||
                item.surat_masuk?.perihal?.toLowerCase().includes(lowerSearch)
            );
        }

        // Status formal filter
        if (statusFormal) {
            data = data.filter((item) => item.status_formal === statusFormal);
        }

        return data;
    }, [allData, search, statusFormal]);

    // Client-side pagination
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFormal(e.target.value);
        setCurrentPage(1);
    };

    const resetFilter = () => {
        setSearch('');
        setStatusFormal('');
        setCurrentPage(1);
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
                                    onChange={handleSearchChange}
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
                                            onChange={handleStatusChange}
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
                                {paginatedData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-surface-hover">
                                        <td className="border border-border-default px-4 py-3 text-center text-sm text-text-secondary">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
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
                                            {item.sumber_jadwal_label && item.sumber_jadwal !== 'disposisi' && (
                                                <div className="text-[10px] text-text-muted italic mt-0.5">{item.sumber_jadwal_label}</div>
                                            )}
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

                                {paginatedData.length === 0 && (
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
                {!isLoading && (
                    <div className="border-t border-border-default p-4">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <p className="text-sm text-text-secondary">
                                Menampilkan {paginatedData.length} dari {filteredData.length} data
                            </p>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                )}
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
                                    <p className="text-text-secondary">
                                        {selectedItem.sumber_jadwal && selectedItem.sumber_jadwal !== 'disposisi'
                                            ? 'Status Kehadiran'
                                            : 'Status Disposisi'}
                                    </p>
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
                                        {selectedItem.sumber_jadwal_label && (
                                            <span className="text-text-muted font-normal text-xs ml-2">({selectedItem.sumber_jadwal_label})</span>
                                        )}
                                        {selectedItem.created_at_formatted && (
                                            <span className="text-text-secondary font-normal ml-2">pada {selectedItem.created_at_formatted}</span>
                                        )}
                                    </p>
                                </div>
                                {selectedItem.file_url && (
                                    <div className="sm:col-span-2">
                                        <p className="text-text-secondary">File Lampiran</p>
                                        <div className="mt-2">
                                            <a
                                                href={selectedItem.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Lihat file pada tab baru"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border-default bg-surface hover:bg-surface-hover text-primary transition-colors"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Buka File
                                            </a>
                                        </div>
                                    </div>
                                )}
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
