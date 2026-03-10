import { useState, useMemo, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination } from '@/Components/ui';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { TextInput, InputLabel } from '@/Components/form';
import { useCRUDModal, useDeferredDataMutable } from '@/hooks';
import type { PageProps } from '@/types';

interface JenisSurat {
    id: string;
    nama: string;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    jenisSurat?: JenisSurat[];
    filters: {
        search?: string;
    };
}

const CACHE_TTL_MS = 60_000;

const Index = ({ auth, jenisSurat: initialJenisSurat }: Props) => {
    const { data: jenisSurat, isLoading, hasCached } = useDeferredDataMutable<JenisSurat[]>(
        `master_jenis_surat_${auth.user.id}`,
        initialJenisSurat,
        CACHE_TTL_MS
    );

    // Client-side Search & Pagination State
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Data
    const filteredData = useMemo(() => {
        if (!jenisSurat) return [];
        let data = jenisSurat;
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nama.toLowerCase().includes(lowerSearch)
            );
        }
        return data;
    }, [jenisSurat, search]);

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
    });

    // CRUD Modal hook
    const {
        isCreateModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        selectedItem: selectedJenis,
        openCreateModal: openCreate,
        openEditModal,
        openDeleteModal,
        closeCreateModal,
        closeEditModal,
        closeDeleteModal,
    } = useCRUDModal<JenisSurat>({
        onOpenCreate: () => {
            reset();
            clearErrors();
        },
        onOpenEdit: (item) => {
            setData({
                nama: item.nama,
            });
            clearErrors();
        },
    });

    const handleCreate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.jenis-surat.store'), {
            onSuccess: () => {
                closeCreateModal();
                reset();
            },
        });
    }, [post, closeCreateModal, reset]);

    const handleUpdate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJenis) return;
        put(route('master.jenis-surat.update', selectedJenis.id), {
            onSuccess: () => {
                closeEditModal();
                reset();
            },
        });
    }, [selectedJenis, put, closeEditModal, reset]);

    const handleDelete = useCallback(() => {
        if (!selectedJenis) return;
        router.delete(route('master.jenis-surat.destroy', selectedJenis.id), {
            onSuccess: () => {
                closeDeleteModal();
            },
        });
    }, [selectedJenis, closeDeleteModal]);

    return (
        <>
            <Head title="Master Jenis Surat" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Data Master Jenis Surat</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data referensi jenis surat</p>
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
                                    placeholder="Cari Jenis Surat..."
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
                            Tambah Jenis
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={3} />
                    </div>
                ) : (
                    <table className="min-w-full border-collapse border border-border-default">
                        <thead className="bg-surface-hover">
                            <tr>
                                <th className="px-4 py-3 border border-border-default text-center text-xs font-bold text-text-secondary uppercase w-16">No</th>
                                <th className="px-4 py-3 border border-border-default text-left text-xs font-bold text-text-secondary uppercase">Nama Jenis Surat</th>
                                <th className="px-4 py-3 border border-border-default text-center text-xs font-bold text-text-secondary uppercase w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface">
                            {paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-surface-hover">
                                    <td className="px-4 py-3 border border-border-default text-center text-text-secondary text-sm">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-4 py-3 border border-border-default font-medium text-text-primary">
                                        {item.nama}
                                    </td>
                                    <td className="px-4 py-3 border border-border-default text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => openEditModal(item)}
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => openDeleteModal(item)}
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
                                    <td colSpan={3} className="px-4 py-8 border border-border-default text-center text-text-secondary">
                                        {search ? 'Tidak ada jenis surat yang cocok dengan pencarian' : 'Tidak ada data jenis surat'}
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
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Tambah Jenis Surat">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Jenis Surat" />
                        <TextInput
                            id="nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: Surat Edaran"
                            className="w-full"
                            autoFocus
                        />
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={closeCreateModal}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Jenis Surat">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Jenis Surat" />
                        <TextInput
                            id="edit-nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            className="w-full"
                        />
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
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
                    <p>Apakah Anda yakin ingin menghapus jenis surat ini? Data ini mungkin digunakan pada surat masuk/keluar.</p>
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
