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
import CascadingWilayahSelect from '@/Components/form/CascadingWilayahSelect';

interface WilayahProvinsi {
    kode: string;
    nama: string;
}

interface WilayahKabupaten {
    provinsi_kode: string;
    kode: string;
    nama: string;
}

interface WilayahKecamatan {
    provinsi_kode: string;
    kabupaten_kode: string;
    kode: string;
    nama: string;
}

interface WilayahDesa {
    provinsi_kode: string;
    kabupaten_kode: string;
    kecamatan_kode: string;
    kode: string;
    nama: string;
    kecamatan?: {
        nama: string;
        kabupaten?: {
            nama: string;
            provinsi?: {
                nama: string;
            };
        };
    };
    [key: string]: unknown;
}

interface Props extends PageProps {
    data: {
        data: WilayahDesa[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
    };
    filters: {
        search?: string;
        provinsi_kode?: string;
        kabupaten_kode?: string;
        kecamatan_kode?: string;
    };
}

export default function Index({ auth, data, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [provinsiKode, setProvinsiKode] = useState(filters.provinsi_kode || '');
    const [kabupatenKode, setKabupatenKode] = useState(filters.kabupaten_kode || '');
    const [kecamatanKode, setKecamatanKode] = useState(filters.kecamatan_kode || '');
    
    const [provinsiList, setProvinsiList] = useState<WilayahProvinsi[]>([]);
    const [kabupatenList, setKabupatenList] = useState<WilayahKabupaten[]>([]);
    const [kecamatanList, setKecamatanList] = useState<WilayahKecamatan[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WilayahDesa | null>(null);

    const { data: formData, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        provinsi_kode: '',
        kabupaten_kode: '',
        kecamatan_kode: '',
        kode: '',
        nama: '',
    });

    // Fetch Provinsi List
    useEffect(() => {
        axios.get(route('master.wilayah.provinsi.all'))
            .then(response => setProvinsiList(response.data))
            .catch(error => console.error('Error fetching provinsi:', error));
    }, []);

    // Fetch Kabupaten List for Filter
    useEffect(() => {
        if (provinsiKode) {
            axios.get(route('master.wilayah.kabupaten.by-provinsi', provinsiKode))
                .then(response => setKabupatenList(response.data))
                .catch(error => console.error('Error fetching kabupaten:', error));
        } else {
            setKabupatenList([]);
            setKabupatenKode('');
            setKecamatanList([]);
            setKecamatanKode('');
        }
    }, [provinsiKode]);

    // Fetch Kecamatan List for Filter
    useEffect(() => {
        if (provinsiKode && kabupatenKode) {
            axios.get(route('master.wilayah.kecamatan.by-kabupaten', [provinsiKode, kabupatenKode]))
                .then(response => setKecamatanList(response.data))
                .catch(error => console.error('Error fetching kecamatan:', error));
        } else {
            setKecamatanList([]);
            setKecamatanKode('');
        }
    }, [provinsiKode, kabupatenKode]);

    // Debounced search and filter
    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                search !== (filters.search || '') || 
                provinsiKode !== (filters.provinsi_kode || '') ||
                kabupatenKode !== (filters.kabupaten_kode || '') ||
                kecamatanKode !== (filters.kecamatan_kode || '')
            ) {
                router.get(route('master.wilayah.desa.index'), { 
                    search, 
                    provinsi_kode: provinsiKode,
                    kabupaten_kode: kabupatenKode,
                    kecamatan_kode: kecamatanKode
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['data', 'filters'],
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, provinsiKode, kabupatenKode, kecamatanKode]);

    const handlePageChange = (page: number) => {
        router.get(route('master.wilayah.desa.index'), { 
            search, 
            provinsi_kode: provinsiKode,
            kabupaten_kode: kabupatenKode,
            kecamatan_kode: kecamatanKode,
            page 
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['data', 'filters'],
        });
    };

    const openCreateModal = () => {
        reset();
        // Pre-select if filtered
        if (provinsiKode) setData('provinsi_kode', provinsiKode);
        if (kabupatenKode) setData('kabupaten_kode', kabupatenKode);
        if (kecamatanKode) setData('kecamatan_kode', kecamatanKode);
        
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (item: WilayahDesa) => {
        setSelectedItem(item);
        setData({
            provinsi_kode: item.provinsi_kode,
            kabupaten_kode: item.kabupaten_kode,
            kecamatan_kode: item.kecamatan_kode,
            kode: item.kode,
            nama: item.nama,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const openDeleteAlert = (item: WilayahDesa) => {
        setSelectedItem(item);
        setIsDeleteAlertOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.wilayah.desa.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        put(route('master.wilayah.desa.update', [selectedItem.provinsi_kode, selectedItem.kabupaten_kode, selectedItem.kecamatan_kode, selectedItem.kode]), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        router.delete(route('master.wilayah.desa.destroy', [selectedItem.provinsi_kode, selectedItem.kabupaten_kode, selectedItem.kecamatan_kode, selectedItem.kode]), {
            onSuccess: () => {
                setIsDeleteAlertOpen(false);
            },
        });
    };

    const handleWilayahChange = (value: { provinsi?: string; kabupaten?: string; kecamatan?: string; desa?: string }) => {
        setData(data => ({
            ...data,
            provinsi_kode: value.provinsi || '',
            kabupaten_kode: value.kabupaten || '',
            kecamatan_kode: value.kecamatan || '',
        }));
    };

    const tableHeaders: TableHeader<WilayahDesa>[] = [
        { 
            key: 'no', 
            label: 'No',
            className: 'w-16',
            render: (_: unknown, __: unknown, index: number) => (data.from + index).toString()
        },
        { 
            key: 'full_kode', 
            label: 'Kode', 
            className: 'w-32',
            render: (_, item) => `${item.provinsi_kode}.${item.kabupaten_kode}.${item.kecamatan_kode}.${item.kode}`
        },
        { key: 'nama', label: 'Nama Desa' },
        { 
            key: 'kecamatan.nama', 
            label: 'Kecamatan',
            render: (_, item) => item.kecamatan?.nama || '-'
        },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-right',
            render: (_: unknown, item: WilayahDesa) => (
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
            <Head title="Wilayah Desa" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col xl:flex-row justify-between gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-4/5">
                                <div className="w-full sm:w-1/4">
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
                                <div className="w-full sm:w-1/4">
                                    <select
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={kabupatenKode}
                                        onChange={(e) => setKabupatenKode(e.target.value)}
                                        disabled={!provinsiKode}
                                    >
                                        <option value="">Semua Kabupaten</option>
                                        {kabupatenList.map((kab) => (
                                            <option key={kab.kode} value={kab.kode}>
                                                {kab.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full sm:w-1/4">
                                    <select
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={kecamatanKode}
                                        onChange={(e) => setKecamatanKode(e.target.value)}
                                        disabled={!kabupatenKode}
                                    >
                                        <option value="">Semua Kecamatan</option>
                                        {kecamatanList.map((kec) => (
                                            <option key={kec.kode} value={kec.kode}>
                                                {kec.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full sm:w-1/4 relative flex gap-2">
                                    <TextInput
                                        type="text"
                                        placeholder="Cari Desa..."
                                        value={search}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                        className="w-full"
                                    />
                                    <Button variant="secondary" disabled>
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={openCreateModal}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table<WilayahDesa>
                                headers={tableHeaders}
                                data={data.data}
                                keyExtractor={(item) => `${item.provinsi_kode}-${item.kabupaten_kode}-${item.kecamatan_kode}-${item.kode}`}
                                emptyMessage="Tidak ada data desa."
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
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Desa">
                <form onSubmit={handleCreate} className="space-y-4">
                    <CascadingWilayahSelect
                        level="desa"
                        value={{
                            provinsi: formData.provinsi_kode,
                            kabupaten: formData.kabupaten_kode,
                            kecamatan: formData.kecamatan_kode,
                        }}
                        onChange={handleWilayahChange}
                        errors={{
                            provinsi: errors.provinsi_kode,
                            kabupaten: errors.kabupaten_kode,
                            kecamatan: errors.kecamatan_kode,
                        }}
                    />
                    
                    <div className="space-y-2">
                        <InputLabel htmlFor="kode" value="Kode Desa" />
                        <TextInput
                            id="kode"
                            value={formData.kode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('kode', e.target.value)}
                            placeholder="Contoh: 2001"
                            maxLength={4}
                            className="w-full"
                        />
                        {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Desa" />
                        <TextInput
                            id="nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: DESA CONTOH"
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
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Desa">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <CascadingWilayahSelect
                        level="desa"
                        value={{
                            provinsi: formData.provinsi_kode,
                            kabupaten: formData.kabupaten_kode,
                            kecamatan: formData.kecamatan_kode,
                        }}
                        onChange={handleWilayahChange}
                        disabled={true}
                    />

                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-kode" value="Kode Desa" />
                        <TextInput
                            id="edit-kode"
                            value={formData.kode}
                            disabled
                            className="w-full bg-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Desa" />
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
                    <p>Apakah Anda yakin ingin menghapus desa ini?</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={() => setIsDeleteAlertOpen(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleDelete}>Hapus</Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
