import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import Table, { TableHeader } from '@/Components/ui/Table';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import TextInput from '@/Components/form/TextInput';
import InputLabel from '@/Components/form/InputLabel';
import { useServerSearch } from '@/hooks/useServerSearch';
import type { PageProps } from '@/types';

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
    kabupaten?: {
        nama: string;
        provinsi?: {
            nama: string;
        };
    };
    desa_count?: number;
    [key: string]: unknown;
}

interface Props extends PageProps {
    data: {
        data: WilayahKecamatan[];
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
    };
}

export default function Index({ auth, data, filters }: Props) {
    const [provinsiKode, setProvinsiKode] = useState(filters.provinsi_kode || '');
    const [kabupatenKode, setKabupatenKode] = useState(filters.kabupaten_kode || '');
    
    const { search, setSearch } = useServerSearch({
        url: route('master.wilayah.kecamatan.index'),
        initialSearch: filters.search,
        filters: { 
            provinsi_kode: provinsiKode,
            kabupaten_kode: kabupatenKode
        }
    });
    
    const [provinsiList, setProvinsiList] = useState<WilayahProvinsi[]>([]);
    const [kabupatenList, setKabupatenList] = useState<WilayahKabupaten[]>([]);
    
    // For Modal
    const [modalKabupatenList, setModalKabupatenList] = useState<WilayahKabupaten[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WilayahKecamatan | null>(null);

    const { data: formData, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        provinsi_kode: '',
        kabupaten_kode: '',
        kode: '',
        nama: '',
    });

    // Fetch Provinsi List
    useEffect(() => {
        axios.get(route('master.wilayah.provinsi.all'))
            .then(response => setProvinsiList(response.data))
            .catch(error => console.error('Error fetching provinsi:', error));
    }, []);

    // Fetch Kabupaten List for Filter when Provinsi changes
    useEffect(() => {
        if (provinsiKode) {
            axios.get(route('master.wilayah.kabupaten.by-provinsi', provinsiKode))
                .then(response => setKabupatenList(response.data))
                .catch(error => console.error('Error fetching kabupaten:', error));
        } else {
            setKabupatenList([]);
            setKabupatenKode('');
        }
    }, [provinsiKode]);

    // Fetch Kabupaten List for Modal when Provinsi changes in form
    useEffect(() => {
        if (formData.provinsi_kode) {
            axios.get(route('master.wilayah.kabupaten.by-provinsi', formData.provinsi_kode))
                .then(response => setModalKabupatenList(response.data))
                .catch(error => console.error('Error fetching modal kabupaten:', error));
        } else {
            setModalKabupatenList([]);
        }
    }, [formData.provinsi_kode]);

    const handlePageChange = (page: number) => {
        const url = data.links.find((l: any) => l.label == page)?.url;
        if (url) {
            router.get(url, { 
                search, 
                provinsi_kode: provinsiKode,
                kabupaten_kode: kabupatenKode
            }, {
                preserveState: true,
                preserveScroll: true,
                only: ['data', 'filters'],
            });
        }
    };

    const openCreateModal = () => {
        reset();
        // Pre-select if filtered
        if (provinsiKode) setData('provinsi_kode', provinsiKode);
        if (kabupatenKode) setData('kabupaten_kode', kabupatenKode);
        
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (item: WilayahKecamatan) => {
        setSelectedItem(item);
        setData({
            provinsi_kode: item.provinsi_kode,
            kabupaten_kode: item.kabupaten_kode,
            kode: item.kode,
            nama: item.nama,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const openDeleteAlert = (item: WilayahKecamatan) => {
        setSelectedItem(item);
        setIsDeleteAlertOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.wilayah.kecamatan.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        put(route('master.wilayah.kecamatan.update', [selectedItem.provinsi_kode, selectedItem.kabupaten_kode, selectedItem.kode]), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        router.delete(route('master.wilayah.kecamatan.destroy', [selectedItem.provinsi_kode, selectedItem.kabupaten_kode, selectedItem.kode]), {
            onSuccess: () => {
                setIsDeleteAlertOpen(false);
            },
        });
    };

    const tableHeaders: TableHeader<WilayahKecamatan>[] = [
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
            render: (_, item) => `${item.provinsi_kode}.${item.kabupaten_kode}.${item.kode}`
        },
        { key: 'nama', label: 'Nama Kecamatan' },
        { 
            key: 'kabupaten.nama', 
            label: 'Kabupaten',
            render: (_, item) => item.kabupaten?.nama || '-'
        },
        { 
            key: 'desa_count', 
            label: 'Jumlah Desa',
            render: (value) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{String(value)}</span>
        },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-right',
            render: (_: unknown, item: WilayahKecamatan) => (
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
            <Head title="Wilayah Kecamatan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-3/4">
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
                                <div className="w-full sm:w-2/4 relative flex gap-2">
                                    <TextInput
                                        type="text"
                                        placeholder="Cari Kecamatan..."
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
                            <Table<WilayahKecamatan>
                                headers={tableHeaders}
                                data={data.data}
                                keyExtractor={(item) => `${item.provinsi_kode}-${item.kabupaten_kode}-${item.kode}`}
                                emptyMessage="Tidak ada data kecamatan."
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
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Kecamatan">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                            <InputLabel htmlFor="kabupaten_kode" value="Kabupaten" />
                            <select
                                id="kabupaten_kode"
                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={formData.kabupaten_kode}
                                onChange={(e) => setData('kabupaten_kode', e.target.value)}
                                disabled={!formData.provinsi_kode}
                            >
                                <option value="">Pilih Kabupaten</option>
                                {modalKabupatenList.map((kab) => (
                                    <option key={kab.kode} value={kab.kode}>
                                        {kab.nama}
                                    </option>
                                ))}
                            </select>
                            {errors.kabupaten_kode && <p className="text-sm text-red-500">{errors.kabupaten_kode}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="kode" value="Kode Kecamatan" />
                        <TextInput
                            id="kode"
                            value={formData.kode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('kode', e.target.value)}
                            placeholder="Contoh: 01"
                            maxLength={2}
                            className="w-full"
                        />
                        {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Kecamatan" />
                        <TextInput
                            id="nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: CIPATUJAH"
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
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Kecamatan">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                            <InputLabel htmlFor="edit-kabupaten" value="Kabupaten" />
                            <select
                                id="edit-kabupaten"
                                className="w-full border-gray-300 bg-gray-100 rounded-md shadow-sm"
                                value={formData.kabupaten_kode}
                                disabled
                            >
                                {modalKabupatenList.map((kab) => (
                                    <option key={kab.kode} value={kab.kode}>
                                        {kab.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-kode" value="Kode Kecamatan" />
                        <TextInput
                            id="edit-kode"
                            value={formData.kode}
                            disabled
                            className="w-full bg-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Kecamatan" />
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
                    <p>Apakah Anda yakin ingin menghapus kecamatan ini?</p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    PERINGATAN: Menghapus kecamatan akan menghapus semua Desa yang ada di bawahnya.
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
