import { useState, useEffect, useMemo } from 'react';
import TableShimmer from '@/Components/shimmer/TableShimmer';
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
import CascadingWilayahSelect from '@/Components/form/CascadingWilayahSelect';
import { useDeferredDataMutable } from '@/hooks';
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
}

interface Props extends PageProps {
    desa?: WilayahDesa[];
    filters: {
        search?: string;
        provinsi_kode?: string;
        kabupaten_kode?: string;
        kecamatan_kode?: string;
    };
}

const CACHE_TTL_MS = 60_000;

export default function Index({ auth, desa: initialDesa, filters }: Props) {
    const { data: desa, isLoading, hasCached } = useDeferredDataMutable<WilayahDesa[]>(
        `master_wilayah_desa_${auth.user.id}`,
        initialDesa,
        CACHE_TTL_MS
    );

    const [provinsiKode, setProvinsiKode] = useState(filters.provinsi_kode || '');
    const [kabupatenKode, setKabupatenKode] = useState(filters.kabupaten_kode || '');
    const [kecamatanKode, setKecamatanKode] = useState(filters.kecamatan_kode || '');
    const [search, setSearch] = useState(filters.search || '');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Client-side filtering
    const filteredData = useMemo(() => {
        if (!desa) return [];
        let data = desa;

        if (provinsiKode) {
            data = data.filter(item => item.provinsi_kode === provinsiKode);
        }

        if (kabupatenKode) {
            data = data.filter(item => item.kabupaten_kode === kabupatenKode);
        }

        if (kecamatanKode) {
            data = data.filter(item => item.kecamatan_kode === kecamatanKode);
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nama.toLowerCase().includes(lowerSearch) ||
                item.kode.toLowerCase().includes(lowerSearch)
            );
        }

        return data;
    }, [desa, provinsiKode, kabupatenKode, kecamatanKode, search]);

    // Client-side pagination
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

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

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [provinsiKode, kabupatenKode, kecamatanKode, search]);

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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

        // Fix: Use array for composite key
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
            render: (_: unknown, __: unknown, index: number) => ((currentPage - 1) * itemsPerPage + index + 1).toString()
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

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Wilayah Desa</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data desa/kelurahan</p>
            </div>

            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col xl:flex-row justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-4/5">
                            <div className="flex gap-2 w-full sm:w-1/4">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Desa..."
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="w-full px-2"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="w-full sm:w-1/4">
                                <select
                                    className="w-full h-10 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm"
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
                                    className="w-full h-10 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm"
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
                                    className="w-full h-10 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm"
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
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={openCreateModal}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Desa
                            </Button>
                        </div>
                    </div>
                </div>



                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={5} />
                    </div>
                ) : (
                    <Table<WilayahDesa>
                        headers={tableHeaders}
                        data={paginatedData}
                        keyExtractor={(item) => `${item.provinsi_kode}-${item.kabupaten_kode}-${item.kecamatan_kode}-${item.kode}`}
                        emptyMessage="Tidak ada data desa."
                    />
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-border-default">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-text-secondary">
                            Menampilkan {paginatedData.length} dari {filteredData.length} data
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                            onPageChange={handlePageChange}
                        />
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
                            className="w-full px-2"
                        />
                        {errors.kode && <p className="text-sm text-danger">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Desa" />
                        <TextInput
                            id="nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: DESA CONTOH"
                            className="w-full px-2"
                        />
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
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
                            className="w-full px-2 bg-surface-hover"
                        />
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Desa" />
                        <TextInput
                            id="edit-nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            className="w-full px-2"
                        />
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
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
