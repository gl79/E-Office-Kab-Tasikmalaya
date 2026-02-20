import { useState, useMemo } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Eye, Printer, FileText, Filter, MoreVertical, Download, RotateCcw, CalendarPlus, Check } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination, Dropdown } from '@/Components/ui';
import Badge from '@/Components/ui/Badge';
import { TextInput } from '@/Components/form';
import FormSelect from '@/Components/form/FormSelect';
import FormDatePicker from '@/Components/form/FormDatePicker';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { PageProps } from '@/types';
import type { SuratMasuk } from '@/types/persuratan';
import { useDeferredDataMutable } from '@/hooks';
import { formatDateShort, getSifatBadge, exportToPrintWindow, escapeHtml, getDateRangeForPeriod } from '@/utils';


interface Props extends PageProps {
    suratMasuk?: SuratMasuk[];
    sifatOptions: Record<string, string>;
}

const CACHE_TTL_MS = 60_000;
const Index = ({ suratMasuk: initialSuratMasuk, sifatOptions }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const normalizedName = (auth.user?.name || '').trim().toLowerCase();
    const normalizedJabatan = (auth.user?.jabatan || '').trim().toLowerCase();
    const isBupatiUser = auth.user?.role === 'pimpinan'
        && (normalizedJabatan === 'bupati' || normalizedName === 'bupati');

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
    const [periodeFilter, setPeriodeFilter] = useState('');
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

    const hasActiveFilters = !!(search || startDate || endDate || sifat);

    const handleResetFilters = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        setSifat('');
        setPeriodeFilter('');
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

    const handleTerima = (surat: SuratMasuk) => {
        router.post(route('persuratan.surat-masuk.terima', surat.id), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                updateAndCache(prev => prev.map((item) => {
                    if (item.id !== surat.id) {
                        return item;
                    }

                    const hasSchedule = !!item.penjadwalan;

                    return {
                        ...item,
                        penerimaan_status: 'Diterima',
                        penerimaan_diterima_at: new Date().toISOString(),
                        can_accept: false,
                        can_disposisi: isBupatiUser,
                        can_disposisi_disabled: false,
                        can_schedule: isBupatiUser && !hasSchedule,
                        can_view_schedule: isBupatiUser && hasSchedule,
                    };
                }));
            },
        });
    };

    const handleCetakDisposisi = () => {
        if (!disposisiSurat) return;

        // Use hidden form with target="_blank" to open in new tab
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('persuratan.surat-masuk.cetak-disposisi', disposisiSurat.id);
        form.target = '_blank';

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        const ptInput = document.createElement('input');
        ptInput.type = 'hidden';
        ptInput.name = 'penanda_tangan_index';
        ptInput.value = selectedPenandaTangan.toString();
        form.appendChild(ptInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        setDisposisiModalOpen(false);
    };

    const sifatSelectOptions = Object.entries(sifatOptions || {}).map(([value, label]) => ({
        value,
        label,
    }));

    const handleExportPDF = () => {
        const filterInfo: string[] = [];
        if (search) filterInfo.push(`Pencarian: "${escapeHtml(search)}"`);
        if (startDate || endDate) filterInfo.push(`Periode: ${startDate || '...'} s/d ${endDate || '...'}`);
        if (sifat) filterInfo.push(`Sifat: ${sifatOptions[sifat] || sifat}`);
        exportToPrintWindow({
            title: 'Laporan Data Surat Masuk',
            columns: [
                { header: 'No', render: (_, i) => String(i + 1) },
                { header: 'No Agenda', render: (item) => item.nomor_agenda.split('/')[1] || escapeHtml(item.nomor_agenda) },
                { header: 'Tanggal Diterima', render: (item) => formatDateShort(item.tanggal_diterima) },
                { header: 'Tgl Surat / No Surat', render: (item) => `${formatDateShort(item.tanggal_surat)}<br><small>${escapeHtml(item.nomor_surat)}</small>` },
                { header: 'Asal Surat', render: (item) => escapeHtml(item.asal_surat) },
                { header: 'Perihal', render: (item) => escapeHtml(item.perihal) },
                { header: 'Sifat', render: (item) => escapeHtml(sifatOptions[item.sifat] || item.sifat) },
                { header: 'Status Penerimaan', render: (item) => escapeHtml(item.penerimaan_status || '-') },
                { header: 'Status Penjadwalan', render: (item) => escapeHtml(item.penjadwalan_status_label || '-') },
            ],
            data: filteredData,
            filterInfo,
            userName: auth.user.name,
        });
    };

    const formatTimeWithColon = (dateTime: string) => {
        const date = new Date(dateTime);
        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(date);
    };

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
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={handleExportPDF} disabled={filteredData.length === 0} title="Export PDF">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                                {!['user', 'pimpinan'].includes(auth.user.role) && (
                                    <Link href={route('persuratan.surat-masuk.create')}>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tambah Surat
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <div className="p-4 bg-surface-hover rounded-lg border border-border-default animate-in fade-in slide-in-from-top-2 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">
                                            Periode
                                        </label>
                                        <select
                                            className="w-full rounded-md border-border-default bg-surface focus:border-primary focus:ring-primary sm:text-sm"
                                            value={periodeFilter}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPeriodeFilter(val);
                                                const { start, end } = getDateRangeForPeriod(val);
                                                setStartDate(start);
                                                setEndDate(end);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Semua Waktu</option>
                                            <option value="hari_ini">Hari Ini</option>
                                            <option value="minggu_ini">Minggu Ini</option>
                                            <option value="bulan_ini">Bulan Ini</option>
                                            <option value="tahun_ini">Tahun Ini</option>
                                        </select>
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
                                            className="w-full px-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">
                                            Dari Tanggal
                                        </label>
                                        <FormDatePicker
                                            value={startDate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setStartDate(e.target.value);
                                                setPeriodeFilter('');
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">
                                            Sampai Tanggal
                                        </label>
                                        <FormDatePicker
                                            value={endDate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setEndDate(e.target.value);
                                                setPeriodeFilter('');
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-2 text-sm"
                                        />
                                    </div>
                                </div>
                                {hasActiveFilters && (
                                    <div className="flex justify-end">
                                        <Button variant="secondary" size="sm" onClick={handleResetFilters} className="gap-2">
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            Reset Filter
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={10} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-border-default">
                            <thead className="bg-surface-hover">
                                <tr>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase w-12">No</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">No Agenda</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase"><div>Tanggal</div><div>Diterima</div></th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase"><div>Tgl Surat</div><div>No Surat</div></th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Asal Surat</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Perihal</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">Sifat</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">Status Penerimaan</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">Status Penjadwalan</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase w-20">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface">
                                {paginatedData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-surface-hover">
                                        <td className="border border-border-default px-4 py-3 text-center text-text-secondary text-sm">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center text-text-primary text-sm font-medium">
                                            {item.nomor_agenda.split('/')[1] || item.nomor_agenda}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-text-secondary text-sm">
                                            {formatDateShort(item.tanggal_diterima)}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="font-medium text-text-primary">{formatDateShort(item.tanggal_surat)}</div>
                                            <div className="text-text-secondary text-xs">{item.nomor_surat}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-text-primary text-sm">
                                            {item.asal_surat}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-text-primary text-sm">
                                            <span className="line-clamp-2">{item.perihal}</span>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
                                            {getSifatBadge(item.sifat, sifatOptions)}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
                                            <Badge variant={item.penerimaan_status === 'Diterima' ? 'success' : 'warning'}>
                                                {item.penerimaan_status ?? '-'}
                                            </Badge>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
                                            <Badge variant={item.penjadwalan_status_variant ?? 'default'}>
                                                {item.penjadwalan_status_label ?? '-'}
                                            </Badge>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {item.can_accept && (
                                                    <button
                                                        onClick={() => handleTerima(item)}
                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors"
                                                        title="Terima Surat"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span>Terima</span>
                                                    </button>
                                                )}
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


                                                    {!['user', 'pimpinan'].includes(auth.user.role) && (
                                                        <Dropdown.Link
                                                            href={route('persuratan.surat-masuk.edit', item.id)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            <span>Edit</span>
                                                        </Dropdown.Link>
                                                    )}

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

                                                    {item.file_path && (
                                                        <Dropdown.Link
                                                            as="button"
                                                            onClick={() => window.open(route('persuratan.surat-masuk.preview', item.id), '_blank')}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span>Lihat File</span>
                                                        </Dropdown.Link>
                                                    )}

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
                                                        onClick={() => window.open(route('persuratan.surat-masuk.cetak-isi', item.id), '_blank')}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span>Cetak Kartu Hanya Isi</span>
                                                    </Dropdown.Link>

                                                    {(item.can_disposisi || item.can_disposisi_disabled) && (
                                                        item.can_disposisi ? (
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
                                                        ) : (
                                                            <div className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted bg-surface-hover/60 cursor-not-allowed">
                                                                <FileText className="h-4 w-4" />
                                                                <span>Cetak Disposisi (Terima surat dulu)</span>
                                                            </div>
                                                        )
                                                    )}

                                                    {(item.can_schedule || item.can_view_schedule || item.can_disposisi_disabled) && (
                                                        (item.can_schedule || item.can_view_schedule) ? (
                                                            <Dropdown.Link
                                                                href={route('bupati.jadwal.form', item.id)}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <CalendarPlus className="h-4 w-4" />
                                                                <span>{item.can_schedule ? 'Jadwalkan' : 'Lihat Jadwal'}</span>
                                                            </Dropdown.Link>
                                                        ) : (
                                                            <div className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted bg-surface-hover/60 cursor-not-allowed">
                                                                <CalendarPlus className="h-4 w-4" />
                                                                <span>Penjadwalan (Terima surat dulu)</span>
                                                            </div>
                                                        )
                                                    )}



                                                    {!['user', 'pimpinan'].includes(auth.user.role) && (
                                                        <>
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
                                                        </>
                                                    )}
                                                </div>
                                            </Dropdown>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="border border-border-default px-4 py-8 text-center text-text-secondary">
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
                size="xl"
            >
                {detailSurat && (
                    <div className="space-y-6">
                        {/* Identitas Surat */}
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Identitas Surat</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-text-secondary">Tanggal Surat</p>
                                    <p className="font-medium text-text-primary">{formatDateShort(detailSurat.tanggal_surat)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Asal Surat</p>
                                    <Badge variant="primary" className="mt-1">{detailSurat.asal_surat}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Nomor Surat</p>
                                    <p className="font-medium text-text-primary">{detailSurat.nomor_surat}</p>
                                </div>
                                {detailSurat.jenis_surat && (
                                    <div>
                                        <p className="text-sm text-text-secondary">Jenis Surat</p>
                                        <p className="font-medium text-text-primary">{detailSurat.jenis_surat.nama}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-text-secondary">Sifat Surat</p>
                                    {getSifatBadge(detailSurat.sifat, sifatOptions)}
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Lampiran</p>
                                    <p className="font-medium text-text-primary">{detailSurat.lampiran || 0} berkas</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-sm text-text-secondary">Perihal</p>
                                    <p className="font-medium text-text-primary">{detailSurat.perihal}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-sm text-text-secondary">Kepada (Tujuan Surat)</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {detailSurat.tujuans?.length ? (
                                            detailSurat.tujuans.map((t) => (
                                                <Badge key={t.id} variant="primary" size="sm">
                                                    {t.tujuan}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="font-medium text-text-primary">-</p>
                                        )}
                                    </div>
                                </div>
                                {detailSurat.isi_ringkas && (
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-text-secondary">Isi Ringkas Surat</p>
                                        <p className="font-medium text-text-primary">{detailSurat.isi_ringkas}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Identitas Agenda */}
                        <div className="pt-4 border-t border-border-default">
                            <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Identitas Agenda</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-text-secondary">Tanggal Diterima</p>
                                    <p className="font-medium text-text-primary">{formatDateShort(detailSurat.tanggal_diterima)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">No Agenda</p>
                                    <p className="font-medium text-text-primary">{detailSurat.nomor_agenda.split('/')[1] || detailSurat.nomor_agenda}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Indeks Surat</p>
                                    <p className="font-medium text-text-primary">
                                        {detailSurat.indeks_berkas
                                            ? `${detailSurat.indeks_berkas.kode} - ${detailSurat.indeks_berkas.nama}`
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Kode Klasifikasi</p>
                                    <p className="font-medium text-text-primary">
                                        {detailSurat.kode_klasifikasi
                                            ? `${detailSurat.kode_klasifikasi.kode} - ${detailSurat.kode_klasifikasi.nama}`
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Staff Pengolah</p>
                                    <p className="font-medium text-text-primary">{detailSurat.staff_pengolah?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Tanggal Diteruskan</p>
                                    <p className="font-medium text-text-primary">
                                        {detailSurat.tanggal_diteruskan ? formatDateShort(detailSurat.tanggal_diteruskan) : '-'}
                                    </p>
                                </div>
                                {detailSurat.catatan_tambahan && (
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-text-secondary">Catatan Tambahan</p>
                                        <p className="font-medium text-text-primary">{detailSurat.catatan_tambahan}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* File Preview */}
                        {detailSurat.file_path && (
                            <div className="pt-4 border-t border-border-default">
                                <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">File Surat</h3>
                                <div className="mb-3">
                                    {detailSurat.file_path.match(/\.(pdf)$/i) ? (
                                        <iframe
                                            src={route('persuratan.surat-masuk.preview', detailSurat.id)}
                                            className="w-full h-96 border border-border-default rounded-lg"
                                            title="Preview Surat"
                                        />
                                    ) : detailSurat.file_path.match(/\.(jpe?g|png)$/i) ? (
                                        <img
                                            src={route('persuratan.surat-masuk.preview', detailSurat.id)}
                                            alt="Preview Surat"
                                            className="max-w-full h-auto rounded-lg border border-border-default"
                                        />
                                    ) : (
                                        <p className="text-sm text-text-secondary italic">Preview tidak tersedia untuk format file ini.</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <a
                                        href={route('persuratan.surat-masuk.preview', detailSurat.id)}
                                        target="_blank"
                                        className="text-primary hover:text-primary-hover font-medium text-sm"
                                    >
                                        Buka di Tab Baru
                                    </a>
                                    <span className="text-text-secondary">|</span>
                                    <a
                                        href={route('persuratan.surat-masuk.download', detailSurat.id)}
                                        className="text-primary hover:text-primary-hover font-medium text-sm"
                                    >
                                        Download File
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Audit Info */}
                        <div className="pt-4 border-t border-border-default">
                            <p className="text-xs text-text-secondary">
                                Diinput oleh <span className="font-medium text-text-primary">{detailSurat.created_by?.name || 'System'}</span> pada {formatDateShort(detailSurat.created_at)} pukul {formatTimeWithColon(detailSurat.created_at)}
                            </p>
                        </div>
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
