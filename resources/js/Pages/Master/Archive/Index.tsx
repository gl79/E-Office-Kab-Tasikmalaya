import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/form/TextInput';
import Table, { TableHeader } from '@/Components/ui/Table';
import Modal from '@/Components/ui/Modal';
import { useToast } from '@/Components/ui/Toast';
import { RefreshCw, Trash2, Search } from 'lucide-react';
import Pagination from '@/Components/ui/Pagination';
import { useServerSearch } from '@/hooks/useServerSearch';

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
    const { showToast } = useToast();
    const { search, setSearch } = useServerSearch({
        url: route('master.archive'),
        initialSearch: filters.search
    });
    const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
    const [isForceDeleteAlertOpen, setIsForceDeleteAlertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);

    const handlePageChange = (page: number) => {
        const url = archives.links.find((l: any) => l.label == page)?.url;
        if (url) {
            router.get(url, { search }, { 
                preserveState: true,
                preserveScroll: true,
                only: ['archives', 'filters'],
            });
        }
    };

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
            render: (_: unknown, __: unknown, index: number) => (archives.from + index).toString()
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
                        <RefreshCw className="h-4 w-4 text-green-600" />
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
                            <div className="flex gap-2 w-full sm:w-1/3">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Arsip..."
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table<ArchiveItem>
                                headers={tableHeaders}
                                data={archives.data}
                                keyExtractor={(item) => `${item.type}-${item.id}`}
                                emptyMessage="Tidak ada data arsip."
                            />
                        </div>

                        <div className="mt-4">
                            <Pagination 
                                currentPage={archives.current_page}
                                totalPages={archives.last_page}
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
                        <Button onClick={handleRestore} className="bg-green-600 hover:bg-green-700 text-white">Pulihkan</Button>
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
