import { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination } from '@/Components/ui';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useToast } from '@/Components/ui/Toast';
import { TextInput, InputLabel } from '@/Components/form';
import { useCRUDModal, useDeferredDataMutable } from '@/hooks';
import type { PageProps } from '@/types';

interface UnitKerja {
    id: string;
    nama: string;
    singkatan: string;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    unitKerja?: UnitKerja[];
    filters: {
        search?: string;
    };
}

const CACHE_TTL_MS = 60_000;

const Index = ({ auth, unitKerja: initialUnitKerja, filters }: Props) => {
    const { showToast } = useToast();
    const { data: unitKerja, isLoading, hasCached } = useDeferredDataMutable<UnitKerja[]>(
        `master_unit_kerja_${auth.user.id}`,
        initialUnitKerja,
        CACHE_TTL_MS
    );

    // Client-side Search & Pagination State
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Data
    const filteredData = useMemo(() => {
        if (!unitKerja) return [];
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

    return (
        <>
            <Head title="Unit Kerja" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Data Unit Kerja</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data unit kerja / OPD</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <div className="flex gap-2 flex-1 max-w-md">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Unit Kerja..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full px-3"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Button onClick={openCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Unit
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={4} />
                    </div>
                ) : (
                <table className="min-w-full divide-y divide-border-default">
                    <thead className="bg-surface-hover">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-16">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nama Unit Kerja</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Singkatan</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border-default">
                        {paginatedData.map((unit, index) => (
                            <tr key={unit.id} className="hover:bg-surface-hover">
                                <td className="px-4 py-3 text-text-secondary text-sm">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-4 py-3 font-medium text-text-primary">
                                    {unit.nama}
                                </td>
                                <td className="px-4 py-3 text-text-secondary">
                                    {unit.singkatan || '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => openEditModal(unit)}
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => openDeleteModal(unit)}
                                            title="Hapus"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                                    {search ? 'Tidak ada unit kerja yang cocok dengan pencarian' : 'Tidak ada data unit kerja'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
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
                        {errors.singkatan && <p className="text-sm text-danger">{errors.singkatan}</p>}
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
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-singkatan" value="Singkatan" />
                        <TextInput
                            id="edit-singkatan"
                            value={data.singkatan}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('singkatan', e.target.value)}
                            className="w-full"
                        />
                        {errors.singkatan && <p className="text-sm text-danger">{errors.singkatan}</p>}
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
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Index;
