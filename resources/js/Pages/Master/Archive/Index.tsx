import { useState, useMemo, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import { Button, Modal, Pagination } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import { RefreshCw, Trash2, Search, RotateCcw } from 'lucide-react';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';

interface ArchiveItem {
    id: string;
    nama: string;
    deleted_at: string;
    type: string;
    resource_name: string;
    [key: string]: unknown;
}

interface Props extends PageProps {
    archives: {
        data: ArchiveItem[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
    };
    filters: {
        search?: string;
    };
}

const Index = ({ auth, archives: initialArchives, filters }: Props) => {
    // Local state for real-time updates
    const [archives, setArchives] = useState(initialArchives.data);
    
    // Client-side search and pagination for SPA experience
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
    const [isForceDeleteAlertOpen, setIsForceDeleteAlertOpen] = useState(false);
    const [restoreAllModalOpen, setRestoreAllModalOpen] = useState(false);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const typeOptions = [
        { value: 'all', label: 'Semua Jenis' },
        { value: 'provinsi', label: 'Provinsi' },
        { value: 'kabupaten', label: 'Kabupaten' },
        { value: 'kecamatan', label: 'Kecamatan' },
        { value: 'desa', label: 'Desa' },
        { value: 'pengguna', label: 'Pengguna' },
    ];

    // Client-side filtered data
    const filteredData = useMemo(() => {
        let data = archives;

        if (search) {
            const searchLower = search.toLowerCase();
            data = data.filter(item =>
                item.nama.toLowerCase().includes(searchLower) ||
                item.type.toLowerCase().includes(searchLower)
            );
        }

        if (type !== 'all') {
            data = data.filter(item => item.type.toLowerCase() === type.toLowerCase());
        }

        return data;
    }, [archives, search, type]);

    // Client-side pagination
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset page on search
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const openRestoreAlert = (item: ArchiveItem) => {
        setSelectedItem(item);
        setIsRestoreAlertOpen(true);
    };

    const openForceDeleteAlert = (item: ArchiveItem) => {
        setSelectedItem(item);
        setIsForceDeleteAlertOpen(true);
    };

    const handleRestore = () => {
        if (!selectedItem) return;
        const itemToRestore = selectedItem;
        setIsProcessing(true);
        router.post(route(`master.${itemToRestore.resource_name}.restore`, itemToRestore.id), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setArchives(prev => prev.filter(item => 
                    !(item.type === itemToRestore.type && item.id === itemToRestore.id)
                ));
                setIsRestoreAlertOpen(false);
            },
            onFinish: () => {
                setIsProcessing(false);
                setSelectedItem(null);
            },
        });
    };

    const handleForceDelete = () => {
        if (!selectedItem) return;
        const itemToDelete = selectedItem;
        setIsProcessing(true);
        router.delete(route(`master.${itemToDelete.resource_name}.force-delete`, itemToDelete.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setArchives(prev => prev.filter(item => 
                    !(item.type === itemToDelete.type && item.id === itemToDelete.id)
                ));
                setIsForceDeleteAlertOpen(false);
            },
            onFinish: () => {
                setIsProcessing(false);
                setSelectedItem(null);
            },
        });
    };

    const handleRestoreAll = () => {
        setIsProcessing(true);
        router.post(route('master.archive.restore-all'), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setArchives([]);
            },
            onFinish: () => {
                setIsProcessing(false);
                setRestoreAllModalOpen(false);
            },
        });
    };

    const handleForceDeleteAll = () => {
        setIsProcessing(true);
        router.delete(route('master.archive.force-delete-all'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setArchives([]);
            },
            onFinish: () => {
                setIsProcessing(false);
                setDeleteAllModalOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Arsip Data Master" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Arsip Data Master</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data master yang telah dihapus</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="flex gap-2 flex-1 max-w-md">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Arsip..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                            <select
                                value={type}
                                onChange={handleTypeChange}
                                className="border border-border-default rounded-lg px-3 py-2 focus:border-primary focus:ring-primary w-40"
                            >
                                {typeOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        {archives.length > 0 && (
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
                <table className="min-w-full divide-y divide-border-default">
                    <thead className="bg-surface-hover">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-16">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Jenis Menu</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nama Data</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Dihapus Pada</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border-default">
                        {paginatedData.map((item, index) => (
                            <tr key={`${item.type}-${item.id}`} className="hover:bg-surface-hover">
                                <td className="px-4 py-3 text-text-secondary text-sm">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark uppercase">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-text-primary">
                                    {item.nama}
                                </td>
                                <td className="px-4 py-3 text-text-secondary">
                                    {new Date(item.deleted_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => openRestoreAlert(item)}
                                            title="Pulihkan"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => openForceDeleteAlert(item)}
                                            title="Hapus Permanen"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                                    {search || type !== 'all' ? 'Tidak ada data arsip yang cocok dengan filter' : 'Tidak ada data arsip'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 border-t border-border-default">
                    <div className="flex items-center justify-between">
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

            {/* Restore Alert */}
            <Modal isOpen={isRestoreAlertOpen} onClose={() => setIsRestoreAlertOpen(false)} title="Pulihkan Data?">
                <div className="space-y-4">
                    <p className="text-text-secondary">
                        Apakah Anda yakin ingin memulihkan data <strong>{selectedItem?.nama}</strong>? Data akan dikembalikan ke daftar aktif.
                    </p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={() => setIsRestoreAlertOpen(false)}>Batal</Button>
                        <Button onClick={handleRestore} disabled={isProcessing}>
                            {isProcessing ? 'Memproses...' : 'Pulihkan'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Force Delete Alert */}
            <Modal isOpen={isForceDeleteAlertOpen} onClose={() => setIsForceDeleteAlertOpen(false)} title="Hapus Permanen?">
                <div className="space-y-4">
                    <p className="text-text-secondary">
                        Apakah Anda yakin ingin menghapus data <strong>{selectedItem?.nama}</strong> secara PERMANEN?
                        <br/>
                        <span className="text-danger text-sm">Tindakan ini tidak dapat dibatalkan.</span>
                    </p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={() => setIsForceDeleteAlertOpen(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleForceDelete} disabled={isProcessing}>
                            {isProcessing ? 'Memproses...' : 'Hapus Permanen'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Restore All Confirmation */}
            <ConfirmDialog
                isOpen={restoreAllModalOpen}
                onClose={() => setRestoreAllModalOpen(false)}
                onConfirm={handleRestoreAll}
                type="warning"
                title="Pulihkan Semua Data"
                message={
                    <p>
                        Apakah Anda yakin ingin memulihkan <strong>{archives.length}</strong> data?
                        Semua data akan dikembalikan ke menu utama.
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
                        <p className="text-danger font-medium mb-2">
                            Peringatan: Aksi ini tidak dapat dibatalkan!
                        </p>
                        <p>
                            Apakah Anda yakin ingin menghapus permanen <strong>{archives.length}</strong> data?
                            Semua data akan hilang selamanya.
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
