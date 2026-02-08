import { useState, useMemo } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Eye, Printer, FileText, Filter, MoreVertical, Download, RotateCcw } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination, Dropdown } from '@/Components/ui';
import Badge from '@/Components/ui/Badge';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { TextInput } from '@/Components/form';
import FormSelect from '@/Components/form/FormSelect';
import FormDatePicker from '@/Components/form/FormDatePicker';
import { PageProps } from '@/types';
import { useDeferredDataMutable } from '@/hooks';
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
    kode_pengolah: string | null;
    file_path: string | null;
    indeks?: { kode: string; nama: string; jenis_surat: string | null } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    unit_kerja?: { nama: string; singkatan: string | null } | null;
    created_by?: { name: string } | null;
    created_at: string;
}

interface Props extends PageProps {
    suratKeluar?: SuratKeluar[];
    sifat1Options: Record<string, string>;
}

const CACHE_TTL_MS = 60_000;

const Index = ({ suratKeluar: initialSuratKeluar, sifat1Options }: Props) => {
    const { auth } = usePage<PageProps>().props;

    const { data: suratKeluar, updateAndCache, isLoading, hasCached } = useDeferredDataMutable<SuratKeluar[]>(
        `persuratan_surat_keluar_${auth.user.id}`,
        initialSuratKeluar,
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
    const [jenisSuratFilter, setJenisSuratFilter] = useState('');
    const itemsPerPage = 10;

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<SuratKeluar | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailSurat, setDetailSurat] = useState<SuratKeluar | null>(null);

    const hasActiveFilters = !!(search || startDate || endDate || sifat || jenisSuratFilter);

    const handleResetFilters = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        setSifat('');
        setJenisSuratFilter('');
        setPeriodeFilter('');
        setCurrentPage(1);
    };

    // Filter data client-side
    const filteredData = useMemo(() => {
        if (!suratKeluar) return [];
        let data = suratKeluar;

        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nomor_surat?.toLowerCase().includes(lowerSearch) ||
                item.kepada?.toLowerCase().includes(lowerSearch) ||
                item.perihal?.toLowerCase().includes(lowerSearch) ||
                item.no_urut?.toLowerCase().includes(lowerSearch)
            );
        }

        if (startDate) {
            data = data.filter(item => item.tanggal_surat >= startDate);
        }
        if (endDate) {
            data = data.filter(item => item.tanggal_surat <= endDate);
        }

        if (sifat) {
            data = data.filter(item => item.sifat_1 === sifat);
        }

        if (jenisSuratFilter) {
            data = data.filter(item => item.indeks?.jenis_surat === jenisSuratFilter);
        }

        return data;
    }, [suratKeluar, search, startDate, endDate, sifat, jenisSuratFilter]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
                updateAndCache(prev => prev.filter(item => item.id !== itemToDelete.id));
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
            biasa: 'info',
            terbatas: 'info',
            rahasia: 'warning',
            sangat_rahasia: 'danger',
        };

        return (
            <Badge variant={variants[sifatValue] || 'info'} className="justify-center min-w-[80px] whitespace-nowrap">
                {sifat1Options[sifatValue] || sifatValue}
            </Badge>
        );
    };

    const sifatSelectOptions = Object.entries(sifat1Options || {}).map(([value, label]) => ({
        value,
        label,
    }));

    const handleExportPDF = () => {
        const dataToExport = filteredData;
        if (dataToExport.length === 0) return;

        const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const filterInfo: string[] = [];
        if (search) filterInfo.push(`Pencarian: "${escapeHtml(search)}"`);
        if (startDate || endDate) filterInfo.push(`Periode: ${startDate || '...'} s/d ${endDate || '...'}`);
        if (sifat) filterInfo.push(`Sifat: ${sifat1Options[sifat] || sifat}`);
        if (jenisSuratFilter) filterInfo.push(`Jenis: ${jenisSuratFilter}`);

        const rows = dataToExport.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(item.no_urut)}</td>
                <td>${formatDateShort(item.tanggal_surat)}<br><small>${escapeHtml(item.nomor_surat)}</small></td>
                <td>${escapeHtml(item.kepada)}</td>
                <td>${escapeHtml(item.perihal)}</td>
                <td>${escapeHtml(sifat1Options[item.sifat_1] || item.sifat_1)}</td>
            </tr>
        `).join('');

        const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Laporan Surat Keluar</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 11px; padding: 20px; }
    .header { text-align: center; margin-bottom: 16px; border-bottom: 3px double #000; padding-bottom: 12px; }
    .header h1 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .header h2 { font-size: 16px; text-transform: uppercase; margin-top: 4px; }
    .meta { margin-bottom: 12px; font-size: 10px; color: #555; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #333; padding: 4px 6px; text-align: left; vertical-align: top; }
    th { background: #f0f0f0; font-size: 10px; text-transform: uppercase; text-align: center; }
    td:first-child { text-align: center; width: 30px; }
    td small { color: #666; }
    .footer { margin-top: 16px; font-size: 9px; color: #888; display: flex; justify-content: space-between; }
    @media print { body { padding: 0; } }
</style>
</head><body>
<div class="header">
    <h1>Pemerintah Kabupaten Tasikmalaya</h1>
    <h2>Laporan Data Surat Keluar</h2>
</div>
${filterInfo.length > 0 ? `<div class="meta">Filter: ${filterInfo.join(' | ')}</div>` : ''}
<div class="meta">Total: ${dataToExport.length} data</div>
<table>
    <thead><tr>
        <th>No</th><th>Agenda</th><th>Tgl Surat / No Surat</th><th>Kepada</th><th>Perihal</th><th>Sifat</th>
    </tr></thead>
    <tbody>${rows}</tbody>
</table>
<div class="footer">
    <span>Dicetak pada: ${new Date().toLocaleString('id-ID')}</span>
    <span>Dicetak oleh: ${auth.user.name}</span>
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
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
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={handleExportPDF} disabled={filteredData.length === 0} title="Export PDF">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                                <Link href={route('persuratan.surat-keluar.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tambah Surat
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <div className="p-4 bg-surface-hover rounded-lg border border-border-default animate-in fade-in slide-in-from-top-2 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                                                const now = new Date();
                                                let start = '';
                                                let end = '';

                                                if (val === 'hari_ini') {
                                                    start = end = now.toISOString().split('T')[0];
                                                } else if (val === 'minggu_ini') {
                                                    const first = now.getDate() - now.getDay();
                                                    const last = first + 6;
                                                    start = new Date(now.setDate(first)).toISOString().split('T')[0];
                                                    end = new Date(now.setDate(last)).toISOString().split('T')[0];
                                                } else if (val === 'bulan_ini') {
                                                    start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                                                    end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                                                } else if (val === 'tahun_ini') {
                                                    start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                                                    end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
                                                }

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
                                            Jenis Surat
                                        </label>
                                        <select
                                            className="w-full rounded-md border-border-default bg-surface focus:border-primary focus:ring-primary sm:text-sm"
                                            value={jenisSuratFilter}
                                            onChange={(e) => {
                                                setJenisSuratFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Semua Jenis</option>
                                            <option value="Penandatanganan">Penandatanganan</option>
                                            <option value="Pemberian Bantuan">Pemberian Bantuan</option>
                                            <option value="Audiensi">Audiensi</option>
                                            <option value="Surat Tugas">Surat Tugas</option>
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
                        <TableShimmer columns={7} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-border-default">
                            <thead className="bg-surface-hover">
                                <tr>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase w-12">No</th>
                                    <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">No Agenda / Urut</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase"><div>Tgl Surat</div><div>No Surat</div></th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Kepada</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Perihal</th>
                                    <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Sifat</th>
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
                                            {item.no_urut?.toString().padStart(4, '0')}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-sm">
                                            <div className="font-medium text-text-primary">{formatDateShort(item.tanggal_surat)}</div>
                                            <div className="text-text-secondary text-xs">{item.nomor_surat}</div>
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-text-primary text-sm">
                                            {item.kepada}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-text-primary text-sm">
                                            <span className="line-clamp-2">{item.perihal}</span>
                                        </td>
                                        <td className="border border-border-default px-4 py-3">
                                            {getSifatBadge(item.sifat_1)}
                                        </td>
                                        <td className="border border-border-default px-4 py-3 text-center">
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
                                                        href={route('persuratan.surat-keluar.edit', item.id)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span>Edit</span>
                                                    </Dropdown.Link>

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
                                                            onClick={() => window.open(route('persuratan.surat-keluar.preview', item.id), '_blank')}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span>Lihat File</span>
                                                        </Dropdown.Link>
                                                    )}

                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => window.open(route('persuratan.surat-keluar.cetak-kartu', item.id), '_blank')}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                        <span>Cetak Kartu</span>
                                                    </Dropdown.Link>

                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => window.open(route('persuratan.surat-keluar.cetak-isi', item.id), '_blank')}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span>Cetak Kartu Hanya Isi</span>
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
                                        <td colSpan={7} className="border border-border-default px-4 py-8 text-center text-text-secondary">
                                            {hasActiveFilters ? 'Tidak ada surat keluar yang cocok dengan filter.' : 'Tidak ada data surat keluar.'}
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
                    <div className="space-y-6">
                        {/* Identitas Surat - urutan sesuai form input */}
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Identitas Surat</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-text-secondary">Tanggal Surat</p>
                                    <p className="font-medium text-text-primary">{formatDateShort(detailSurat.tanggal_surat)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Nomor Urut</p>
                                    <p className="font-medium text-text-primary">{detailSurat.no_urut?.toString().padStart(4, '0')}</p>
                                </div>
                                {detailSurat.indeks && (
                                    <div>
                                        <p className="text-sm text-text-secondary">Indeks</p>
                                        <p className="font-medium text-text-primary">{detailSurat.indeks.kode} - {detailSurat.indeks.nama}</p>
                                    </div>
                                )}
                                {detailSurat.indeks && (
                                    <div>
                                        <p className="text-sm text-text-secondary">Kode</p>
                                        <p className="font-medium text-text-primary">{detailSurat.indeks.kode}</p>
                                    </div>
                                )}
                                {detailSurat.unit_kerja && (
                                    <div>
                                        <p className="text-sm text-text-secondary">Pengolah</p>
                                        <p className="font-medium text-text-primary">
                                            {detailSurat.unit_kerja.singkatan
                                                ? `${detailSurat.unit_kerja.nama} (${detailSurat.unit_kerja.singkatan})`
                                                : detailSurat.unit_kerja.nama}
                                        </p>
                                    </div>
                                )}
                                {detailSurat.kode_pengolah && (
                                    <div>
                                        <p className="text-sm text-text-secondary">Kode Pengolah</p>
                                        <p className="font-medium text-text-primary">{detailSurat.kode_pengolah}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-text-secondary">Sifat</p>
                                    {getSifatBadge(detailSurat.sifat_1)}
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Nomor Surat</p>
                                    <p className="font-medium text-text-primary">{detailSurat.nomor_surat}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Kepada</p>
                                    <p className="font-medium text-text-primary">{detailSurat.kepada}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary">Lampiran</p>
                                    <p className="font-medium text-text-primary">{detailSurat.lampiran ?? 0} berkas</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-sm text-text-secondary">Perihal</p>
                                    <p className="font-medium text-text-primary">{detailSurat.perihal}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-sm text-text-secondary">Isi Ringkas</p>
                                    <p className="font-medium text-text-primary whitespace-pre-wrap">{detailSurat.isi_ringkas || '-'}</p>
                                </div>
                                {detailSurat.catatan && (
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-text-secondary">Catatan</p>
                                        <p className="font-medium text-text-primary">{detailSurat.catatan}</p>
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
                                            src={route('persuratan.surat-keluar.preview', detailSurat.id)}
                                            className="w-full h-96 border border-border-default rounded-lg"
                                            title="Preview Surat"
                                        />
                                    ) : detailSurat.file_path.match(/\.(jpe?g|png)$/i) ? (
                                        <img
                                            src={route('persuratan.surat-keluar.preview', detailSurat.id)}
                                            alt="Preview Surat"
                                            className="max-w-full h-auto rounded-lg border border-border-default"
                                        />
                                    ) : (
                                        <p className="text-sm text-text-secondary italic">Preview tidak tersedia untuk format file ini.</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <a
                                        href={route('persuratan.surat-keluar.preview', detailSurat.id)}
                                        target="_blank"
                                        className="text-primary hover:text-primary-hover font-medium text-sm"
                                    >
                                        Buka di Tab Baru
                                    </a>
                                    <span className="text-text-secondary">|</span>
                                    <a
                                        href={route('persuratan.surat-keluar.download', detailSurat.id)}
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
                                Diinput oleh <span className="font-medium text-text-primary">{detailSurat.created_by?.name || 'System'}</span> pada {formatDateShort(detailSurat.created_at)} jam {new Date(detailSurat.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Index;
