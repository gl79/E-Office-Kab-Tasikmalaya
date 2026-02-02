import { useState, useMemo, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination } from '@/Components/ui';
import { useToast } from '@/Components/ui/Toast';
import { TextInput, InputLabel } from '@/Components/form';
import { useCRUDModal } from '@/hooks/useCRUDModal';
import type { PageProps } from '@/types';

interface IndeksSurat {
    id: string;
    kode: string;
    nama: string;
    urutan: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

interface Props extends PageProps {
    indeksSurat: IndeksSurat[];
    filters: {
        search?: string;
    };
}

const Index = ({ auth, indeksSurat, filters }: Props) => {
    const { showToast } = useToast();

    // Client-side Search & Pagination State
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Data
    const filteredData = useMemo(() => {
        let data = indeksSurat;
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.kode.toLowerCase().includes(lowerSearch) ||
                item.nama.toLowerCase().includes(lowerSearch)
            );
        }
        return data;
    }, [indeksSurat, search]);

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
        kode: '',
        nama: '',
        urutan: 0,
    });

    // CRUD Modal hook
    const {
        isCreateModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        selectedItem: selectedIndeks,
        openCreateModal,
        openEditModal,
        openDeleteModal,
        closeCreateModal,
        closeEditModal,
        closeDeleteModal,
    } = useCRUDModal<IndeksSurat>({
        onOpenCreate: () => {
            reset();
            clearErrors();
        },
        onOpenEdit: (indeks) => {
            setData({
                kode: indeks.kode,
                nama: indeks.nama,
                urutan: indeks.urutan || 0,
            });
            clearErrors();
        },
    });

    const handleCreate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.indeks-surat.store'), {
            onSuccess: () => {
                closeCreateModal();
                reset();
                showToast('success', 'Indeks Surat berhasil ditambahkan.');
            },
        });
    }, [post, closeCreateModal, reset, showToast]);

    const handleUpdate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIndeks) return;
        put(route('master.indeks-surat.update', selectedIndeks.id), {
            onSuccess: () => {
                closeEditModal();
                reset();
                showToast('success', 'Indeks Surat berhasil diperbarui.');
            },
        });
    }, [selectedIndeks, put, closeEditModal, reset, showToast]);

    const handleDelete = useCallback(() => {
        if (!selectedIndeks) return;
        router.delete(route('master.indeks-surat.destroy', selectedIndeks.id), {
            onSuccess: () => {
                closeDeleteModal();
                showToast('success', 'Indeks Surat berhasil dihapus.');
            },
        });
    }, [selectedIndeks, closeDeleteModal, showToast]);

    return (
        <>
            <Head title="Indeks Surat" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Data Indeks Surat</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data klasifikasi / indeks surat</p>
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
                                    placeholder="Cari Kode atau Nama..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Button onClick={openCreateModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Indeks
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <table className="min-w-full divide-y divide-border-default">
                    <thead className="bg-surface-hover">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-16">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-32">Kode</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nama Indeks</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-24">Urutan</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border-default">
                        {paginatedData.map((indeks, index) => (
                            <tr key={indeks.id} className="hover:bg-surface-hover">
                                <td className="px-4 py-3 text-text-secondary text-sm">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
                                        {indeks.kode}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-text-primary">
                                    {indeks.nama}
                                </td>
                                <td className="px-4 py-3 text-text-secondary">
                                    {indeks.urutan}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => openEditModal(indeks)}
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => openDeleteModal(indeks)}
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
                                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                                    {search ? 'Tidak ada indeks surat yang cocok dengan pencarian' : 'Tidak ada data indeks surat'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

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
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Tambah Indeks Surat">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="kode" value="Kode" />
                        <TextInput
                            id="kode"
                            value={data.kode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('kode', e.target.value)}
                            placeholder="Contoh: 001"
                            className="w-full"
                        />
                        {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama Indeks" />
                        <TextInput
                            id="nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: Surat Keputusan"
                            className="w-full"
                        />
                        {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="urutan" value="Urutan" />
                        <TextInput
                            id="urutan"
                            type="number"
                            value={data.urutan}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('urutan', parseInt(e.target.value))}
                            placeholder="0"
                            className="w-full"
                        />
                        {errors.urutan && <p className="text-sm text-red-500">{errors.urutan}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={closeCreateModal}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Indeks Surat">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-kode" value="Kode" />
                        <TextInput
                            id="edit-kode"
                            value={data.kode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('kode', e.target.value)}
                            className="w-full"
                        />
                        {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama Indeks" />
                        <TextInput
                            id="edit-nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            className="w-full"
                        />
                        {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-urutan" value="Urutan" />
                        <TextInput
                            id="edit-urutan"
                            type="number"
                            value={data.urutan}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('urutan', parseInt(e.target.value))}
                            className="w-full"
                        />
                        {errors.urutan && <p className="text-sm text-red-500">{errors.urutan}</p>}
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
                    <p>Apakah Anda yakin ingin menghapus indeks surat ini? Data akan dipindahkan ke arsip.</p>
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
