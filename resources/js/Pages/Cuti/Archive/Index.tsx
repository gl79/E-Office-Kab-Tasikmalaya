import { useEffect, useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, MoreVertical, RotateCcw, Trash2, Archive } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Dropdown, Pagination, ConfirmDialog } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import { useMemoryCache } from '@/hooks/useMemoryCache';
import CutiStatusBadge from '../Components/CutiStatusBadge';
import CutiConfirmDialog from '../Components/CutiConfirmDialog';
import CutiTableShimmer from '../Components/CutiTableShimmer';
import type { PageProps } from '@/types';
import type { CutiArchivedItem } from '@/types/cuti';

interface Props extends PageProps {
    archived?: CutiArchivedItem[];
    filters: {
        search?: string;
    };
}

const CACHE_TTL_MS = 60_000;

const ArchiveIndex = ({ archived: initialArchived, filters }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const cacheKey = `cuti_archive_${auth.user.id}`;
    const { read, write } = useMemoryCache<CutiArchivedItem[]>(cacheKey, CACHE_TTL_MS);
    const cachedArchived = read();
    const hasCached = cachedArchived !== null;
    const activeArchived = initialArchived ?? cachedArchived ?? [];

    const [archived, setArchived] = useState<CutiArchivedItem[]>(activeArchived);
    const [search, setSearch] = useState(filters.search || '');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [selectedItem, setSelectedItem] = useState<CutiArchivedItem | null>(null);
    const [action, setAction] = useState<'restore' | 'forceDelete'>('restore');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [restoreAllOpen, setRestoreAllOpen] = useState(false);
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);

    useEffect(() => {
        if (initialArchived !== undefined) {
            setArchived(initialArchived);
            write(initialArchived);
        }
    }, [initialArchived, write]);

    const filteredData = useMemo(() => {
        if (!search) return archived;
        const lowerSearch = search.toLowerCase();
        return archived.filter((item) =>
            item.pegawai?.name?.toLowerCase().includes(lowerSearch) ||
            item.pegawai?.nip?.toLowerCase().includes(lowerSearch) ||
            item.jenis_cuti?.toLowerCase().includes(lowerSearch)
        );
    }, [archived, search]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

    const handleRestore = () => {
        if (!selectedItem) return;
        const itemId = selectedItem.id;
        setIsProcessing(true);

        router.post(route('cuti.archive.restore', itemId), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setArchived((prev) => {
                    const next = prev.filter((item) => item.id !== itemId);
                    write(next);
                    return next;
                });
            },
            onFinish: () => {
                setIsProcessing(false);
                setConfirmOpen(false);
                setSelectedItem(null);
            },
        });
    };

    const handleForceDelete = () => {
        if (!selectedItem) return;
        const itemId = selectedItem.id;
        setIsProcessing(true);

        router.delete(route('cuti.archive.force-delete', itemId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setArchived((prev) => {
                    const next = prev.filter((item) => item.id !== itemId);
                    write(next);
                    return next;
                });
            },
            onFinish: () => {
                setIsProcessing(false);
                setConfirmOpen(false);
                setSelectedItem(null);
            },
        });
    };

    const handleRestoreAll = () => {
        setIsProcessing(true);
        router.post(route('cuti.archive.restore-all'), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setArchived(() => {
                    write([]);
                    return [];
                });
            },
            onFinish: () => {
                setIsProcessing(false);
                setRestoreAllOpen(false);
            },
        });
    };

    const handleForceDeleteAll = () => {
        setIsProcessing(true);
        router.delete(route('cuti.archive.force-delete-all'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setArchived(() => {
                    write([]);
                    return [];
                });
            },
            onFinish: () => {
                setIsProcessing(false);
                setDeleteAllOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Arsip Cuti" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Arsip Cuti</h1>
                <p className="text-text-secondary text-sm mt-1">Daftar pengajuan cuti yang telah dihapus</p>
            </div>

            <div className="bg-surface border border-border-default rounded-lg">
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                        <div className="flex gap-2 max-w-md flex-1">
                            <TextInput
                                type="text"
                                placeholder="Cari pegawai atau jenis cuti..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full"
                            />
                            <Button variant="secondary" disabled>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        {archived.length > 0 && (
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => setRestoreAllOpen(true)}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Pulihkan Semua
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => setDeleteAllOpen(true)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Semua
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {archived.length > 0 && (
                    <div className="p-4 bg-surface-hover border-b border-border-default">
                        <div className="flex items-start gap-3">
                            <Archive className="h-5 w-5 text-warning mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-text-primary">Tentang Arsip</h4>
                                <p className="text-sm text-text-secondary mt-1">
                                    Data cuti yang dihapus akan masuk arsip dan dapat dipulihkan kapan saja.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!initialArchived && !hasCached ? (
                    <CutiTableShimmer columns={5} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border-default text-sm">
                            <thead className="bg-surface-hover">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-12">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Pegawai</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Detail Cuti</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border-default">
                                {paginatedData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-surface-hover">
                                        <td className="px-4 py-3 text-text-secondary">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-text-primary">{item.pegawai?.name}</div>
                                            <div className="text-xs text-text-secondary">{item.pegawai?.nip || '-'}</div>
                                            <div className="text-xs text-text-muted">{item.pegawai?.jabatan || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-text-primary">{item.jenis_cuti}</div>
                                            <div className="text-xs text-text-secondary mt-1">
                                                Lama: <span className="font-semibold">{item.lama_cuti}</span> hari
                                            </div>
                                            <div className="text-xs text-text-muted mt-1">{item.tanggal_range_formatted}</div>
                                            <div className="text-xs text-text-muted mt-1">
                                                Dihapus: {item.deleted_at_formatted || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <CutiStatusBadge status={item.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
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
                                                            setSelectedItem(item);
                                                            setAction('restore');
                                                            setConfirmOpen(true);
                                                        }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        Pulihkan
                                                    </Dropdown.Link>
                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setAction('forceDelete');
                                                            setConfirmOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 text-danger hover:bg-danger-light"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Hapus Permanen
                                                    </Dropdown.Link>
                                                </div>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                                            {search ? 'Tidak ada data yang cocok dengan pencarian.' : 'Tidak ada data cuti di arsip.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

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

            <CutiConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={action === 'restore' ? handleRestore : handleForceDelete}
                action={action}
                itemLabel={selectedItem?.pegawai?.name}
                isLoading={isProcessing}
            />

            <ConfirmDialog
                isOpen={restoreAllOpen}
                onClose={() => setRestoreAllOpen(false)}
                onConfirm={handleRestoreAll}
                type="warning"
                title="Pulihkan Semua"
                message={
                    <p>
                        Apakah Anda yakin ingin memulihkan <strong>{archived.length}</strong> data cuti?
                    </p>
                }
                confirmText="Ya, Pulihkan Semua"
                isLoading={isProcessing}
            />

            <ConfirmDialog
                isOpen={deleteAllOpen}
                onClose={() => setDeleteAllOpen(false)}
                onConfirm={handleForceDeleteAll}
                type="delete"
                title="Hapus Semua Permanen"
                message={
                    <div>
                        <p className="mb-3">
                            Apakah Anda yakin ingin menghapus permanen <strong>{archived.length}</strong> data cuti?
                        </p>
                        <p className="text-sm text-danger font-medium p-2 bg-danger-light rounded border border-danger-light">
                            Perhatian: Data yang dihapus permanen tidak dapat dipulihkan.
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
