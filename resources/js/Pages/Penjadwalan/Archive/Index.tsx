import { useState, useMemo, useEffect } from 'react';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Search,
    MoreVertical,
    RotateCcw,
    Trash2,
    Clock,
    Calendar,
    User,
    Archive
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Dropdown, Pagination, Badge, ConfirmDialog } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import { useMemoryCache } from '@/hooks/useMemoryCache';
import { getDisposisiVariant, getDisposisiLabel, getPenjadwalanStatusVariant, getPenjadwalanStatusLabel } from '@/utils/badgeVariants';
import type { PageProps } from '@/types';
import type { AgendaBase, SuratMasukBase } from '@/types/penjadwalan';

interface ArchivedAgenda extends Pick<AgendaBase, 'id' | 'nama_kegiatan' | 'tanggal_agenda' | 'tanggal_agenda_formatted' | 'waktu_lengkap' | 'tempat' | 'status' | 'status_label' | 'status_disposisi' | 'status_disposisi_label'> {
    surat_masuk: Pick<SuratMasukBase, 'id' | 'nomor_surat' | 'asal_surat' | 'perihal'> | null;
    deleted_by: { id: number; name: string } | null;
    deleted_at: string;
    deleted_at_formatted: string;
}

interface Props extends PageProps {
    archived?: ArchivedAgenda[];
    filters: {
        search?: string;
    };
}

const CACHE_TTL_MS = 60_000;

const ArchiveIndex = ({ archived: initialArchived, filters }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const cacheKey = `penjadwalan_archive_${auth.user.id}`;
    const { read, write } = useMemoryCache<ArchivedAgenda[]>(cacheKey, CACHE_TTL_MS);
    const cachedArchived = read();
    const hasCached = cachedArchived !== null;
    const activeArchived = initialArchived ?? cachedArchived ?? [];

    // Local state for real-time updates
    const [archived, setArchived] = useState<ArchivedAgenda[]>(activeArchived);

    // Sync state when prop updates (deferred loading)
    useEffect(() => {
        if (initialArchived !== undefined) {
            setArchived(initialArchived);
            write(initialArchived);
        }
    }, [initialArchived, write]);

    // Search state
    const [search, setSearch] = useState(filters.search || '');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [restoreAllModalOpen, setRestoreAllModalOpen] = useState(false);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState<ArchivedAgenda | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter data client-side
    const filteredData = useMemo(() => {
        if (!search) return archived;
        const lowerSearch = search.toLowerCase();
        return archived.filter((item) =>
            item.nama_kegiatan?.toLowerCase().includes(lowerSearch) ||
            item.tempat?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.nomor_surat?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.asal_surat?.toLowerCase().includes(lowerSearch)
        );
    }, [archived, search]);

    // Pagination
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleRestore = () => {
        if (!selectedAgenda) return;
        const itemToRestore = selectedAgenda;
        setIsProcessing(true);

        router.post(route('penjadwalan.archive.restore', itemToRestore.id), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Remove item from local state for real-time update
                setArchived(prev => {
                    const next = prev.filter(item => item.id !== itemToRestore.id);
                    write(next);
                    return next;
                });
            },
            onFinish: () => {
                setIsProcessing(false);
                setRestoreModalOpen(false);
                setSelectedAgenda(null);
            },
        });
    };

    const handleForceDelete = () => {
        if (!selectedAgenda) return;
        const itemToDelete = selectedAgenda;
        setIsProcessing(true);

        router.delete(route('penjadwalan.archive.force-delete', itemToDelete.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Remove item from local state for real-time update
                setArchived(prev => {
                    const next = prev.filter(item => item.id !== itemToDelete.id);
                    write(next);
                    return next;
                });
            },
            onFinish: () => {
                setIsProcessing(false);
                setDeleteModalOpen(false);
                setSelectedAgenda(null);
            },
        });
    };

    const handleRestoreAll = () => {
        setIsProcessing(true);

        router.post(route('penjadwalan.archive.restore-all'), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Clear all items from local state for real-time update
                setArchived(() => {
                    write([]);
                    return [];
                });
            },
            onFinish: () => {
                setIsProcessing(false);
                setRestoreAllModalOpen(false);
            },
        });
    };

    const handleForceDeleteAll = () => {
        setIsProcessing(true);

        router.delete(route('penjadwalan.archive.force-delete-all'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Clear all items from local state for real-time update
                setArchived(() => {
                    write([]);
                    return [];
                });
            },
            onFinish: () => {
                setIsProcessing(false);
                setDeleteAllModalOpen(false);
            },
        });
    };

    const renderStatusBadge = (status: string) => (
        <Badge variant={getPenjadwalanStatusVariant(status)}>{getPenjadwalanStatusLabel(status)}</Badge>
    );

    const renderDisposisiBadge = (status: string) => (
        <Badge variant={getDisposisiVariant(status)}>{getDisposisiLabel(status)}</Badge>
    );

    return (
        <>
            <Head title="Arsip Jadwal" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Arsip Jadwal</h1>
                <p className="text-text-secondary text-sm mt-1">Daftar jadwal yang telah dihapus</p>
            </div>

            <div className="bg-surface border border-border-default rounded-lg">
                <div className="p-4 border-b border-border-default">
                    {/* Search and Bulk Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex gap-2 max-w-md flex-1">
                            <TextInput
                                type="text"
                                placeholder="Cari kegiatan, nomor surat, lokasi..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full px-3"
                            />
                            <Button variant="secondary" disabled>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        {archived.length > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setRestoreAllModalOpen(true)}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Pulihkan Semua
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setDeleteAllModalOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Semua
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Box */}
                {archived.length > 0 && (
                    <div className="p-4 bg-surface-hover border-b border-border-default">
                        <div className="flex items-start gap-3">
                            <Archive className="h-5 w-5 text-warning mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-text-primary">Tentang Arsip</h4>
                                <p className="text-sm text-text-secondary mt-1">
                                    Jadwal yang dihapus akan dipindahkan ke arsip dan dapat dipulihkan.
                                    Menghapus secara permanen akan menghilangkan data dari sistem selamanya.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                {!initialArchived && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={6} />
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-default">
                        <thead className="bg-surface-hover">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-12">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Kegiatan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Surat Undangan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Dihapus</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border-default">
                            {paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-surface-hover">
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="font-medium text-text-primary line-clamp-2">{item.nama_kegiatan}</div>
                                        <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {item.tanggal_agenda_formatted}
                                            <span className="mx-1">|</span>
                                            <Clock className="h-3 w-3" />
                                            {item.waktu_lengkap}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="font-medium text-text-primary">{item.surat_masuk?.nomor_surat || '-'}</div>
                                        <div className="text-text-secondary line-clamp-1">{item.surat_masuk?.asal_surat || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex flex-col gap-1 items-start">
                                            {renderStatusBadge(item.status)}
                                            {renderDisposisiBadge(item.status_disposisi)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="text-text-primary">{item.deleted_at_formatted}</div>
                                        {item.deleted_by && (
                                            <div className="text-text-secondary flex items-center gap-1 mt-1 text-xs">
                                                <User className="h-3 w-3" />
                                                {item.deleted_by.name}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            {/* Dropdown for cleaner look on mobile, or just buttons for desktop */}
                                            <Dropdown
                                                align="right"
                                                width="48"
                                                trigger={
                                                    <button className="p-1 hover:bg-surface-hover rounded-full transition-colors text-text-secondary">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>
                                                }
                                            >
                                                <div className="py-1">
                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => {
                                                            setSelectedAgenda(item);
                                                            setRestoreModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        <span>Pulihkan</span>
                                                    </Dropdown.Link>
                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => {
                                                            setSelectedAgenda(item);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 text-danger hover:bg-danger-light"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span>Hapus Permanen</span>
                                                    </Dropdown.Link>
                                                </div>
                                            </Dropdown>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                                        {search ? 'Tidak ada data yang cocok dengan pencarian.' : 'Tidak ada jadwal di arsip.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}

                {/* Pagination */}
                {(initialArchived || hasCached) && (
                <div className="p-4 border-t border-border-default">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

            {/* Restore Confirmation */}
            <ConfirmDialog
                isOpen={restoreModalOpen}
                onClose={() => setRestoreModalOpen(false)}
                onConfirm={handleRestore}
                type="warning"
                title="Pulihkan Jadwal"
                message={
                    <p>
                        Apakah Anda yakin ingin memulihkan jadwal{' '}
                        <strong>{selectedAgenda?.nama_kegiatan}</strong>?
                        Jadwal akan dikembalikan ke menu sebelumnya berdasarkan statusnya.
                    </p>
                }
                confirmText="Ya, Pulihkan"
                isLoading={isProcessing}
            />

            {/* Force Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleForceDelete}
                type="delete"
                title="Hapus Permanen"
                message={
                    <div>
                        <p className="mb-3">
                            Apakah Anda yakin ingin menghapus permanen jadwal{' '}
                            <strong>{selectedAgenda?.nama_kegiatan}</strong>?
                        </p>
                         <p className="text-sm text-danger font-medium p-2 bg-danger-light rounded border border-danger-light">
                             Perhatian: Data yang dihapus permanen tidak dapat dipulihkan!
                         </p>
                    </div>
                }
                confirmText="Ya, Hapus Permanen"
                isLoading={isProcessing}
            />

            {/* Restore All Confirmation */}
            <ConfirmDialog
                isOpen={restoreAllModalOpen}
                onClose={() => setRestoreAllModalOpen(false)}
                onConfirm={handleRestoreAll}
                type="warning"
                title="Pulihkan Semua Jadwal"
                message={
                    <p>
                        Apakah Anda yakin ingin memulihkan <strong>{archived.length}</strong> jadwal?
                        Semua jadwal akan dikembalikan ke menu sebelumnya berdasarkan statusnya.
                    </p>
                }
                confirmText="Ya, Pulihkan Semua"
                isLoading={isProcessing}
            />

            {/* Force Delete All Confirmation */}
            <ConfirmDialog
                isOpen={deleteAllModalOpen}
                onClose={() => setDeleteAllModalOpen(false)}
                onConfirm={handleForceDeleteAll}
                type="delete"
                title="Hapus Semua Permanen"
                message={
                    <div>
                        <p className="mb-3">
                            Apakah Anda yakin ingin menghapus permanen <strong>{archived.length}</strong> jadwal?
                        </p>
                         <p className="text-sm text-danger font-medium p-2 bg-danger-light rounded border border-danger-light">
                             Perhatian: Data yang dihapus permanen tidak dapat dipulihkan!
                         </p>
                    </div>
                }
                confirmText="Ya, Hapus Semua"
                isLoading={isProcessing}
            />
        </>
    );
};

ArchiveIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ArchiveIndex;
