import { useState, useRef, FormEvent, useMemo, useCallback } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination, useToast } from '@/Components/ui';
import { InputLabel, TextInput, InputError } from '@/Components/form';
import { PageProps, Jabatan } from '@/types';
import { Search, Pencil, Trash2, Plus, Briefcase, ShieldCheck, ArrowUpDown } from 'lucide-react';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks';

interface Props extends PageProps {
    data?: Jabatan[];
}

const CACHE_TTL_MS = 60_000;

const Index = ({ data }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const { showToast } = useToast();
    const { data: jabatans, isLoading, hasCached } = useDeferredDataMutable<Jabatan[]>(
        `master_jabatan_${auth.user.id}`,
        data,
        CACHE_TTL_MS
    );
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Jabatan | null>(null);
    const [deleteItem, setDeleteItem] = useState<Jabatan | null>(null);

    // Client-side search
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const filteredData = useMemo(() => {
        let result = jabatans ?? [];

        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(item =>
                item.nama.toLowerCase().includes(searchLower) ||
                String(item.level).includes(searchLower)
            );
        }

        return result;
    }, [jabatans, search]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const form = useForm({
        nama: '',
        level: '' as string | number,
        can_dispose: false,
    });

    const openCreate = useCallback(() => {
        form.reset();
        form.clearErrors();
        setEditItem(null);
        setShowModal(true);
    }, [form]);

    const openEdit = useCallback((item: Jabatan) => {
        form.setData({
            nama: item.nama,
            level: item.level,
            can_dispose: item.can_dispose,
        });
        form.clearErrors();
        setEditItem(item);
        setShowModal(true);
    }, [form]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                form.reset();
                setEditItem(null);
                showToast('success', editItem ? 'Jabatan berhasil diperbarui.' : 'Jabatan berhasil ditambahkan.');
            },
        };

        if (editItem) {
            form.patch(route('master.jabatans.update', editItem.id), options);
        } else {
            form.post(route('master.jabatans.store'), options);
        }
    };

    const handleDelete = () => {
        if (!deleteItem) return;

        router.delete(route('master.jabatans.destroy', deleteItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteItem(null);
                showToast('success', 'Jabatan berhasil dihapus.');
            },
            onError: (errors) => {
                setDeleteItem(null);
                showToast('error', errors.message || 'Gagal menghapus jabatan.');
            },
        });
    };

    // Jabatan sistem tidak bisa diedit
    const isSystemEdit = editItem?.is_system === true;

    return (
        <>
            <Head title="Data Master - Jabatan" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Data Master Jabatan</h1>
                    <p className="text-text-secondary text-sm mt-1">Kelola jabatan struktural dan hierarki disposisi</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Jabatan
                </Button>
            </div>

            {/* Search */}
            <div className="mb-4 flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Cari nama jabatan..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-default bg-surface text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
                <span className="text-sm text-text-secondary">
                    {filteredData.length} jabatan
                </span>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border-default bg-surface overflow-hidden shadow-sm">
                {isLoading && !hasCached ? (
                    <TableShimmer columns={6} rows={8} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-hover text-left">
                                    <th className="px-4 py-3 border border-border-default font-semibold text-text-primary w-16 text-center">No</th>
                                    <th className="px-4 py-3 border border-border-default font-semibold text-text-primary">Nama Jabatan</th>
                                    <th className="px-4 py-3 border border-border-default font-semibold text-text-primary text-center w-24">
                                        <span className="inline-flex items-center gap-1">
                                            <ArrowUpDown className="h-3 w-3" /> Level
                                        </span>
                                    </th>
                                    <th className="px-4 py-3 border border-border-default font-semibold text-text-primary text-center w-32">Dapat Disposisi</th>
                                    <th className="px-4 py-3 border border-border-default font-semibold text-text-primary text-center w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                                            <Briefcase className="h-10 w-10 mx-auto mb-3 text-text-muted" />
                                            <p>Belum ada data jabatan.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                                            <td className="px-4 py-3 border border-border-default text-center text-text-secondary">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-4 py-3 border border-border-default font-medium text-text-primary">
                                                <span className="inline-flex items-center gap-2">
                                                    {item.nama}
                                                    {item.is_system && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-warning-light text-warning-dark">
                                                            System
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border border-border-default text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
                                                    Level {item.level}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border border-border-default text-center">
                                                {item.can_dispose ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-light text-secondary-dark">
                                                        <ShieldCheck className="h-3 w-3" /> Ya
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-hover text-text-secondary">
                                                        Tidak
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 border border-border-default text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => openEdit(item)} title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {!item.is_system && (
                                                        <Button size="sm" variant="danger" onClick={() => setDeleteItem(item)} title="Hapus">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-border-default">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Jabatan' : 'Tambah Jabatan'}>
                <form onSubmit={handleSubmit} className="p-6">

                    {isSystemEdit && (
                        <div className="mb-4 rounded-lg bg-warning-light border border-warning px-4 py-3 text-sm text-warning-dark">
                            Jabatan sistem tidak dapat diubah.
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Nama */}
                        <div>
                            <InputLabel htmlFor="nama" value="Nama Jabatan" required />
                            <TextInput
                                id="nama"
                                value={form.data.nama}
                                onChange={(e) => form.setData('nama', e.target.value)}
                                className="mt-1 w-full px-2"
                                placeholder="Contoh: Kepala Dinas"
                                required
                                disabled={isSystemEdit}
                            />
                            <InputError message={form.errors.nama} className="mt-1" />
                        </div>

                        {/* Level */}
                        <div>
                            <InputLabel htmlFor="level" value="Level Hierarki" required />
                            <TextInput
                                id="level"
                                type="number"
                                value={String(form.data.level)}
                                onChange={(e) => form.setData('level', e.target.value ? Number(e.target.value) : '')}
                                className="mt-1 w-full px-2"
                                placeholder="1 = Tertinggi"
                                min="1"
                                required
                                disabled={isSystemEdit}
                            />
                            <p className="mt-1 text-xs text-text-muted">Level 1 = jabatan tertinggi, angka lebih besar = level lebih rendah.</p>
                            <InputError message={form.errors.level} className="mt-1" />
                        </div>

                        {/* Can Dispose */}
                        <div className="flex items-center gap-3">
                            <input
                                id="can_dispose"
                                type="checkbox"
                                checked={form.data.can_dispose}
                                onChange={(e) => form.setData('can_dispose', e.target.checked)}
                                className="h-4 w-4 rounded border-border-default text-primary focus:ring-primary"
                                disabled={isSystemEdit}
                            />
                            <InputLabel htmlFor="can_dispose" value="Dapat Melakukan Disposisi" className="!mb-0" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            {isSystemEdit ? 'Tutup' : 'Batal'}
                        </Button>
                        {!isSystemEdit && (
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah'}
                            </Button>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Hapus Jabatan">
                <div className="p-6 text-center">
                    <Trash2 className="h-12 w-12 text-danger mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Hapus Jabatan?</h3>
                    <p className="text-text-secondary text-sm mb-6">
                        Jabatan <strong>"{deleteItem?.nama}"</strong> akan dihapus permanen.
                        {deleteItem?.is_system && (
                            <span className="block mt-1 text-danger text-xs">Jabatan sistem tidak dapat dihapus.</span>
                        )}
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="secondary" onClick={() => setDeleteItem(null)}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={handleDelete} disabled={deleteItem?.is_system}>
                            Hapus
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Index;
