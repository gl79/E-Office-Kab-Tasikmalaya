import { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { RotateCcw, Trash2, MoreVertical } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Pagination, Dropdown } from '@/Components/ui';
import Badge from '@/Components/ui/Badge';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import FormSelect from '@/Components/form/FormSelect';
import { TextInput } from '@/Components/form';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import type { PageProps } from '@/types';
import type { ArchiveItem } from '@/types/persuratan';
import { useDeferredDataMutable } from '@/hooks';
import { formatDateShort, formatDateTime, getSifatBadge } from '@/utils';


interface Props extends PageProps {
    archives?: ArchiveItem[];
    sifatOptions: Record<string, string>;
}

const CACHE_TTL_MS = 60_000;

const Index = ({ archives: initialArchives, sifatOptions }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const { data: archives, updateAndCache, isLoading, hasCached } = useDeferredDataMutable<ArchiveItem[]>(
        `persuratan_archive_${auth.user.id}`,
        initialArchives,
        CACHE_TTL_MS
    );

    // Client-side Search & Pagination
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [restoreAllModalOpen, setRestoreAllModalOpen] = useState(false);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const typeOptions = [
        { value: 'all', label: 'Semua Jenis' },
        { value: 'masuk', label: 'Surat Masuk' },
        { value: 'keluar', label: 'Surat Keluar' },
    ];

    // Filter data client-side
    const filteredData = useMemo(() => {
        let data = archives || [];

        // Search filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nomor_surat?.toLowerCase().includes(lowerSearch) ||
                item.nomor_agenda?.toLowerCase().includes(lowerSearch) ||
                item.perihal?.toLowerCase().includes(lowerSearch) ||
                item.asal_surat?.toLowerCase().includes(lowerSearch)
            );
        }

        // Type filter
        if (type !== 'all') {
            data = data.filter(item => item.type === type);
        }

        return data;
    }, [archives, search, type]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset page on filter change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRestore = () => {
        if (!selectedItem) return;
        const itemToRestore = selectedItem;
        setIsProcessing(true);
        router.post(route('persuratan.archive.restore', { type: itemToRestore.type, id: itemToRestore.id }), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                updateAndCache(prev =>
                    prev.filter(item =>
                        !(item.type === itemToRestore.type && item.id === itemToRestore.id)
                    )
                );
            },
            onFinish: () => {
                setIsProcessing(false);
                setRestoreModalOpen(false);
                setSelectedItem(null);
            },
        });
    };

    const handleForceDelete = () => {
        if (!selectedItem) return;
        const itemToDelete = selectedItem;
        setIsProcessing(true);
        router.delete(route('persuratan.archive.force-delete', { type: itemToDelete.type, id: itemToDelete.id }), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                updateAndCache(prev =>
                    prev.filter(item =>
                        !(item.type === itemToDelete.type && item.id === itemToDelete.id)
                    )
                );
            },
            onFinish: () => {
                setIsProcessing(false);
                setDeleteModalOpen(false);
                setSelectedItem(null);
            },
        });
    };

    const handleRestoreAll = () => {
        setIsProcessing(true);
        router.post(route('persuratan.archive.restore-all'), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                updateAndCache(() => []);
            },
            onFinish: () => {
                setIsProcessing(false);
                setRestoreAllModalOpen(false);
            },
        });
    };

    const handleForceDeleteAll = () => {
        setIsProcessing(true);
        router.delete(route('persuratan.archive.force-delete-all'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                updateAndCache(() => []);
            },
            onFinish: () => {
                setIsProcessing(false);
                setDeleteAllModalOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Arsip Persuratan" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Arsip Persuratan</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data surat yang telah dihapus</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-2 flex-1 max-w-2xl">
                            <TextInput
                                type="text"
                                placeholder="Cari nomor surat, perihal..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full py-1 px-2"
                            />
                            <div className="w-full sm:w-48">
                                <FormSelect
                                    options={typeOptions}
                                    value={type}
                                    onChange={handleTypeChange}
                                    placeholder="Jenis Surat"
                                    className="w-full py-2 px-2"
                                />
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {(archives?.length ?? 0) > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setRestoreAllModalOpen(true)}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Pulihkan Semua
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => setDeleteAllModalOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Semua
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={9} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-border-default">
                            <thead className="bg-surface-hover">
                                <tr>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase w-12">No</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">Jenis</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">No Agenda / Urut</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase"><div>Tgl Surat</div><div>No Surat</div></th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Perihal</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">Sifat</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Dihapus Pada</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Dihapus Oleh</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface">
                                {paginatedData.map((item, index) => (
                                    <tr key={`${item.type}-${item.id}`} className="hover:bg-surface-hover">
                                        <td className="border border-border-default px-4 py-3 text-center text-text-secondary text-sm">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
                                            <Badge variant={item.jenis === 'Surat Masuk' ? 'info' : 'warning'} className="min-w-[100px] justify-center">
                                                {item.jenis}
                                            </Badge>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center text-text-primary text-sm font-medium">
                                            {item.nomor_agenda?.includes('/')
                                                ? item.nomor_agenda.split('/')[1]
                                                : (item.nomor_agenda || '-')}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="font-medium text-text-primary">{formatDateShort(item.tanggal_surat)}</div>
                                            <div className="text-text-secondary text-xs">{item.nomor_surat}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-text-primary text-sm">
                                            <span className="line-clamp-2">{item.perihal}</span>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
                                            {getSifatBadge(item.sifat, sifatOptions)}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-text-secondary text-sm">
                                            {formatDateTime(item.deleted_at)}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-text-secondary text-sm">
                                            {item.deleted_by?.name || '-'}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
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
                                                        onClick={() => { setSelectedItem(item); setRestoreModalOpen(true); }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        <span>Pulihkan</span>
                                                    </Dropdown.Link>
                                                    <div className="border-t border-border-default my-1"></div>
                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => { setSelectedItem(item); setDeleteModalOpen(true); }}
                                                        className="flex items-center gap-2 text-danger hover:bg-danger-light focus:bg-danger-light"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span>Hapus Permanen</span>
                                                    </Dropdown.Link>
                                                </div>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="border border-border-default px-4 py-8 text-center text-text-secondary">
                                            {search ? "Tidak ada data yang cocok dengan pencarian." : "Tidak ada data di arsip."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-border-default">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-text-secondary">
                            Menampilkan {paginatedData.length} dari {filteredData.length} data
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                isOpen={restoreModalOpen}
                onClose={() => setRestoreModalOpen(false)}
                onConfirm={handleRestore}
                type="restore"
                message={
                    <p>
                        Apakah Anda yakin ingin memulihkan surat dengan nomor{' '}
                        <strong>{selectedItem?.nomor_surat}</strong>?
                    </p>
                }
                isLoading={isProcessing}
            />

            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleForceDelete}
                type="delete"
                title="Hapus Permanen"
                message={
                    <div>
                        <p className="text-danger font-medium mb-2">
                            Peringatan: Aksi ini tidak dapat dibatalkan!
                        </p>
                        <p>
                            Apakah Anda yakin ingin menghapus permanen surat dengan nomor{' '}
                            <strong>{selectedItem?.nomor_surat}</strong>?
                            Data dan file terkait akan dihapus selamanya.
                        </p>
                    </div>
                }
                confirmText="Hapus Permanen"
                isLoading={isProcessing}
            />

            <ConfirmDialog
                isOpen={restoreAllModalOpen}
                onClose={() => setRestoreAllModalOpen(false)}
                onConfirm={handleRestoreAll}
                type="warning"
                title="Pulihkan Semua Surat"
                message={
                    <p>
                        Apakah Anda yakin ingin memulihkan <strong>{archives?.length ?? 0}</strong> surat?
                        Semua surat akan dikembalikan ke menu utama.
                    </p>
                }
                confirmText="Ya, Pulihkan Semua"
                isLoading={isProcessing}
            />

            <ConfirmDialog
                isOpen={deleteAllModalOpen}
                onClose={() => setDeleteAllModalOpen(false)}
                onConfirm={handleForceDeleteAll}
                type="delete"
                title="Hapus Semua Permanen"
                message={
                    <div>
                        <p className="text-danger font-medium mb-2">
                            Peringatan: Aksi ini tidak dapat dibatalkan!
                        </p>
                        <p className="mb-3">
                            Apakah Anda yakin ingin menghapus permanen <strong>{archives?.length ?? 0}</strong> surat?
                            Semua data dan file terkait akan dihapus selamanya.
                        </p>
                    </div>
                }
                confirmText="Ya, Hapus Semua"
                isLoading={isProcessing}
            />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Index;
