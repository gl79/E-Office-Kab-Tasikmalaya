import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/form/TextInput';
import InputLabel from '@/Components/form/InputLabel';
import Table, { TableHeader } from '@/Components/ui/Table';
import Modal from '@/Components/ui/Modal';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import Pagination from '@/Components/ui/Pagination';
import axios from 'axios';

interface WilayahProvinsi {
    kode: string;
    nama: string;
}

interface WilayahKabupaten {
    provinsi_kode: string;
    kode: string;
    nama: string;
    provinsi?: WilayahProvinsi;
    kecamatan_count?: number;
    [key: string]: unknown;
}

interface Props extends PageProps {
    data: {
        data: WilayahKabupaten[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
    };
    filters: {
        search?: string;
        provinsi_kode?: string;
    };
}

export default function Index({ auth, data, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [provinsiKode, setProvinsiKode] = useState(filters.provinsi_kode || '');
    const [provinsiList, setProvinsiList] = useState<WilayahProvinsi[]>([]);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WilayahKabupaten | null>(null);

    const { data: formData, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        provinsi_kode: '',
        kode: '',
        nama: '',
    });

    // Fetch Provinsi List for Dropdown
    useEffect(() => {
        axios.get(route('master.wilayah.provinsi.all'))
            .then(response => {
                setProvinsiList(response.data);
            })
            .catch(error => {
                console.error('Error fetching provinsi:', error);
            });
    }, []);

    // Debounced search and filter
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '') || provinsiKode !== (filters.provinsi_kode || '')) {
                router.get(route('master.wilayah.kabupaten.index'), { 
                    search, 
                    provinsi_kode: provinsiKode 
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['data', 'filters'],
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, provinsiKode]);

    const handlePageChange = (page: number) => {
        router.get(route('master.wilayah.kabupaten.index'), { 
            search, 
            provinsi_kode: provinsiKode,
            page 
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['data', 'filters'],
        });
    };

    const openCreateModal = () => {
        reset();
        // Pre-select provinsi if filtered
        if (provinsiKode) {
            setData('provinsi_kode', provinsiKode);
        }
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (item: WilayahKabupaten) => {
        setSelectedItem(item);
        setData({
            provinsi_kode: item.provinsi_kode,
            kode: item.kode,
            nama: item.nama,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const openDeleteAlert = (item: WilayahKabupaten) => {
        setSelectedItem(item);
        setIsDeleteAlertOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.wilayah.kabupaten.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        put(route('master.wilayah.kabupaten.update', [selectedItem.provinsi_kode, selectedItem.kode]), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        router.delete(route('master.wilayah.kabupaten.destroy', [selectedItem.provinsi_kode, selectedItem.kode]), {
            onSuccess: () => {
                setIsDeleteAlertOpen(false);
            },
        });
    };

    const tableHeaders: TableHeader<WilayahKabupaten>[] = [
        { 
            key: 'no', 
            label: 'No',
            className: 'w-16',
            render: (_: unknown, __: unknown, index: number) => (data.from + index).toString()
        },
        { 
            key: 'full_kode', 
            label: 'Kode', 
            className: 'w-24',
            render: (_, item) => `${item.provinsi_kode}.${item.kode}`
        },
        { key: 'nama', label: 'Nama Kabupaten' },
        { 
            key: 'provinsi.nama', 
            label: 'Provinsi',
            render: (_, item) => item.provinsi?.nama || '-'
        },
        { 
            key: 'kecamatan_count', 
            label: 'Jumlah Kecamatan',
            render: (value) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{String(value)}</span>
        },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-right',
            render: (_: unknown, item: WilayahKabupaten) => (
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(item)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => openDeleteAlert(item)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Wilayah Kabupaten" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <div className="flex gap-2 w-full sm:w-2/3">
                                <div className="w-1/3">
                                    <select
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={provinsiKode}
                                        onChange={(e) => setProvinsiKode(e.target.value)}
                                    >
                                        <option value="">Semua Provinsi</option>
                                        {provinsiList.map((prov) => (
                                            <option key={prov.kode} value={prov.kode}>
                                                {prov.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-2/3 relative">
                                    <TextInput
                                        type="text"
                                        placeholder="Cari Kabupaten..."
                                        value={search}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
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
                            <Table<WilayahKabupaten>
                                headers={tableHeaders}
                                data={data.data}
                                keyExtractor={(item) => `${item.provinsi_kode}-${item.kode}`}
                                emptyMessage="Tidak ada data kabupaten."
                            />
                        </div>

                        <div className="mt-4">
                            <Pagination
                                currentPage={data.current_page}
                                totalPages={data.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Kabupaten">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="provinsi_kode" value="Provinsi" />
                        <select
                            id="provinsi_kode"
                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={formData.provinsi_kode}
                            onChange={(e) => setData('provinsi_kode', e.target.value)}
                        >
                            <option value="">Pilih Provinsi</option>
                            {provinsiList.map((prov) => (
                                <option key={prov.kode} value={prov.kode}>
                                    {prov.nama}
                                </option>
                            ))}
                        </select>
                        {errors.provinsi_kode && <p className="text-sm text-red-500">{errors.provinsi_kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="kode" value="Kode Kabupaten" />
                        <TextInput
                            id="kode"
                            value={formData.kode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('kode', e.target.value)}
                            placeholder="Contoh: 06"
                            maxLength={2}
                            className="w-full"
                        />
                        {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Kabupaten" />
                        <TextInput
                            id="nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: KABUPATEN TASIKMALAYA"
                            className="w-full"
                        />
                        {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Kabupaten">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-provinsi" value="Provinsi" />
                        <select
                            id="edit-provinsi"
                            className="w-full border-gray-300 bg-gray-100 rounded-md shadow-sm"
                            value={formData.provinsi_kode}
                            disabled
                        >
                            {provinsiList.map((prov) => (
                                <option key={prov.kode} value={prov.kode}>
                                    {prov.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-kode" value="Kode Kabupaten" />
                        <TextInput
                            id="edit-kode"
                            value={formData.kode}
                            disabled
                            className="w-full bg-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Kabupaten" />
                        <TextInput
                            id="edit-nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            className="w-full"
                        />
                        {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
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
                    <p>Apakah Anda yakin ingin menghapus kabupaten ini?</p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    PERINGATAN: Menghapus kabupaten akan menghapus semua Kecamatan dan Desa yang ada di bawahnya.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={() => setIsDeleteAlertOpen(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleDelete}>Hapus</Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
