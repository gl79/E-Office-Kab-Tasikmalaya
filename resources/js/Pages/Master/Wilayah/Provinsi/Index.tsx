import { useState, useMemo, useEffect } from 'react';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
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
    kabupaten_count?: number;
}

interface Props extends PageProps {
    provinsi?: WilayahProvinsi[]; // Changed from paginated object to array
    filters: {
        search?: string;
    };
}

const CACHE_TTL_MS = 60_000;

export default function Index({ auth, provinsi: initialProvinsi, filters }: Props) {
    const { showToast } = useToast();
    const { data: provinsi, isLoading, hasCached } = useDeferredDataMutable<WilayahProvinsi[]>(
        `master_wilayah_provinsi_${auth.user.id}`,
        initialProvinsi,
        CACHE_TTL_MS
    );

    // Client-side Search & Pagination State
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Data
    const filteredData = useMemo(() => {
        if (!provinsi) return [];
        let data = provinsi;
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item => 
                item.nama.toLowerCase().includes(lowerSearch) || 
                item.kode.toLowerCase().includes(lowerSearch)
            );
        }
        return data;
    }, [provinsi, search]);

    // Paginate Data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WilayahProvinsi | null>(null);

    const { data: formData, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        nama: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.wilayah.provinsi.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                showToast('success', 'Provinsi berhasil ditambahkan');
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        put(route('master.wilayah.provinsi.update', selectedItem.kode), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                showToast('success', 'Provinsi berhasil diperbarui');
            },
        });
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        router.delete(route('master.wilayah.provinsi.destroy', selectedItem.kode), {
            onSuccess: () => {
                setIsDeleteAlertOpen(false);
                showToast('success', 'Provinsi berhasil dihapus');
            },
        });
    };

    const openEditModal = (item: WilayahProvinsi) => {
        setSelectedItem(item);
        setData({
            kode: item.kode,
            nama: item.nama,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const tableHeaders: TableHeader<WilayahProvinsi>[] = [
        {
            key: 'no',
            label: 'No',
            className: 'w-16',
            render: (_, __, index) => ((currentPage - 1) * itemsPerPage + index + 1).toString()
        },
        { key: 'kode', label: 'Kode', className: 'w-24' },
        { key: 'nama', label: 'Nama Provinsi' },
        {
            key: 'actions',
            label: 'Aksi',
            className: 'text-right',
            render: (_, item) => (
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(item)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => { setSelectedItem(item); setIsDeleteAlertOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Wilayah Provinsi" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Wilayah Provinsi</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data provinsi</p>
            </div>

            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-2 w-full sm:w-80">
                            <TextInput
                                type="text"
                                placeholder="Cari provinsi..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="w-full"
                            />
                            <Button variant="secondary" disabled>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Provinsi
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={5} />
                    </div>
                ) : (
                    <Table<WilayahProvinsi>
                        headers={tableHeaders}
                        data={paginatedData}
                        keyExtractor={(item) => item.kode}
                        emptyMessage={search ? "Tidak ada provinsi yang cocok dengan pencarian." : "Tidak ada data provinsi."}
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
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Provinsi">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="kode" value="Kode Provinsi" />
                        <TextInput
                            id="kode"
                            value={formData.kode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('kode', e.target.value)}
                            placeholder="Contoh: 32"
                            maxLength={2}
                            className="w-full"
                        />
                        {errors.kode && <p className="text-sm text-danger">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Provinsi" />
                        <TextInput
                            id="nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: JAWA BARAT"
                            className="w-full"
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
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Provinsi">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-kode" value="Kode Provinsi" />
                        <TextInput
                            id="edit-kode"
                            value={formData.kode}
                            disabled
                            className="w-full bg-surface-hover"
                        />
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Provinsi" />
                        <TextInput
                            id="edit-nama"
                            value={formData.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            className="w-full"
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
                    <p>Apakah Anda yakin ingin menghapus provinsi ini?</p>
                    <div className="bg-warning-light border-l-4 border-warning p-4 rounded">
                        <p className="text-sm text-accent-dark">
                            <strong>PERINGATAN:</strong> Menghapus provinsi akan menghapus semua Kabupaten, Kecamatan, dan Desa yang ada di bawahnya.
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
