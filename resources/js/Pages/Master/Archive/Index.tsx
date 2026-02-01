import { useState, useMemo, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/form/TextInput';
import Table, { TableHeader } from '@/Components/ui/Table';
import Modal from '@/Components/ui/Modal';
import { RefreshCw, Trash2, Search } from 'lucide-react';
import Pagination from '@/Components/ui/Pagination';
import FormSelect from '@/Components/form/FormSelect';

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

export default function Index({ auth, archives, filters }: Props) {
    // Client-side search and pagination for SPA experience
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
    const [isForceDeleteAlertOpen, setIsForceDeleteAlertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);

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
        let data = archives.data;

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
    }, [archives.data, search, type]);

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
        router.post(route(`master.${selectedItem.resource_name}.restore`, selectedItem.id), {}, {
            onSuccess: () => {
                setIsRestoreAlertOpen(false);
            },
        });
    };

    const handleForceDelete = () => {
        if (!selectedItem) return;
        router.delete(route(`master.${selectedItem.resource_name}.force-delete`, selectedItem.id), {
            onSuccess: () => {
                setIsForceDeleteAlertOpen(false);
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
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
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
                        <Button onClick={handleRestore} className="bg-secondary hover:bg-secondary-hover text-text-inverse">Pulihkan</Button>
                    </div>
                </div>
            </Modal>

            {/* Force Delete Alert */}
            <Modal isOpen={isForceDeleteAlertOpen} onClose={() => setIsForceDeleteAlertOpen(false)} title="Hapus Permanen?">
                <div className="space-y-4">
                    <p>Tindakan ini tidak dapat dibatalkan. Data akan hilang selamanya.</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={() => setIsForceDeleteAlertOpen(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleForceDelete}>Hapus Permanen</Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
