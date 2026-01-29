import React, { useState } from 'react';
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

interface UnitKerja {
    id: string;
    nama: string;
    singkatan: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

interface Props extends PageProps {
    unitKerja: {
        data: UnitKerja[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ auth, unitKerja, filters }: Props) {
    const { showToast } = useToast();
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<UnitKerja | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama: '',
        singkatan: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('master.unit-kerja.index'), { search }, { preserveState: true });
    };

    const handlePageChange = (page: number) => {
        router.get(route('master.unit-kerja.index'), { search, page }, { preserveState: true });
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (unit: UnitKerja) => {
        setSelectedUnit(unit);
        setData({
            nama: unit.nama,
            singkatan: unit.singkatan || '',
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const openDeleteAlert = (unit: UnitKerja) => {
        setSelectedUnit(unit);
        setIsDeleteAlertOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.unit-kerja.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                showToast('success', "Unit Kerja berhasil ditambahkan.");
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUnit) return;
        put(route('master.unit-kerja.update', selectedUnit.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                showToast('success', "Unit Kerja berhasil diperbarui.");
            },
        });
    };

    const handleDelete = () => {
        if (!selectedUnit) return;
        router.delete(route('master.unit-kerja.destroy', selectedUnit.id), {
            onSuccess: () => {
                setIsDeleteAlertOpen(false);
                showToast('success', "Unit Kerja berhasil dihapus.");
            },
        });
    };

    const tableHeaders: TableHeader<UnitKerja>[] = [
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
                    <Button variant="danger" size="sm" onClick={() => openDeleteAlert(unit)}>
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
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-1/3">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Unit Kerja..."
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                                <Button type="submit" variant="secondary">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                            <div className="flex gap-2">
                                <Link href={route('master.unit-kerja.archive')}>
                                    <Button variant="secondary">Archive</Button>
                                </Link>
                                <Button onClick={openCreateModal}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table<UnitKerja>
                                headers={tableHeaders}
                                data={unitKerja.data}
                                keyExtractor={(unit) => unit.id}
                                emptyMessage="Tidak ada data unit kerja."
                            />
                        </div>

                        <div className="mt-4">
                            <Pagination 
                                currentPage={unitKerja.current_page}
                                totalPages={unitKerja.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Unit Kerja">
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
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Unit Kerja">
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
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteAlertOpen} onClose={() => setIsDeleteAlertOpen(false)} title="Konfirmasi Hapus">
                <div className="space-y-4">
                    <p>Apakah Anda yakin ingin menghapus unit kerja ini? Data akan dipindahkan ke arsip.</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={() => setIsDeleteAlertOpen(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleDelete}>Hapus</Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
