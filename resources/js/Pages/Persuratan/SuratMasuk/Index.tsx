import { useState, useMemo } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Eye, Printer, FileText, Filter, MoreVertical } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination, Dropdown } from '@/Components/ui';
import Badge from '@/Components/ui/Badge';
import { TextInput } from '@/Components/form';
import FormSelect from '@/Components/form/FormSelect';
import FormDatePicker from '@/Components/form/FormDatePicker';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { PageProps } from '@/types';
import { useDeferredDataMutable } from '@/hooks';
import { formatDateShort } from '@/utils';

interface SuratMasukTujuan {
    id: string;
    tujuan: string;
}

interface SuratMasuk {
    id: string;
    nomor_agenda: string;
    tanggal_diterima: string;
    tanggal_surat: string;
    asal_surat: string;
    nomor_surat: string;
    sifat: string;
    perihal: string;
    isi_ringkas: string | null;
    lampiran: number | null;
    file_path: string | null;
    tujuans: SuratMasukTujuan[];
    indeks_berkas?: { kode: string; nama: string } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    staff_pengolah?: { name: string; nip: string } | null;
}

interface Props extends PageProps {
    suratMasuk?: SuratMasuk[];
    sifatOptions: Record<string, string>;
}

const CACHE_TTL_MS = 60_000;
const Index = ({ suratMasuk: initialSuratMasuk, sifatOptions }: Props) => {
    const { auth } = usePage<PageProps>().props;

    // Use custom hook for deferred data with mutable state
    const { data: suratMasuk, updateAndCache, isLoading, hasCached } = useDeferredDataMutable<SuratMasuk[]>(
        `surat_masuk_${auth.user.id}`,
        initialSuratMasuk,
        CACHE_TTL_MS
    );

    // Client-side Search & Pagination
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sifat, setSifat] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 10;

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<SuratMasuk | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Detail Modal State
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailSurat, setDetailSurat] = useState<SuratMasuk | null>(null);

    // Cetak Disposisi Modal State
    const [disposisiModalOpen, setDisposisiModalOpen] = useState(false);
    const [disposisiSurat, setDisposisiSurat] = useState<SuratMasuk | null>(null);
    const [selectedPenandaTangan, setSelectedPenandaTangan] = useState(0);

    const penandaTanganOptions = [
        { nama: 'H. Cecep Nurul Yakin, S.PD., M.AP', jabatan: 'Bupati' },
        { nama: 'H. Asep Sopari Al Ayubi, S.P., M.I.P.', jabatan: 'Wakil Bupati' },
        { nama: 'Drs. H. Roni Ahmad Sahroni, MM', jabatan: 'Sekretaris Daerah' },
    ];

    // Filter data client-side
    const filteredData = useMemo(() => {
        if (!suratMasuk) return [];
        let data = suratMasuk;

        // Search filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nomor_agenda?.toLowerCase().includes(lowerSearch) ||
                item.nomor_surat?.toLowerCase().includes(lowerSearch) ||
                item.asal_surat?.toLowerCase().includes(lowerSearch) ||
                item.perihal?.toLowerCase().includes(lowerSearch)
            );
        }

        // Date range filter
        if (startDate) {
            data = data.filter(item => item.tanggal_diterima >= startDate);
        }
        if (endDate) {
            data = data.filter(item => item.tanggal_diterima <= endDate);
        }

        // Sifat filter
        if (sifat) {
            data = data.filter(item => item.sifat === sifat);
        }

        return data;
    }, [suratMasuk, search, startDate, endDate, sifat]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset page on filter change
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
        router.delete(route('persuratan.surat-masuk.destroy', itemToDelete.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Remove item from local state and cache for real-time update
                updateAndCache(prev => prev.filter(item => item.id !== itemToDelete.id));
            },
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                setSelectedSurat(null);
            },
        });
    };

    const handleCetakDisposisi = () => {
        if (!disposisiSurat) return;
        router.post(route('persuratan.surat-masuk.cetak-disposisi', disposisiSurat.id), {
            penanda_tangan_index: selectedPenandaTangan,
        }, {
            onSuccess: () => {
                setDisposisiModalOpen(false);
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
                {sifatOptions[sifatValue] || sifatValue}
            </Badge>
        );
    };

    const sifatSelectOptions = Object.entries(sifatOptions || {}).map(([value, label]) => ({
        value,
        label,
    }));

    return (
        <>
            <Head title="Surat Masuk" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Surat Masuk</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data surat masuk dan disposisi</p>
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
                                    placeholder="Cari nomor agenda, nomor surat, asal surat..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full px-2"
                                />
                                <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} title="Filter Lanjutan" className="gap-2">
                                    <Filter className={`h-4 w-4 ${showFilters ? 'text-primary' : ''}`} />
                                    <span>Filter</span>
                                </Button>
                            </div>
                            <Link href={route('persuratan.surat-masuk.create')}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Surat
                                </Button>
                            </Link>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <div className="p-4 bg-surface-hover rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4 border border-border-default animate-in fade-in slide-in-from-top-2">
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
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">
                                        Sifat Surat
                                    </label>
                                    <FormSelect
                                        options={sifatSelectOptions}
                                        value={sifat}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            setSifat(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Semua Sifat"
                                        className="w-full px-2"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={7} />
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-default">
                        <thead className="bg-surface-hover">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-12">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">No. Agenda</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Tgl Diterima</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nomor / Tgl Surat</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Asal Surat</th>
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
                                        {item.nomor_agenda}
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {formatDateShort(item.tanggal_diterima)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="font-medium text-text-primary">{item.nomor_surat}</div>
                                        <div className="text-text-secondary text-xs">{formatDateShort(item.tanggal_surat)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-text-primary text-sm">
                                        {item.asal_surat}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getSifatBadge(item.sifat)}
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
                                                    href={route('persuratan.surat-masuk.edit', item.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span>Edit</span>
                                                </Dropdown.Link>
                                                
                                                <Dropdown.Link
                                                    as="button"
                                                    onClick={() => window.open(route('persuratan.surat-masuk.cetak-kartu', item.id), '_blank')}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                    <span>Cetak Kartu</span>
                                                </Dropdown.Link>
                                                
                                                <Dropdown.Link
                                                    as="button"
                                                    onClick={() => {
                                                        setDisposisiSurat(item);
                                                        setDisposisiModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    <span>Cetak Disposisi</span>
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
                                        {search || startDate || endDate || sifat ? 'Tidak ada surat masuk yang cocok dengan filter.' : 'Tidak ada data surat masuk.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}

                {/* Pagination */}
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
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                type="delete"
                title="Hapus Surat Masuk"
                message={
                    <p>
                        Apakah Anda yakin ingin menghapus surat dengan nomor agenda{' '}
                        <strong>{selectedSurat?.nomor_agenda}</strong>?
                        Data akan dipindahkan ke arsip.
                    </p>
                }
                isLoading={isDeleting}
            />

            {/* Detail Modal */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Detail Surat Masuk"
                size="lg"
            >
                {detailSurat && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-secondary">Nomor Agenda</p>
                                <p className="font-medium text-text-primary">{detailSurat.nomor_agenda}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Tanggal Diterima</p>
                                <p className="font-medium text-text-primary">{formatDateShort(detailSurat.tanggal_diterima)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Nomor Surat</p>
                                <p className="font-medium text-text-primary">{detailSurat.nomor_surat}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Tanggal Surat</p>
                                <p className="font-medium text-text-primary">{formatDateShort(detailSurat.tanggal_surat)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Asal Surat</p>
                                <p className="font-medium text-text-primary">{detailSurat.asal_surat}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Sifat</p>
                                {getSifatBadge(detailSurat.sifat)}
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-text-secondary">Tujuan</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {detailSurat.tujuans?.map((t) => (
                                        <Badge key={t.id} variant="primary" size="sm">
                                            {t.tujuan}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-text-secondary">Perihal</p>
                                <p className="font-medium text-text-primary">{detailSurat.perihal}</p>
                            </div>
                            {detailSurat.isi_ringkas && (
                                <div className="sm:col-span-2">
                                    <p className="text-sm text-text-secondary">Isi Ringkas</p>
                                    <p className="font-medium text-text-primary">{detailSurat.isi_ringkas}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-text-secondary">Lampiran</p>
                                <p className="font-medium text-text-primary">{detailSurat.lampiran || 0} berkas</p>
                            </div>
                        </div>
                        {detailSurat.file_path && (
                            <div className="pt-4 border-t border-border-default">
                                <a
                                    href={route('persuratan.surat-masuk.cetak-isi', detailSurat.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary-hover font-medium"
                                >
                                    Lihat File Surat
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Cetak Disposisi Modal */}
            <Modal
                isOpen={disposisiModalOpen}
                onClose={() => setDisposisiModalOpen(false)}
                title="Cetak Lembar Disposisi"
            >
                {disposisiSurat && (
                    <div className="space-y-4">
                        <div className="bg-surface-hover p-4 rounded-lg border border-border-default">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-text-secondary">Nomor Agenda:</span>
                                    <span className="ml-2 font-medium text-text-primary">{disposisiSurat.nomor_agenda}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary">Nomor Surat:</span>
                                    <span className="ml-2 font-medium text-text-primary">{disposisiSurat.nomor_surat}</span>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-text-secondary">Perihal:</span>
                                    <span className="ml-2 font-medium text-text-primary">{disposisiSurat.perihal}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-text-secondary mb-3">
                                Pilih Penanda Tangan:
                            </p>
                            <div className="space-y-2">
                                {penandaTanganOptions.map((option, index) => (
                                    <label
                                        key={index}
                                        className={`
                                            flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                                            ${selectedPenandaTangan === index
                                                ? 'border-primary bg-primary-light/10 ring-1 ring-primary'
                                                : 'border-border-default hover:bg-surface-hover'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="penanda_tangan"
                                            value={index}
                                            checked={selectedPenandaTangan === index}
                                            onChange={() => setSelectedPenandaTangan(index)}
                                            className="mr-3 text-primary focus:ring-primary"
                                        />
                                        <div>
                                            <p className="font-medium text-text-primary">{option.nama}</p>
                                            <p className="text-sm text-text-secondary">{option.jabatan}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setDisposisiModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button onClick={handleCetakDisposisi}>
                                <Printer className="h-4 w-4 mr-2" />
                                Cetak
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Index;
