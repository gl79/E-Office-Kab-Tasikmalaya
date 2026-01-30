import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/form/TextInput';
import InputLabel from '@/Components/form/InputLabel';
import Table, { TableHeader } from '@/Components/ui/Table';
import Modal from '@/Components/ui/Modal';
import { useToast } from '@/Components/ui/Toast';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import Pagination from '@/Components/ui/Pagination';

interface IndeksSurat {
    id: string;
    kode: string;
    nama: string;
    urutan: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

interface Props extends PageProps {
    indeksSurat: IndeksSurat[];
    filters: {
        search?: string;
    };
}

export default function Index({ auth, indeksSurat, filters }: Props) {
    const { showToast } = useToast();
    
    // Client-side Search & Pagination State
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Data
    const filteredData = useMemo(() => {
        let data = indeksSurat;
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item => 
                item.kode.toLowerCase().includes(lowerSearch) || 
                item.nama.toLowerCase().includes(lowerSearch)
            );
        }
        return data;
    }, [indeksSurat, search]);

    // Paginate Data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset page on search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedIndeks, setSelectedIndeks] = useState<IndeksSurat | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        nama: '',
        urutan: 0,
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (indeks: IndeksSurat) => {
        setSelectedIndeks(indeks);
        setData({
            kode: indeks.kode,
            nama: indeks.nama,
            urutan: indeks.urutan || 0,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const openDeleteAlert = (indeks: IndeksSurat) => {
        setSelectedIndeks(indeks);
        setIsDeleteAlertOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.indeks-surat.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                showToast('success', 'Indeks Surat berhasil ditambahkan.');
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIndeks) return;
        put(route('master.indeks-surat.update', selectedIndeks.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                showToast('success', 'Indeks Surat berhasil diperbarui.');
            },
        });
    };

    const handleDelete = () => {
        if (!selectedIndeks) return;
        router.delete(route('master.indeks-surat.destroy', selectedIndeks.id), {
            onSuccess: () => {
                setIsDeleteAlertOpen(false);
                showToast('success', 'Indeks Surat berhasil dihapus.');
            },
        });
    };

    const tableHeaders: TableHeader<IndeksSurat>[] = [
        { 
            key: 'no', 
            label: 'No',
            render: (_: unknown, __: unknown, index: number) => ((currentPage - 1) * itemsPerPage + index + 1).toString()
        },
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama Indeks' },
        { key: 'urutan', label: 'Urutan' },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-right',
            render: (_: unknown, indeks: IndeksSurat) => (
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(indeks)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => openDeleteAlert(indeks)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Indeks Surat" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <div className="flex gap-2 w-full sm:w-1/3">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Indeks Surat..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={openCreateModal}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table<IndeksSurat>
                                headers={tableHeaders}
                                data={paginatedData}
                                keyExtractor={(indeks) => indeks.id}
                                emptyMessage={search ? "Tidak ada indeks surat yang cocok dengan pencarian." : "Tidak ada data indeks surat."}
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

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Indeks Surat">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="kode" value="Kode" />
                        <TextInput
                            id="kode"
                            value={data.kode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('kode', e.target.value)}
                            placeholder="Contoh: 001"
                            className="w-full"
                        />
                        {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Indeks" />
                        <TextInput
                            id="nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: Surat Keputusan"
                            className="w-full"
                        />
                        {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="urutan" value="Urutan" />
                        <TextInput
                            id="urutan"
                            type="number"
                            value={data.urutan}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('urutan', parseInt(e.target.value))}
                            placeholder="0"
                            className="w-full"
                        />
                        {errors.urutan && <p className="text-sm text-red-500">{errors.urutan}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Indeks Surat">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-kode" value="Kode" />
                        <TextInput
                            id="edit-kode"
                            value={data.kode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('kode', e.target.value)}
                            className="w-full"
                        />
                        {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Indeks" />
                        <TextInput
                            id="edit-nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            className="w-full"
                        />
                        {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-urutan" value="Urutan" />
                        <TextInput
                            id="edit-urutan"
                            type="number"
                            value={data.urutan}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('urutan', parseInt(e.target.value))}
                            className="w-full"
                        />
                        {errors.urutan && <p className="text-sm text-red-500">{errors.urutan}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteAlertOpen} onClose={() => setIsDeleteAlertOpen(false)} title="Konfirmasi Hapus">
                <div className="space-y-4">
                    <p>Apakah Anda yakin ingin menghapus indeks surat ini? Data akan dipindahkan ke arsip.</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={() => setIsDeleteAlertOpen(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleDelete}>Hapus</Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
