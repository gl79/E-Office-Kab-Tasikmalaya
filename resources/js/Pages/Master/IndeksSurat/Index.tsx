import { useState, useMemo, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, ChevronRight, ChevronDown } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination } from '@/Components/ui';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useToast } from '@/Components/ui/Toast';
import { TextInput, InputLabel } from '@/Components/form';
import { useCRUDModal, useDeferredDataMutable } from '@/hooks';
import type { PageProps } from '@/types';
import axios from 'axios';

interface IndeksSurat {
    id: string;
    kode: string;
    nama: string;
    level: number;
    parent_id: string | null;
    has_children: boolean;
}

interface Props extends PageProps {
    indeksSurat?: IndeksSurat[];
    filters: {
        search?: string;
    };
}

const CACHE_TTL_MS = 60_000;

const Index = ({ auth, indeksSurat: initialIndeksSurat, filters }: Props) => {
    const { showToast } = useToast();
    const { data: indeksSurat, isLoading, hasCached } = useDeferredDataMutable<IndeksSurat[]>(
        `master_indeks_surat_${auth.user.id}`,
        initialIndeksSurat,
        CACHE_TTL_MS
    );

    // Search state
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Tree expand/collapse state
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const expandAll = useCallback(() => {
        if (!indeksSurat) return;
        const allParentIds = indeksSurat.filter(item => item.has_children).map(item => item.id);
        setExpandedIds(new Set(allParentIds));
    }, [indeksSurat]);

    const collapseAll = useCallback(() => {
        setExpandedIds(new Set());
    }, []);

    // Filter data: show matching items + their parents when searching
    const visibleData = useMemo(() => {
        if (!indeksSurat) return [];

        if (search) {
            const lowerSearch = search.toLowerCase();
            // Find matching items
            const matchingIds = new Set<string>();
            indeksSurat.forEach(item => {
                if (item.kode.toLowerCase().includes(lowerSearch) || item.nama.toLowerCase().includes(lowerSearch)) {
                    matchingIds.add(item.id);
                    // Also include all parents up the chain
                    let current = item;
                    while (current.parent_id) {
                        matchingIds.add(current.parent_id);
                        const parent = indeksSurat.find(i => i.id === current.parent_id);
                        if (!parent) break;
                        current = parent;
                    }
                }
            });
            return indeksSurat.filter(item => matchingIds.has(item.id));
        }

        // No search: filter by expanded state
        return indeksSurat.filter(item => {
            if (item.level === 1) return true; // Always show roots
            // Show if parent is expanded
            let current = item;
            while (current.parent_id) {
                if (!expandedIds.has(current.parent_id)) return false;
                const parent = indeksSurat.find(i => i.id === current.parent_id);
                if (!parent) return false;
                current = parent;
            }
            return true;
        });
    }, [indeksSurat, search, expandedIds]);

    // Paginate
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return visibleData.slice(start, start + itemsPerPage);
    }, [visibleData, currentPage]);

    const totalPages = Math.ceil(visibleData.length / itemsPerPage);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Form state for create (sub-kode & primer)
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        parent_id: '',
        kode: '',
        nama: '',
    });

    // Primer modal state
    const [isPrimerModalOpen, setIsPrimerModalOpen] = useState(false);

    // Preview next kode state
    const [nextKodePreview, setNextKodePreview] = useState('');
    const [parentName, setParentName] = useState('');
    const [loadingKode, setLoadingKode] = useState(false);

    // CRUD Modal hook
    const {
        isCreateModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        selectedItem: selectedIndeks,
        openCreateModal: _openCreateModal,
        openEditModal,
        openDeleteModal,
        closeCreateModal,
        closeEditModal,
        closeDeleteModal,
    } = useCRUDModal<IndeksSurat>({
        onOpenCreate: () => {
            reset();
            clearErrors();
            setNextKodePreview('');
            setParentName('');
        },
        onOpenEdit: (indeks) => {
            setData({
                parent_id: '',
                kode: indeks.kode,
                nama: indeks.nama,
            });
            clearErrors();
        },
    });

    // Custom open create that fetches next kode
    const openAddSubModal = useCallback(async (parent: IndeksSurat) => {
        _openCreateModal(); // Trigger onOpenCreate (reset) first
        // Override with correct values after reset
        setData({ parent_id: parent.id, kode: '', nama: '' });
        setParentName(`${parent.kode} - ${parent.nama}`);
        setLoadingKode(true);
        setNextKodePreview('...');

        try {
            const response = await axios.get(route('master.indeks-surat.next-kode', parent.id));
            setNextKodePreview(response.data.kode);
        } catch {
            setNextKodePreview('Gagal memuat kode');
        } finally {
            setLoadingKode(false);
        }
    }, [setData, _openCreateModal]);

    const openPrimerModal = useCallback(() => {
        reset();
        clearErrors();
        setIsPrimerModalOpen(true);
    }, [reset, clearErrors]);

    const closePrimerModal = useCallback(() => {
        setIsPrimerModalOpen(false);
    }, []);

    const handleCreate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.indeks-surat.store'), {
            onSuccess: () => {
                closeCreateModal();
                reset();
            },
        });
    }, [post, closeCreateModal, reset]);

    const handleCreatePrimer = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        post(route('master.indeks-surat.store'), {
            onSuccess: () => {
                closePrimerModal();
                reset();
            },
        });
    }, [post, closePrimerModal, reset]);

    const handleUpdate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIndeks) return;
        put(route('master.indeks-surat.update', selectedIndeks.id), {
            onSuccess: () => {
                closeEditModal();
                reset();
            },
        });
    }, [selectedIndeks, put, closeEditModal, reset]);

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = useCallback(() => {
        if (!selectedIndeks) return;
        setIsDeleting(true);
        router.delete(route('master.indeks-surat.destroy', selectedIndeks.id), {
            onSuccess: () => {
                closeDeleteModal();
            },
            onError: (errs) => {
                const msg = typeof errs === 'object' && errs !== null
                    ? Object.values(errs).flat().join(', ')
                    : 'Gagal menghapus Indeks Surat.';
                showToast('error', msg);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, [selectedIndeks, closeDeleteModal, showToast]);

    const getLevelLabel = (level: number) => {
        switch (level) {
            case 1: return 'Primer';
            case 2: return 'Sub Primer';
            case 3: return 'Sub-Sub Primer';
            default: return `Level ${level}`;
        }
    };

    return (
        <>
            <Head title="Kode Klasifikasi" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Kode Klasifikasi Surat</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data kode klasifikasi surat berdasarkan Peraturan Bupati</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-2 items-center">
                            <div className="flex gap-2 flex-1 max-w-md">
                                <TextInput
                                    type="text"
                                    placeholder="Cari Kode atau Nama..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full px-3"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                            {!search && (
                                <div className="flex gap-1 ml-2">
                                    <Button variant="secondary" size="sm" onClick={expandAll}>
                                        Buka Semua
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={collapseAll}>
                                        Tutup Semua
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Button onClick={openPrimerModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Kode Primer
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={5} />
                    </div>
                ) : (
                    <table className="min-w-full border-collapse border border-border-default">
                        <thead className="bg-surface-hover">
                            <tr>
                                <th className="px-4 py-3 border border-border-default text-center text-xs font-bold text-text-secondary uppercase w-12">No</th>
                                <th className="px-4 py-3 border border-border-default text-left text-xs font-bold text-text-secondary uppercase w-48">Kode</th>
                                <th className="px-4 py-3 border border-border-default text-left text-xs font-bold text-text-secondary uppercase">Nama</th>
                                <th className="px-4 py-3 border border-border-default text-center text-xs font-bold text-text-secondary uppercase w-32">Level</th>
                                <th className="px-4 py-3 border border-border-default text-center text-xs font-bold text-text-secondary uppercase w-44">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface">
                            {paginatedData.map((indeks, index) => {
                                const isExpanded = expandedIds.has(indeks.id) || !!search;
                                const indent = (indeks.level - 1) * 24;

                                return (
                                    <tr
                                        key={indeks.id}
                                        className={`hover:bg-surface-hover ${indeks.level === 1 ? 'bg-primary-light/5 font-semibold' : ''}`}
                                    >
                                        <td className="px-4 py-3 border border-border-default text-center text-text-secondary text-sm">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-4 py-3 border border-border-default">
                                            <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
                                                {indeks.has_children && !search ? (
                                                    <button
                                                        onClick={() => toggleExpand(indeks.id)}
                                                        className="mr-1.5 p-0.5 hover:bg-surface-hover rounded transition-colors text-text-secondary"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="inline-block w-[26px]" />
                                                )}
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-light text-primary-dark">
                                                    {indeks.kode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={`px-4 py-3 border border-border-default text-text-primary ${indeks.level === 1 ? 'font-semibold' : ''}`}>
                                            {indeks.nama}
                                        </td>
                                        <td className="px-4 py-3 border border-border-default text-center text-text-secondary text-xs">
                                            {getLevelLabel(indeks.level)}
                                        </td>
                                        <td className="px-4 py-3 border border-border-default text-center">
                                            <div className="flex justify-center gap-1.5">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openAddSubModal(indeks)}
                                                    title="Tambah Sub Kode"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openEditModal(indeks)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                {indeks.level > 1 && !indeks.has_children && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(indeks)}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 border border-border-default text-center text-text-secondary">
                                        {search ? 'Tidak ada kode klasifikasi yang cocok dengan pencarian' : 'Tidak ada data kode klasifikasi'}
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
                            Menampilkan {paginatedData.length} dari {visibleData.length} data
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>

            {/* Create Sub-Kode Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Tambah Sub Kode">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="p-3 bg-surface-hover rounded-lg border border-border-default">
                        <p className="text-sm text-text-secondary">Parent:</p>
                        <p className="font-medium text-text-primary">{parentName}</p>
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="kode_preview" value="Kode (otomatis)" />
                        <TextInput
                            id="kode_preview"
                            value={nextKodePreview}
                            readOnly
                            className="w-full bg-gray-100 cursor-not-allowed"
                            disabled={loadingKode}
                        />
                        <p className="text-xs text-text-secondary">Kode di-generate otomatis oleh sistem</p>
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="nama" value="Nama" />
                        <TextInput
                            id="nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: Ketatausahaan dan Kerumahtanggaan"
                            className="w-full"
                            required
                            autoFocus
                        />
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={closeCreateModal} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing || loadingKode}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
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
                            placeholder="Contoh: 000.1.1"
                            className="w-full"
                        />
                        {errors.kode && <p className="text-sm text-danger">{errors.kode}</p>}
                        <p className="text-xs text-text-secondary">
                            Format: angka dipisahkan titik (contoh: 000, 000.1, 000.1.1). Parent kode harus sudah ada.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="edit-nama" value="Nama" />
                        <TextInput
                            id="edit-nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            className="w-full"
                            required
                            autoFocus
                        />
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={closeEditModal} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Konfirmasi Hapus">
                <div className="space-y-4">
                    <p>
                        Apakah Anda yakin ingin menghapus kode{' '}
                        <strong>{selectedIndeks?.kode} - {selectedIndeks?.nama}</strong>?
                        Data akan dipindahkan ke arsip.
                    </p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={closeDeleteModal} disabled={isDeleting}>Batal</Button>
                        <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Tambah Kode Primer Modal */}
            <Modal isOpen={isPrimerModalOpen} onClose={closePrimerModal} title="Tambah Kode Klasifikasi Primer">
                <form onSubmit={handleCreatePrimer} className="space-y-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="primer-kode" value="Kode" />
                        <TextInput
                            id="primer-kode"
                            value={data.kode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('kode', e.target.value)}
                            placeholder="Contoh: 1000"
                            className="w-full"
                            required
                            autoFocus
                        />
                        {errors.kode && <p className="text-sm text-danger">{errors.kode}</p>}
                        <p className="text-xs text-text-secondary">Masukkan kode primer baru (contoh: 1000, 1100, dst)</p>
                    </div>
                    <div className="space-y-2">
                        <InputLabel htmlFor="primer-nama" value="Nama" />
                        <TextInput
                            id="primer-nama"
                            value={data.nama}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                            placeholder="Contoh: Nama Klasifikasi Baru"
                            className="w-full"
                            required
                        />
                        {errors.nama && <p className="text-sm text-danger">{errors.nama}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={closePrimerModal} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Index;
