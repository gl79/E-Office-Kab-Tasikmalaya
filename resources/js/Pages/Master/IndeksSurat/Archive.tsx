import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/form/TextInput';
import Table, { TableHeader } from '@/Components/ui/Table';
import Modal from '@/Components/ui/Modal';
import { useToast } from '@/Components/ui/Toast';
import { ArrowLeft, RefreshCw, Trash2, Search } from 'lucide-react';
import Pagination from '@/Components/ui/Pagination';

interface IndeksSurat {
    id: string;
    kode: string;
    nama: string;
    urutan: number;
    deleted_at: string;
    [key: string]: unknown;
}

interface Props extends PageProps {
    indeksSurat: {
        data: IndeksSurat[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function Archive({ auth, indeksSurat, filters }: Props) {
    const { showToast } = useToast();
    const [search, setSearch] = useState(filters.search || '');
    const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
    const [isForceDeleteAlertOpen, setIsForceDeleteAlertOpen] = useState(false);
    const [selectedIndeks, setSelectedIndeks] = useState<IndeksSurat | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('master.indeks-surat.archive'), { search }, { preserveState: true });
    };

    const handlePageChange = (page: number) => {
        router.get(route('master.indeks-surat.archive'), { search, page }, { preserveState: true });
    };

    const openRestoreAlert = (indeks: IndeksSurat) => {
        setSelectedIndeks(indeks);
        setIsRestoreAlertOpen(true);
    };

    const openForceDeleteAlert = (indeks: IndeksSurat) => {
        setSelectedIndeks(indeks);
        setIsForceDeleteAlertOpen(true);
    };

    const handleRestore = () => {
        if (!selectedIndeks) return;
        router.post(route('master.indeks-surat.restore', selectedIndeks.id), {}, {
            onSuccess: () => {
                setIsRestoreAlertOpen(false);
                showToast('success', "Indeks Surat berhasil dipulihkan.");
            },
        });
    };

    const handleForceDelete = () => {
        if (!selectedIndeks) return;
        router.delete(route('master.indeks-surat.force-delete', selectedIndeks.id), {
            onSuccess: () => {
                setIsForceDeleteAlertOpen(false);
                showToast('success', "Indeks Surat berhasil dihapus permanen.");
            },
        });
    };

    const tableHeaders: TableHeader<IndeksSurat>[] = [
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama Indeks' },
        { 
            key: 'deleted_at', 
            label: 'Dihapus Pada',
            render: (value: unknown) => new Date(value as string).toLocaleDateString('id-ID')
        },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-right',
            render: (_: unknown, indeks: IndeksSurat) => (
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openRestoreAlert(indeks)}>
                        <RefreshCw className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => openForceDeleteAlert(indeks)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Arsip Indeks Surat" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-1/3">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Arsip..."
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                                <Button type="submit" variant="secondary">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                            <Link href={route('master.indeks-surat.index')}>
                                <Button variant="secondary">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali
                                </Button>
                            </Link>
                        </div>

                        <div className="rounded-md border">
                            <Table<IndeksSurat>
                                headers={tableHeaders}
                                data={indeksSurat.data}
                                keyExtractor={(indeks) => indeks.id}
                                emptyMessage="Tidak ada data arsip."
                            />
                        </div>

                        <div className="mt-4">
                            <Pagination 
                                currentPage={indeksSurat.current_page}
                                totalPages={indeksSurat.last_page}
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
