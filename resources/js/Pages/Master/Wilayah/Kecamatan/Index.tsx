import { useState, useEffect, useMemo } from 'react';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, MapPin } from 'lucide-react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import Table, { TableHeader } from '@/Components/ui/Table';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import TextInput from '@/Components/form/TextInput';
import InputLabel from '@/Components/form/InputLabel';
import type { PageProps } from '@/types';
import { useDeferredDataMutable } from '@/hooks';

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
    latitude?: number | null;
    longitude?: number | null;
    alamat?: string | null;
    kabupaten?: {
        nama: string;
        provinsi?: {
            nama: string;
        };
    };
    desa_count?: number;
}

interface Props extends PageProps {
    kecamatan?: WilayahKecamatan[];
    filters: {
        search?: string;
        provinsi_kode?: string;
        kabupaten_kode?: string;
    };
}

const CACHE_TTL_MS = 60_000;

export default function Index({ auth, kecamatan: initialKecamatan, filters }: Props) {
    const { data: kecamatan, isLoading, hasCached } = useDeferredDataMutable<WilayahKecamatan[]>(
        `master_wilayah_kecamatan_${auth.user.id}`,
        initialKecamatan,
        CACHE_TTL_MS
    );

    const [provinsiKode, setProvinsiKode] = useState(filters.provinsi_kode || '');
    const [kabupatenKode, setKabupatenKode] = useState(filters.kabupaten_kode || '');
    const [search, setSearch] = useState(filters.search || '');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Client-side filtering
    const filteredData = useMemo(() => {
        if (!kecamatan) return [];
        let data = kecamatan;

        if (provinsiKode) {
            data = data.filter(item => item.provinsi_kode === provinsiKode);
        }

        if (kabupatenKode) {
            data = data.filter(item => item.kabupaten_kode === kabupatenKode);
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nama.toLowerCase().includes(lowerSearch) ||
                item.kode.toLowerCase().includes(lowerSearch)
            );
        }

        return data;
    }, [kecamatan, provinsiKode, kabupatenKode, search]);

    // Client-side pagination
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

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
        latitude: '',
        longitude: '',
        alamat: '',
    });

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [provinsiKode, kabupatenKode, search]);

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
        setCurrentPage(page);
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
            latitude: item.latitude != null ? String(item.latitude) : '',
            longitude: item.longitude != null ? String(item.longitude) : '',
            alamat: item.alamat || '',
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

        // Fix: Use array for composite key
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
            className: 'w-16 text-center',
            render: (_: unknown, __: unknown, index: number) => ((currentPage - 1) * itemsPerPage + index + 1).toString()
        },
        {
            key: 'full_kode',
            label: 'Kode',
            className: 'w-24 text-center',
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
            render: (value) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark">{String(value)}</span>
        },
        {
            key: 'koordinat',
            label: 'Koordinat',
            render: (_: unknown, item: WilayahKecamatan) => (
                item.latitude && item.longitude ? (
                    <span className="inline-flex items-center gap-1 text-xs text-success">
                        <MapPin className="h-3 w-3" />
                        {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                    </span>
                ) : (
                    <span className="text-xs text-text-tertiary italic">Belum diisi</span>
                )
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-center',
            render: (_: unknown, item: WilayahKecamatan) => (
                <div className="flex justify-center gap-2">
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

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Data Master Wilayah Kecamatan</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data kecamatan</p>
            </div>

            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-3/4">
                            <div className="flex gap-2 w-full sm:w-2/4">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Kecamatan..."
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="w-full px-3"
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
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={openCreateModal}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Kecamatan
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
                    <Table<WilayahKecamatan>
                        headers={tableHeaders}
                        data={paginatedData}
                        keyExtractor={(item) => `${item.provinsi_kode}-${item.kabupaten_kode}-${item.kode}`}
                        emptyMessage="Tidak ada data kecamatan."
                        bordered
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
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Kecamatan">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <InputLabel htmlFor="provinsi_kode" value="Provinsi" />
                            <select
                                id="provinsi_kode"
                                className="w-full border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm"
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
                            {errors.provinsi_kode && <p className="text-sm text-danger">{errors.provinsi_kode}</p>}
                        </div>
                        <div className="space-y-2">
                            <InputLabel htmlFor="kabupaten_kode" value="Kabupaten" />
                            <select
                                id="kabupaten_kode"
                                className="w-full border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm"
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
                            {errors.kabupaten_kode && <p className="text-sm text-danger">{errors.kabupaten_kode}</p>}
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
                            className="w-full px-2"
                        />
                        {errors.kode && <p className="text-sm text-danger">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Kecamatan" />
                        <TextInput
                            id="nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: CIPATUJAH"
                            className="w-full px-2"
                        />
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
                    </div>

                    {/* Geo Fields */}
                    <div className="border-t border-border-default pt-4 mt-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" /> Data Geolokasi <span className="text-text-tertiary font-normal">(Opsional)</span>
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <InputLabel htmlFor="latitude" value="Latitude" />
                                <TextInput
                                    id="latitude"
                                    value={formData.latitude}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('latitude', e.target.value)}
                                    placeholder="Contoh: -7.459600"
                                    className="w-full px-2"
                                />
                                {errors.latitude && <p className="text-sm text-danger">{errors.latitude}</p>}
                            </div>
                            <div className="space-y-2">
                                <InputLabel htmlFor="longitude" value="Longitude" />
                                <TextInput
                                    id="longitude"
                                    value={formData.longitude}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('longitude', e.target.value)}
                                    placeholder="Contoh: 107.982390"
                                    className="w-full px-2"
                                />
                                {errors.longitude && <p className="text-sm text-danger">{errors.longitude}</p>}
                            </div>
                        </div>
                        <div className="space-y-2 mt-4">
                            <InputLabel htmlFor="alamat" value="Alamat Lengkap" />
                            <textarea
                                id="alamat"
                                value={formData.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                placeholder="Contoh: Taraju, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474"
                                rows={2}
                                className="w-full border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm px-3 py-2 text-sm"
                            />
                            {errors.alamat && <p className="text-sm text-danger">{errors.alamat}</p>}
                        </div>
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
                                className="w-full border-border-default bg-surface-hover rounded-md shadow-sm"
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
                                className="w-full border-border-default bg-surface-hover rounded-md shadow-sm"
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
                            className="w-full px-2 bg-surface-hover"
                        />
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Kecamatan" />
                        <TextInput
                            id="edit-nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            className="w-full px-2"
                        />
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
                    </div>

                    {/* Geo Fields */}
                    <div className="border-t border-border-default pt-4 mt-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" /> Data Geolokasi <span className="text-text-tertiary font-normal">(Opsional)</span>
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <InputLabel htmlFor="edit-latitude" value="Latitude" />
                                <TextInput
                                    id="edit-latitude"
                                    value={formData.latitude}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('latitude', e.target.value)}
                                    placeholder="Contoh: -7.459600"
                                    className="w-full px-2"
                                />
                                {errors.latitude && <p className="text-sm text-danger">{errors.latitude}</p>}
                            </div>
                            <div className="space-y-2">
                                <InputLabel htmlFor="edit-longitude" value="Longitude" />
                                <TextInput
                                    id="edit-longitude"
                                    value={formData.longitude}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('longitude', e.target.value)}
                                    placeholder="Contoh: 107.982390"
                                    className="w-full px-2"
                                />
                                {errors.longitude && <p className="text-sm text-danger">{errors.longitude}</p>}
                            </div>
                        </div>
                        <div className="space-y-2 mt-4">
                            <InputLabel htmlFor="edit-alamat" value="Alamat Lengkap" />
                            <textarea
                                id="edit-alamat"
                                value={formData.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                placeholder="Contoh: Taraju, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474"
                                rows={2}
                                className="w-full border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm px-3 py-2 text-sm"
                            />
                            {errors.alamat && <p className="text-sm text-danger">{errors.alamat}</p>}
                        </div>
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
                    <div className="bg-warning-light border-l-4 border-warning p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-accent-dark">
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
