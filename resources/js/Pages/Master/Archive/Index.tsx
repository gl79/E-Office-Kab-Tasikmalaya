import { useState, useMemo, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/form/TextInput';
import Table, { TableHeader } from '@/Components/ui/Table';
import Modal from '@/Components/ui/Modal';
import { RefreshCw, Trash2, Search, RotateCcw } from 'lucide-react';
import Pagination from '@/Components/ui/Pagination';
import FormSelect from '@/Components/form/FormSelect';
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

export default function Index({ auth, archives: initialArchives, filters }: Props) {
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
        { value: 'all', label: 'Semua' },
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

    const tableHeaders: TableHeader<ArchiveItem>[] = [
        { 
            key: 'no', 
            label: 'No',
            render: (_: unknown, __: unknown, index: number) => ((currentPage - 1) * itemsPerPage + index + 1).toString()
        },
        { key: 'type', label: 'Jenis Menu' },
        { key: 'nama', label: 'Nama Data' },
        { 
            key: 'deleted_at', 
            label: 'Dihapus Pada',
            render: (value: unknown) => new Date(value as string).toLocaleDateString('id-ID')
        },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-right',
            render: (_: unknown, item: ArchiveItem) => (
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openRestoreAlert(item)}>
                        <RefreshCw className="h-4 w-4 text-secondary" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => openForceDeleteAlert(item)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Arsip Data Master" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <h1 className="text-2xl font-semibold text-gray-900">Arsip Data Master</h1>
                            {archives.length > 0 && (
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

                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex gap-2 flex-1">
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
                            <FormSelect
                                options={typeOptions}
                                value={type}
                                onChange={handleTypeChange}
                                placeholder="Filter Jenis"
                                className="w-full sm:w-48"
                            />
                        </div>

                        <div className="rounded-md border">
                            <Table<ArchiveItem>
                                headers={tableHeaders}
                                data={paginatedData}
                                keyExtractor={(item) => `${item.type}-${item.id}`}
                                emptyMessage={search ? "Tidak ada data yang cocok dengan pencarian." : "Tidak ada data arsip."}
                            />
                        </div>

                        <div className="mt-4">
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Restore Alert */}
            <Modal isOpen={isRestoreAlertOpen} onClose={() => setIsRestoreAlertOpen(false)} title="Pulihkan Data?">
                <div className="space-y-4">
                    <p>Data akan dikembalikan ke daftar aktif.</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={() => setIsRestoreAlertOpen(false)}>Batal</Button>
                        <Button onClick={handleRestore} className="bg-secondary hover:bg-secondary-hover text-text-inverse" disabled={isProcessing}>
                            {isProcessing ? 'Memproses...' : 'Pulihkan'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Force Delete Alert */}
            <Modal isOpen={isForceDeleteAlertOpen} onClose={() => setIsForceDeleteAlertOpen(false)} title="Hapus Permanen?">
                <div className="space-y-4">
                    <p>Tindakan ini tidak dapat dibatalkan. Data akan hilang selamanya.</p>
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
                        <p className="text-red-600 font-medium mb-2">
                            Peringatan: Aksi ini tidak dapat dibatalkan!
                        </p>
                        <p className="mb-3">
                            Apakah Anda yakin ingin menghapus permanen <strong>{archives.length}</strong> data?
                            Semua data akan hilang selamanya.
                        </p>
                    </div>
                }
                confirmText="Ya, Hapus Semua"
                isLoading={isProcessing}
            />
        </AppLayout>
    );
}

