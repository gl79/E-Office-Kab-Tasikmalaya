import { useState, useMemo, useEffect } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, Eye, Printer, Filter, MoreVertical } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination, Dropdown } from '@/Components/ui';
import Badge from '@/Components/ui/Badge';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { TextInput } from '@/Components/form';
import FormDatePicker from '@/Components/form/FormDatePicker';
import { PageProps } from '@/types';
import { useMemoryCache } from '@/hooks/useMemoryCache';
import { formatDateShort } from '@/utils';

interface SuratKeluar {
    id: string;
    tanggal_surat: string;
    no_urut: string;
    nomor_surat: string;
    kepada: string;
    perihal: string;
    isi_ringkas: string;
    sifat_1: string;
    lampiran: number | null;
    catatan: string | null;
    file_path: string | null;
    indeks?: { kode: string; nama: string } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    unit_kerja?: { nama: string; singkatan: string } | null;
}

interface Props extends PageProps {
    suratKeluar?: SuratKeluar[];
    sifat1Options: Record<string, string>;
}

const CACHE_TTL_MS = 60_000;

const Index = ({ suratKeluar: initialSuratKeluar, sifat1Options }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const cacheKey = `persuratan_surat_keluar_${auth.user.id}`;
    const { read, write } = useMemoryCache<SuratKeluar[]>(cacheKey, CACHE_TTL_MS);
    const cachedSuratKeluar = read();
    const hasCached = cachedSuratKeluar !== null;

    // Local state for real-time updates
    const [suratKeluar, setSuratKeluar] = useState<SuratKeluar[]>(() => initialSuratKeluar ?? cachedSuratKeluar ?? []);

    // Sync state when prop updates (deferred loading)
    useEffect(() => {
        if (initialSuratKeluar !== undefined) {
            setSuratKeluar(initialSuratKeluar);
            write(initialSuratKeluar);
        }
    }, [initialSuratKeluar, write]);

    // Client-side Search & Pagination
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 10;

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<SuratKeluar | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailSurat, setDetailSurat] = useState<SuratKeluar | null>(null);

    // Filter data client-side
    const filteredData = useMemo(() => {
        if (!suratKeluar) return [];
        let data = suratKeluar;

        // Search filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nomor_surat?.toLowerCase().includes(lowerSearch) ||
                item.kepada?.toLowerCase().includes(lowerSearch) ||
                item.perihal?.toLowerCase().includes(lowerSearch) ||
                item.no_urut?.toLowerCase().includes(lowerSearch)
            );
        }

        // Date range filter
        if (startDate) {
            data = data.filter(item => item.tanggal_surat >= startDate);
        }
        if (endDate) {
            data = data.filter(item => item.tanggal_surat <= endDate);
        }

        return data;
    }, [suratKeluar, search, startDate, endDate]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset page on search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDelete = () => {
        if (!selectedSurat) return;
        const itemToDelete = selectedSurat;
        setIsDeleting(true);
        router.delete(route('persuratan.surat-keluar.destroy', itemToDelete.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Remove item from local state for real-time update
                setSuratKeluar(prev => {
                    const next = prev.filter(item => item.id !== itemToDelete.id);
                    write(next);
                    return next;
                });
            },
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                setSelectedSurat(null);
            },
        });
    };

    const getSifatBadge = (sifatValue: string) => {
        const variants: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
            biasa: 'default',
            terbatas: 'info',
            rahasia: 'warning',
            sangat_rahasia: 'danger',
        };

        return (
            <Badge variant={variants[sifatValue] || 'default'} className="justify-center min-w-[80px] whitespace-nowrap">
                {sifat1Options[sifatValue] || sifatValue}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Surat Keluar" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Surat Keluar</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data surat keluar</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-2 flex-1 max-w-2xl">
                                <TextInput
                                    type="text"
                                    placeholder="Cari nomor surat, kepada, perihal..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full px-2"
                                />
                                <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} title="Filter Lanjutan" className="gap-2">
                                    <Filter className={`h-4 w-4 ${showFilters ? 'text-primary' : ''}`} />
                                    <span>Filter</span>
                                </Button>
                            </div>
                            <Link href={route('persuratan.surat-keluar.create')}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Surat
                                </Button>
                            </Link>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <div className="p-4 bg-surface-hover rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4 border border-border-default animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <FormDatePicker
                                        value={startDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setStartDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">
                                        Tanggal Akhir
                                    </label>
                                    <FormDatePicker
                                        value={endDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setEndDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                {!initialSuratKeluar && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={7} />
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-default">
                        <thead className="bg-surface-hover">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-12">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Agenda</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Tgl Surat</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nomor Surat</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Kepada</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Sifat</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase w-20">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border-default">
                            {paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-surface-hover">
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-text-primary text-sm font-medium">
                                        {item.no_urut}
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {formatDateShort(item.tanggal_surat)}
                                    </td>
                                    <td className="px-4 py-3 text-text-primary text-sm">
                                        {item.nomor_surat}
                                    </td>
                                    <td className="px-4 py-3 text-text-primary text-sm">
                                        {item.kepada}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getSifatBadge(item.sifat_1)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Dropdown
                                            align="right"
                                            width="48"
                                            trigger={
                                                <button className="p-1 hover:bg-surface-hover rounded-full transition-colors text-text-secondary">
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>
                                            }
                                        >
                                            <div className="py-1">
                                                <Dropdown.Link
                                                    as="button"
                                                    onClick={() => {
                                                        setDetailSurat(item);
                                                        setDetailModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>Lihat Detail</span>
                                                </Dropdown.Link>
                                                
                                                <Dropdown.Link
                                                    href={route('persuratan.surat-keluar.edit', item.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span>Edit</span>
                                                </Dropdown.Link>
                                                
                                                <Dropdown.Link
                                                    as="button"
                                                    onClick={() => window.open(route('persuratan.surat-keluar.cetak-kartu', item.id), '_blank')}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                    <span>Cetak Kartu</span>
                                                </Dropdown.Link>
                                                
                                                <div className="border-t border-border-default my-1"></div>
                                                
                                                <Dropdown.Link
                                                    as="button"
                                                    onClick={() => {
                                                        setSelectedSurat(item);
                                                        setDeleteModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-2 text-danger hover:bg-danger-light focus:bg-danger-light"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Hapus</span>
                                                </Dropdown.Link>
                                            </div>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                                        {search || startDate || endDate ? 'Tidak ada surat keluar yang cocok dengan filter.' : 'Tidak ada data surat keluar.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}

                {/* Pagination */}
                {(initialSuratKeluar || hasCached) && (
                <div className="p-4 border-t border-border-default">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                type="delete"
                title="Hapus Surat Keluar"
                message={
                    <p>
                        Apakah Anda yakin ingin menghapus surat dengan nomor{' '}
                        <strong>{selectedSurat?.nomor_surat}</strong>?
                    </p>
                }
                isLoading={isDeleting}
            />

            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Detail Surat Keluar"
                size="lg"
            >
                {detailSurat && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-secondary">Nomor Surat</p>
                                <p className="font-medium text-text-primary">{detailSurat.nomor_surat}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Tanggal Surat</p>
                                <p className="font-medium text-text-primary">{formatDateShort(detailSurat.tanggal_surat)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">No Urut/Agenda</p>
                                <p className="font-medium text-text-primary">{detailSurat.no_urut}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Kepada</p>
                                <p className="font-medium text-text-primary">{detailSurat.kepada}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-text-secondary">Perihal</p>
                                <p className="font-medium text-text-primary">{detailSurat.perihal}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-text-secondary">Isi Ringkas</p>
                                <p className="font-medium text-text-primary">{detailSurat.isi_ringkas || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Sifat</p>
                                {getSifatBadge(detailSurat.sifat_1)}
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Lampiran</p>
                                <p className="font-medium text-text-primary">{detailSurat.lampiran || 0} berkas</p>
                            </div>
                            {detailSurat.indeks && (
                                <div>
                                    <p className="text-sm text-text-secondary">Indeks</p>
                                    <p className="font-medium text-text-primary">{detailSurat.indeks.kode} - {detailSurat.indeks.nama}</p>
                                </div>
                            )}
                            {detailSurat.unit_kerja && (
                                <div>
                                    <p className="text-sm text-text-secondary">Unit Kerja</p>
                                    <p className="font-medium text-text-primary">{detailSurat.unit_kerja.nama}</p>
                                </div>
                            )}
                            {detailSurat.catatan && (
                                <div className="sm:col-span-2">
                                    <p className="text-sm text-text-secondary">Catatan</p>
                                    <p className="font-medium text-text-primary">{detailSurat.catatan}</p>
                                </div>
                            )}
                        </div>
                        {detailSurat.file_path && (
                            <div className="pt-4 border-t border-border-default">
                                <a
                                    href={route('persuratan.surat-keluar.download', detailSurat.id)}
                                    className="text-primary hover:text-primary-hover font-medium"
                                >
                                    Download File Surat
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Index;
