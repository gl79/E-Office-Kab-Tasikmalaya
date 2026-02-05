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
import { useToast } from '@/Components/ui/Toast';
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
    provinsi?: WilayahProvinsi;
    kecamatan_count?: number;
}

interface Props extends PageProps {
    kabupaten?: WilayahKabupaten[];
    filters: {
        search?: string;
        provinsi_kode?: string;
    };
}

const CACHE_TTL_MS = 60_000;

export default function Index({ auth, kabupaten: initialKabupaten, filters }: Props) {
    const { showToast } = useToast();
    const { data: kabupaten, isLoading, hasCached } = useDeferredDataMutable<WilayahKabupaten[]>(
        `master_wilayah_kabupaten_${auth.user.id}`,
        initialKabupaten,
        CACHE_TTL_MS
    );

    // Client-side Search & Pagination State
    const [search, setSearch] = useState('');
    const [provinsiKode, setProvinsiKode] = useState(filters.provinsi_kode || '');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Dropdown Data
    const [provinsiList, setProvinsiList] = useState<WilayahProvinsi[]>([]);

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

    // Filter Data
    const filteredData = useMemo(() => {
        if (!kabupaten) return [];
        let data = kabupaten;

        // Filter by Search
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nama.toLowerCase().includes(lowerSearch) ||
                item.kode.toLowerCase().includes(lowerSearch)
            );
        }

        // Filter by Provinsi
        if (provinsiKode) {
            data = data.filter(item => item.provinsi_kode === provinsiKode);
        }

        return data;
    }, [kabupaten, search, provinsiKode]);

    // Paginate Data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset page on search/filter
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleProvinsiFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProvinsiKode(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WilayahKabupaten | null>(null);

    const { data: formData, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        provinsi_kode: '',
        kode: '',
        nama: '',
    });

    const openCreateModal = () => {
        reset();
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
            render: (_: unknown, __: unknown, index: number) => ((currentPage - 1) * itemsPerPage + index + 1).toString()
        },
        { key: 'kode', label: 'Kode', className: 'w-24' },
        {
            key: 'provinsi',
            label: 'Provinsi',
            render: (_: unknown, item: WilayahKabupaten) => item.provinsi?.nama ?? '-'
        },
        { key: 'nama', label: 'Nama Kabupaten' },
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

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Wilayah Kabupaten</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data kabupaten/kota</p>
            </div>

            {/* Main Content */}
            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="flex gap-2 w-full sm:w-80">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Kabupaten..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full px-2"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                            <select
                                className="border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm w-full sm:w-48"
                                value={provinsiKode}
                                onChange={handleProvinsiFilterChange}
                            >
                                <option value="">Semua Provinsi</option>
                                {provinsiList.map(prov => (
                                    <option key={prov.kode} value={prov.kode}>
                                        {prov.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={openCreateModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Kabupaten
                        </Button>
                    </div>
                </div>



                {/* Table */}
                {isLoading && !hasCached ? (
                     <div className="p-4">
                        <TableShimmer columns={5} />
                    </div>
                ) : (
                    <Table<WilayahKabupaten>
                        headers={tableHeaders}
                        data={paginatedData}
                        keyExtractor={(item) => `${item.provinsi_kode}.${item.kode}`}
                        emptyMessage={search || provinsiKode ? "Tidak ada kabupaten yang cocok." : "Tidak ada data kabupaten."}
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
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
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
                            className="border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm w-full"
                            value={formData.provinsi_kode}
                            onChange={(e) => setData('provinsi_kode', e.target.value)}
                            required
                        >
                            <option value="">Pilih Provinsi</option>
                            {provinsiList.map(prov => (
                                <option key={prov.kode} value={prov.kode}>
                                    {prov.nama}
                                </option>
                            ))}
                        </select>
                        {errors.provinsi_kode && <p className="text-sm text-danger">{errors.provinsi_kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="kode" value="Kode Kabupaten" />
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
                        <InputLabel htmlFor="nama" value="Nama Kabupaten" />
                        <TextInput
                            id="nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: TASIKMALAYA"
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
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Kabupaten">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-provinsi_kode" value="Provinsi" />
                        <select
                            id="edit-provinsi_kode"
                            className="border-border-default rounded-md shadow-sm w-full bg-surface-hover"
                            value={formData.provinsi_kode}
                            disabled
                        >
                            {provinsiList.map(prov => (
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
                            className="w-full bg-surface-hover"
                        />
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Kabupaten" />
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
                    <p className="text-text-primary">Apakah Anda yakin ingin menghapus kabupaten ini?</p>
                    <div className="bg-warning-light border-l-4 border-warning p-4 rounded">
                        <p className="text-sm text-accent-dark">
                            <strong>PERINGATAN:</strong> Menghapus kabupaten akan menghapus semua Kecamatan dan Desa yang ada di bawahnya.
                        </p>
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
