import React, { useState, useMemo, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
import { useCRUDModal } from '@/hooks/useCRUDModal';

interface UnitKerja {
    id: string;
    nama: string;
    singkatan: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

interface Props extends PageProps {
    unitKerja: UnitKerja[];
    filters: {
        search?: string;
    };
}

export default function Index({ auth, unitKerja, filters }: Props) {
    const { showToast } = useToast();

    // Client-side Search & Pagination State
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Data
    const filteredData = useMemo(() => {
        let data = unitKerja;
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nama.toLowerCase().includes(lowerSearch) ||
                (item.singkatan && item.singkatan.toLowerCase().includes(lowerSearch))
            );
        }
        return data;
    }, [unitKerja, search]);

    // Paginate Data
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

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Form state
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama: '',
        singkatan: '',
    });

    // CRUD Modal hook
    const {
        isCreateModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        selectedItem: selectedUnit,
        openCreateModal: openCreate,
        openEditModal,
        openDeleteModal,
        closeCreateModal,
        closeEditModal,
        closeDeleteModal,
    } = useCRUDModal<UnitKerja>({
        onOpenCreate: () => {
            reset();
            clearErrors();
        },
        onOpenEdit: (unit) => {
            setData({
                nama: unit.nama,
                singkatan: unit.singkatan || '',
            });
            clearErrors();
        },
    });

    const handleCreate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.unit-kerja.store'), {
            onSuccess: () => {
                closeCreateModal();
                reset();
                showToast('success', 'Unit Kerja berhasil ditambahkan.');
            },
        });
    }, [post, closeCreateModal, reset, showToast]);

    const handleUpdate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUnit) return;
        put(route('master.unit-kerja.update', selectedUnit.id), {
            onSuccess: () => {
                closeEditModal();
                reset();
                showToast('success', 'Unit Kerja berhasil diperbarui.');
            },
        });
    }, [selectedUnit, put, closeEditModal, reset, showToast]);

    const handleDelete = useCallback(() => {
        if (!selectedUnit) return;
        router.delete(route('master.unit-kerja.destroy', selectedUnit.id), {
            onSuccess: () => {
                closeDeleteModal();
                showToast('success', 'Unit Kerja berhasil dihapus.');
            },
        });
    }, [selectedUnit, closeDeleteModal, showToast]);

    const tableHeaders: TableHeader<UnitKerja>[] = [
        {
            key: 'no',
            label: 'No',
            render: (_: unknown, __: unknown, index: number) => ((currentPage - 1) * itemsPerPage + index + 1).toString()
        },
        { key: 'nama', label: 'Nama Unit Kerja' },
        { key: 'singkatan', label: 'Singkatan' },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-right',
            render: (_: unknown, unit: UnitKerja) => (
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(unit)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => openDeleteModal(unit)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Unit Kerja" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <div className="flex gap-2 w-full sm:w-1/3">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Unit Kerja..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={openCreate}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table<UnitKerja>
                                headers={tableHeaders}
                                data={paginatedData}
                                keyExtractor={(unit) => unit.id}
                                emptyMessage={search ? "Tidak ada unit kerja yang cocok dengan pencarian." : "Tidak ada data unit kerja."}
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
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Tambah Unit Kerja">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Unit Kerja" />
                        <TextInput
                            id="nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: Dinas Pekerjaan Umum"
                            className="w-full"
                        />
                        {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="singkatan" value="Singkatan" />
                        <TextInput
                            id="singkatan"
                            value={data.singkatan}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('singkatan', e.target.value)}
                            placeholder="Contoh: DPU"
                            className="w-full"
                        />
                        {errors.singkatan && <p className="text-sm text-red-500">{errors.singkatan}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={closeCreateModal}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Unit Kerja">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Unit Kerja" />
                        <TextInput
                            id="edit-nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            className="w-full"
                        />
                        {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-singkatan" value="Singkatan" />
                        <TextInput
                            id="edit-singkatan"
                            value={data.singkatan}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('singkatan', e.target.value)}
                            className="w-full"
                        />
                        {errors.singkatan && <p className="text-sm text-red-500">{errors.singkatan}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={closeEditModal}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Konfirmasi Hapus">
                <div className="space-y-4">
                    <p>Apakah Anda yakin ingin menghapus unit kerja ini? Data akan dipindahkan ke arsip.</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={closeDeleteModal}>Batal</Button>
                        <Button variant="danger" onClick={handleDelete}>Hapus</Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
