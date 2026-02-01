import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { RotateCcw, Trash2, Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import Table, { TableHeader } from '@/Components/ui/Table';
import Badge from '@/Components/ui/Badge';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import FormSelect from '@/Components/form/FormSelect';
import TextInput from '@/Components/form/TextInput';
import Pagination from '@/Components/ui/Pagination';
import type { PageProps } from '@/types';

interface ArchiveItem {
    id: string;
    type: string;
    jenis: string;
    nomor_agenda: string;
    tanggal_surat: string;
    nomor_surat: string;
    asal_surat: string;
    perihal: string;
    deleted_at: string;
    deleted_by?: { name: string } | null;
    [key: string]: unknown;
}

interface Props extends PageProps {
    archives: ArchiveItem[];
}

export default function Index({ archives: initialArchives }: Props) {
    // Local state for real-time updates
    const [archives, setArchives] = useState(initialArchives);

    // Client-side Search & Pagination
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const typeOptions = [
        { value: 'all', label: 'Semua' },
        { value: 'masuk', label: 'Surat Masuk' },
        { value: 'keluar', label: 'Surat Keluar' },
    ];

    // Filter data client-side
    const filteredData = useMemo(() => {
        let data = archives;

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
                // Remove item from local state for real-time update
                setArchives(prev => prev.filter(item =>
                    !(item.type === itemToRestore.type && item.id === itemToRestore.id)
                ));
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
                // Remove item from local state for real-time update
                setArchives(prev => prev.filter(item =>
                    !(item.type === itemToDelete.type && item.id === itemToDelete.id)
                ));
            },
            onFinish: () => {
                setIsProcessing(false);
                setDeleteModalOpen(false);
                setSelectedItem(null);
            },
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const tableHeaders: TableHeader<ArchiveItem>[] = [
        {
            key: 'no',
            label: 'No',
            className: 'w-12',
            render: (_: unknown, __: unknown, index: number) =>
                ((currentPage - 1) * itemsPerPage + index + 1).toString(),
        },
        {
            key: 'jenis',
            label: 'Jenis',
            render: (value: unknown) => (
                <Badge variant={value === 'Surat Masuk' ? 'info' : 'warning'}>
                    {value as string}
                </Badge>
            ),
        },
        { key: 'nomor_agenda', label: 'No. Agenda' },
        {
            key: 'tanggal_surat',
            label: 'Tgl Surat',
            render: (value: unknown) => formatDate(value as string),
        },
        { key: 'nomor_surat', label: 'Nomor Surat' },
        {
            key: 'perihal',
            label: 'Perihal',
            render: (value: unknown) => (
                <div className="max-w-xs truncate" title={value as string}>
                    {value as string}
                </div>
            ),
        },
        {
            key: 'deleted_at',
            label: 'Tgl Dihapus',
            render: (value: unknown) => formatDateTime(value as string),
        },
        {
            key: 'deleted_by',
            label: 'Dihapus Oleh',
            render: (_: unknown, item: ArchiveItem) => item.deleted_by?.name || '-',
        },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-right',
            render: (_: unknown, item: ArchiveItem) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setSelectedItem(item);
                            setRestoreModalOpen(true);
                        }}
                        title="Pulihkan"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                            setSelectedItem(item);
                            setDeleteModalOpen(true);
                        }}
                        title="Hapus Permanen"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Arsip Persuratan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <h1 className="text-2xl font-semibold text-gray-900">Arsip Persuratan</h1>
                        </div>

                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="flex gap-2 flex-1">
                                <TextInput
                                    type="text"
                                    placeholder="Cari nomor surat, perihal..."
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

                        <div className="rounded-md border overflow-x-auto">
                            <Table<ArchiveItem>
                                headers={tableHeaders}
                                data={paginatedData}
                                keyExtractor={(item) => `${item.type}-${item.id}`}
                                emptyMessage={search ? "Tidak ada data yang cocok dengan pencarian." : "Tidak ada data di arsip."}
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
                        <p className="text-red-600 font-medium mb-2">
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
        </AppLayout>
    );
}
