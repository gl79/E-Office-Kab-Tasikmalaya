import { useState, useMemo, useCallback } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Copy, ExternalLink, Filter, MessageCircle, RotateCcw, ArrowRight } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination, Badge, ConfirmDialog } from '@/Components/ui';
import { TextInput, FormDatePicker, FormSelect } from '@/Components/form';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks';
import TentatifTable from './Components/TentatifTable';
import TindakLanjutModal from './Components/TentatifEditModal';
import { formatDateShort } from '@/utils';
import DisposisiModal from '@/Components/persuratan/DisposisiModal';
import TimelineModal from '@/Components/persuratan/TimelineModal';
import MapPreview from '@/Components/maps/MapPreview';
import type { PageProps } from '@/types';
import type { Agenda } from '@/types/penjadwalan';
import type { SuratMasuk } from '@/types/persuratan';

interface Props extends PageProps {
    tentatif?: { data: Agenda[] };
    sifatOptions: Record<string, string>;
    filters: {
        search?: string;
    };
}

const STATUS_TINDAK_LANJUT_OPTIONS = [
    'Menunggu Tindak Lanjut',
    'Diterima / Diketahui',
    'Masuk Jadwal Tentatif',
    'Sudah Disposisi',
    'Jadwal Definitif',
    'Selesai',
];

const getWorkflowStatusVariant = (status?: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
        case 'Masuk Jadwal Tentatif':
            return 'warning';
        case 'Sudah Didisposisi':
        case 'Sudah Disposisi':
            return 'info';
        case 'Jadwal Definitif':
            return 'primary';
        case 'Selesai':
            return 'success';
        default:
            return 'default';
    }
};

const formatTimeNoSeconds = (time?: string | null) => {
    if (!time) return '';
    return time.length >= 5 ? time.slice(0, 5) : time;
};

const isDisposedStatus = (status?: string): boolean => {
    return status === 'Sudah Didisposisi' || status === 'Sudah Disposisi';
};

const getDisposisiRecipientLabel = (agenda: Agenda): string | null => {
    const fromStatus = agenda.status_tindak_lanjut_disposisi_ke?.trim();
    if (fromStatus) {
        return fromStatus;
    }

    const fromSuratStatus = agenda.surat_masuk?.status_tindak_lanjut_disposisi_ke?.trim();
    if (fromSuratStatus) {
        return fromSuratStatus;
    }

    return null;
};

const getWorkflowStatusLabel = (agenda: Agenda): string => {
    const status = agenda.status_tindak_lanjut ?? agenda.status_formal_label ?? agenda.status_label ?? '-';

    if (isDisposedStatus(status)) {
        const recipient = getDisposisiRecipientLabel(agenda);
        return recipient ? `Sudah Disposisi Ke ${recipient}` : 'Sudah Disposisi';
    }

    return status;
};

const formatAgendaTimeForDetail = (agenda: Agenda): string => {
    const mulai = formatTimeNoSeconds(agenda.waktu_mulai);
    const selesai = formatTimeNoSeconds(agenda.waktu_selesai);

    if (!mulai) {
        return '';
    }

    if (agenda.sampai_selesai) {
        return `${mulai} WIB - Sampai Dengan Selesai`;
    }

    if (selesai) {
        return `${mulai} WIB - ${selesai} WIB`;
    }

    return `${mulai} WIB - Sampai Dengan Selesai`;
};

const TentatifIndex = ({
    tentatif,
    sifatOptions,
    filters,
}: Props) => {
    const { auth, notifications } = usePage<PageProps & { notifications?: { jadwal_tentatif_pending?: number } }>().props;
    const pendingTentatifCount = (auth.user?.role !== 'superadmin' && auth.user?.role !== 'tu')
        ? (notifications?.jadwal_tentatif_pending ?? 0)
        : 0;

    const cacheKey = `penjadwalan_tentatif_${auth.user.id}`;

    const {
        data: tentatifDataRaw,
        updateAndCache,
        isLoading,
    } = useDeferredDataMutable<{ data: Agenda[] }>(cacheKey, tentatif);

    const allData = tentatifDataRaw?.data || [];

    // Search state
    const [search, setSearch] = useState(filters.search || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [sifat, setSifat] = useState('');
    const [statusTindakLanjut, setStatusTindakLanjut] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const itemsPerPage = 10;

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [whatsAppTemplate, setWhatsAppTemplate] = useState('');
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Disposisi modal
    const [disposisiModalOpen, setDisposisiModalOpen] = useState(false);
    const [selectedSuratForDisposisi, setSelectedSuratForDisposisi] = useState<SuratMasuk | null>(null);
    const [timelineModalOpen, setTimelineModalOpen] = useState(false);
    const [timelineSurat, setTimelineSurat] = useState<SuratMasuk | null>(null);

    // Disposition timeline for detail modal
    const [detailTimeline, setDetailTimeline] = useState<Array<{
        id: string; aksi: string; aksi_label: string; keterangan: string;
        user_name: string; user_jabatan: string; created_at: string;
    }>>([]);
    const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

    const fetchDetailTimeline = useCallback((suratMasukId: string) => {
        setIsLoadingTimeline(true);
        fetch(route('persuratan.surat-masuk.timeline', suratMasukId), {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then(res => res.json())
            .then(data => setDetailTimeline(data.timelines || []))
            .catch(() => setDetailTimeline([]))
            .finally(() => setIsLoadingTimeline(false));
    }, []);

    // Form for editing kehadiran (Tindak Lanjut)
    const form = useForm({
        tanggal_agenda: '',
        waktu_mulai: '',
        waktu_selesai: '',
        sampai_selesai: false,
        lokasi_type: 'dalam_daerah',
        provinsi_id: '',
        kabupaten_id: '',
        kecamatan_id: '',
        desa_id: '',
        tempat: '',
        status_kehadiran: 'Dihadiri',
        nama_yang_mewakili: '',
        jabatan_yang_mewakili: '',
        keterangan: '',
    });

    const sifatSelectOptions = useMemo(
        () => Object.entries(sifatOptions).map(([value, label]) => ({ value, label })),
        [sifatOptions]
    );

    // Filter data client-side
    const filteredData = useMemo(() => {
        let data = allData;

        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter((item) =>
                item.nama_kegiatan?.toLowerCase().includes(lowerSearch) ||
                item.surat_masuk?.nomor_surat?.toLowerCase().includes(lowerSearch) ||
                item.surat_masuk?.asal_surat?.toLowerCase().includes(lowerSearch) ||
                item.surat_masuk?.perihal?.toLowerCase().includes(lowerSearch) ||
                item.tempat?.toLowerCase().includes(lowerSearch) ||
                item.dihadiri_oleh?.toLowerCase().includes(lowerSearch)
            );
        }

        if (sifat) {
            data = data.filter((item) => item.surat_masuk?.sifat === sifat);
        }

        if (statusTindakLanjut) {
            data = data.filter((item) => {
                const status = (item.status_tindak_lanjut ?? item.status_formal_label ?? item.status_label ?? '').trim();
                return statusTindakLanjut === 'Sudah Disposisi'
                    ? isDisposedStatus(status)
                    : status === statusTindakLanjut;
            });
        }

        if (startDate) {
            data = data.filter((item) => {
                const dateValue = item.surat_masuk?.tanggal_diterima ?? item.tanggal_agenda ?? '';
                return dateValue !== '' && dateValue >= startDate;
            });
        }

        if (endDate) {
            data = data.filter((item) => {
                const dateValue = item.surat_masuk?.tanggal_diterima ?? item.tanggal_agenda ?? '';
                return dateValue !== '' && dateValue <= endDate;
            });
        }

        return data;
    }, [allData, search, sifat, statusTindakLanjut, startDate, endDate]);

    // Pagination
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const hasActiveFilters = !!(search || sifat || statusTindakLanjut || startDate || endDate);

    const handleResetFilters = () => {
        setSearch('');
        setSifat('');
        setStatusTindakLanjut('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const handleEditKehadiran = (agenda: Agenda) => {
        setSelectedAgenda(agenda);
        const parts = agenda.kode_wilayah ? agenda.kode_wilayah.split('.') : [];
        const isDalamDaerah = (agenda.lokasi_type || 'dalam_daerah') === 'dalam_daerah';

        form.setData({
            tanggal_agenda: agenda.tanggal_agenda?.substring(0, 10) || '',
            waktu_mulai: agenda.waktu_mulai || '08:00',
            waktu_selesai: agenda.waktu_selesai || '',
            sampai_selesai: !!agenda.sampai_selesai,
            lokasi_type: agenda.lokasi_type || 'dalam_daerah',
            provinsi_id: isDalamDaerah ? '32' : (parts[0] || ''),
            kabupaten_id: isDalamDaerah ? '06' : (parts[1] || ''),
            kecamatan_id: parts[2] || '',
            desa_id: parts[3] || '',
            // Field tempat sengaja dikosongkan agar user mengisi ulang pada saat tindak lanjut.
            tempat: '',
            status_kehadiran: agenda.status_kehadiran || 'Dihadiri',
            nama_yang_mewakili: agenda.nama_yang_mewakili || '',
            jabatan_yang_mewakili: '', // Add mapping if stored in model, otherwise empty
            keterangan: agenda.keterangan || '',
        });
        setShowEditModal(true);
    };

    const mapAgendaSuratForTimeline = (agenda: Agenda): SuratMasuk | null => {
        if (!agenda.surat_masuk) {
            return null;
        }

        const surat = agenda.surat_masuk;

        return {
            id: surat.id,
            nomor_agenda: surat.nomor_agenda ?? '',
            tanggal_diterima: surat.tanggal_diterima ?? '',
            tanggal_surat: surat.tanggal_surat ?? '',
            asal_surat: surat.asal_surat ?? '-',
            nomor_surat: surat.nomor_surat ?? '-',
            sifat: surat.sifat ?? '',
            perihal: surat.perihal ?? '',
            isi_ringkas: surat.isi_ringkas ?? null,
            lampiran: surat.lampiran ?? null,
            file_path: surat.file_path ?? null,
            tanggal_diteruskan: surat.tanggal_diteruskan ?? null,
            catatan_tambahan: surat.catatan_tambahan ?? null,
            tujuans: surat.tujuans ?? [],
            created_at: surat.created_at ?? '',
            jenis_surat: surat.jenis_surat ?? null,
            indeks_berkas: surat.indeks_berkas ?? null,
            kode_klasifikasi: surat.kode_klasifikasi ?? null,
            staff_pengolah: surat.staff_pengolah ?? null,
            created_by: surat.created_by ?? null,
        };
    };

    const handleSubmitKehadiran = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgenda) return;
        const selectedAgendaId = selectedAgenda.id;

        form.put(route('penjadwalan.tentatif.tindak-lanjut', selectedAgendaId), {
            onSuccess: () => {
                // Jadwal sudah menjadi definitif — tetap di tabel tapi matikan tombol aksi.
                updateAndCache((prev) => ({
                    ...prev,
                    data: prev.data.map((agenda) =>
                        agenda.id === selectedAgendaId
                            ? {
                                ...agenda,
                                status: 'definitif' as const,
                                status_label: 'Definitif',
                                status_tindak_lanjut: 'Jadwal Definitif',
                                status_tindak_lanjut_label: 'Jadwal Definitif',
                                can_tindak_lanjut: false,
                                can_disposisi: false,
                            }
                            : agenda
                    ),
                }));
                setShowEditModal(false);
                form.reset();
                setSelectedAgenda(null);
            },
        });
    };

    const handleBulkExportWhatsApp = () => {
        if (filteredData.length === 0) return;

        const lines: string[] = [
            '*JADWAL TENTATIF BUPATI TASIKMALAYA*',
            `Total: ${filteredData.length} jadwal`,
            '',
        ];

        filteredData.forEach((item, index) => {
            const tanggal = item.tanggal_format_indonesia ?? item.tanggal_agenda_formatted;
            lines.push(`${index + 1}. *${tanggal}*`);
            lines.push(`   Pukul: ${item.waktu_lengkap} WIB`);
            lines.push(`   Kegiatan: ${item.nama_kegiatan}`);
            lines.push(`   Lokasi: ${item.tempat}`);
            if (item.dihadiri_oleh) {
                lines.push(`   Dihadiri: ${item.dihadiri_oleh}`);
            }
            lines.push(`   Status: ${getWorkflowStatusLabel(item)}`);
            if (index < filteredData.length - 1) {
                lines.push('');
            }
        });

        setSelectedAgenda(null);
        setWhatsAppTemplate(lines.join('\n'));
        setIsCopied(false);
        setIsLoadingTemplate(false);
        setShowWhatsAppModal(true);
    };

    const handleCopyTemplate = async () => {
        try {
            await navigator.clipboard.writeText(whatsAppTemplate);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleDelete = () => {
        if (!selectedAgenda) return;
        setIsDeleting(true);

        router.delete(route('penjadwalan.tentatif.destroy', selectedAgenda.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                setSelectedAgenda(null);
            },
        });
    };

    const formWithSubmit = {
        ...form,
        submitHandler: handleSubmitKehadiran
    };

    // Format No Agenda: "SM/0001/2024" → "0001"
    const formatNoAgenda = (nomor?: string) => {
        if (!nomor) return '-';
        const parts = nomor.split('/');
        return parts.length >= 2 ? parts[1] : nomor;
    };

    const suratMasukId = selectedAgenda?.surat_masuk?.id;
    const sm = selectedAgenda?.surat_masuk;
    const suratFilePath = selectedAgenda?.surat_masuk?.file_path ?? null;
    const suratPreviewUrl = suratMasukId
        ? route('persuratan.surat-masuk.preview', suratMasukId)
        : null;
    const suratDownloadUrl = suratMasukId
        ? route('persuratan.surat-masuk.download', suratMasukId)
        : null;
    const isPdfFile = !!suratFilePath && /\.(pdf)$/i.test(suratFilePath);
    const isImageFile = !!suratFilePath && /\.(jpe?g|png|webp)$/i.test(suratFilePath);

    return (
        <>
            <Head title="Jadwal Tentatif" />

            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-text-primary">Jadwal Tentatif</h1>
                    {pendingTentatifCount > 0 && (
                        <Badge variant="danger">
                            {pendingTentatifCount} Belum Ditindaklanjuti
                        </Badge>
                    )}
                </div>
                <p className="text-text-secondary text-sm mt-1">Kelola jadwal yang masih dalam tahap konfirmasi</p>
            </div>

            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-2 flex-1 max-w-2xl">
                                <TextInput
                                    type="text"
                                    placeholder="Cari kegiatan, nomor surat, perihal, lokasi..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full px-3"
                                />
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="gap-2"
                                    title="Filter Lanjutan"
                                >
                                    <Filter className={`h-4 w-4 ${showFilters ? 'text-primary' : ''}`} />
                                    <span>Filter</span>
                                    {hasActiveFilters && (
                                        <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-text-inverse">
                                            {(search ? 1 : 0) + (sifat ? 1 : 0) + (statusTindakLanjut ? 1 : 0) + (startDate ? 1 : 0) + (endDate ? 1 : 0)}
                                        </span>
                                    )}
                                </Button>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={handleBulkExportWhatsApp}
                                disabled={filteredData.length === 0}
                                className="gap-2"
                                title="Export semua jadwal ke WhatsApp"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>Export WhatsApp</span>
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="p-4 bg-surface-hover rounded-lg border border-border-default animate-in fade-in slide-in-from-top-2 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                            Status Tindak Lanjut
                                        </label>
                                        <FormSelect
                                            options={STATUS_TINDAK_LANJUT_OPTIONS.map((status) => ({ value: status, label: status }))}
                                            value={statusTindakLanjut}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                setStatusTindakLanjut(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            placeholder="Semua Status"
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
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-2 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleResetFilters}
                                        className="gap-2"
                                        disabled={!hasActiveFilters}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Reset Filter
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="p-4">
                        <TableShimmer columns={9} />
                    </div>
                ) : (
                    <TentatifTable
                        data={paginatedData}
                        onTindakLanjut={handleEditKehadiran}
                        onViewDetail={(agenda) => {
                            setSelectedAgenda(agenda);
                            setShowDetailModal(true);
                            if (agenda.surat_masuk?.id) {
                                fetchDetailTimeline(agenda.surat_masuk.id);
                            } else {
                                setDetailTimeline([]);
                            }
                        }}
                        onDisposisi={(agenda) => {
                            if (agenda.surat_masuk) {
                                setSelectedAgenda(agenda);
                                setSelectedSuratForDisposisi(agenda.surat_masuk as SuratMasuk);
                                setDisposisiModalOpen(true);
                            }
                        }}
                        onDelete={(agenda) => {
                            setSelectedAgenda(agenda);
                            setDeleteModalOpen(true);
                        }}
                        onViewTimeline={(agenda) => {
                            const surat = mapAgendaSuratForTimeline(agenda);
                            if (!surat) return;
                            setTimelineSurat(surat);
                            setTimelineModalOpen(true);
                        }}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        search={search}
                        sifatOptions={sifatOptions}
                    />
                )}

                {/* Pagination */}
                {!isLoading && (
                    <div className="p-4 border-t border-border-default">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-text-secondary">
                                Menampilkan {paginatedData.length} dari {filteredData.length} data
                            </p>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Kehadiran / Tindak Lanjut Modal */}
            <TindakLanjutModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                selectedAgenda={selectedAgenda}
                form={formWithSubmit as any}
            />

            {/* WhatsApp Export Modal */}
            <Modal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                title="Export WhatsApp"
                size="lg"
            >
                <div className="space-y-4">
                    {isLoadingTemplate ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-text-secondary">
                                Template menggunakan format bold WhatsApp (*teks*). Salin lalu tempelkan langsung ke WhatsApp.
                            </p>
                            <div className="bg-surface-hover rounded-lg p-4 border border-border-default">
                                <pre className="whitespace-pre-wrap text-sm font-mono text-text-primary">
                                    {whatsAppTemplate}
                                </pre>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowWhatsAppModal(false)}
                                >
                                    Tutup
                                </Button>
                                <Button
                                    onClick={handleCopyTemplate}
                                    className="flex items-center gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    {isCopied ? 'Tersalin!' : 'Salin ke Clipboard'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Jadwal Tentatif"
                size="2xl"
            >
                {selectedAgenda && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Kolom Kiri - Informasi */}
                        <div className="space-y-5 overflow-y-auto max-h-[70vh] pr-1">
                            {/* Identitas Surat */}
                            <div>
                                <h4 className="font-semibold text-text-primary mb-3 pb-1 border-b border-border-default">
                                    Identitas Surat
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-text-secondary">Tanggal Surat</p>
                                        <p className="font-medium text-text-primary">{sm?.tanggal_surat ? formatDateShort(sm.tanggal_surat) : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Asal Surat</p>
                                        {sm?.asal_surat ? (
                                            <Badge variant="primary" className="mt-1">{sm.asal_surat}</Badge>
                                        ) : (
                                            <p className="font-medium text-text-primary">-</p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-text-secondary">Kepada (Tujuan Surat)</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {sm?.tujuans?.length ? (
                                                sm.tujuans.map((tujuan) => (
                                                    <Badge key={tujuan.id} variant="primary" size="sm">
                                                        {tujuan.tujuan}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="font-medium text-text-primary">-</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Nomor Surat</p>
                                        <p className="font-medium text-text-primary">{sm?.nomor_surat || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Jenis Surat</p>
                                        <p className="font-medium text-text-primary">{sm?.jenis_surat?.nama || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Sifat Surat</p>
                                        <p className="font-medium text-text-primary">{sm?.sifat_label || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Lampiran</p>
                                        <p className="font-medium text-text-primary">{sm?.lampiran ?? 0} berkas</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Perihal</p>
                                        <p className="font-medium text-text-primary">{sm?.perihal || '-'}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-text-secondary">Isi Ringkas Surat</p>
                                        <p className="font-medium text-text-primary">{sm?.isi_ringkas || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Alur Disposisi */}
                            {(() => {
                                const disposisiEntries = detailTimeline.filter(t => t.aksi === 'disposisi');
                                if (disposisiEntries.length === 0 && !isLoadingTimeline) return null;
                                return (
                                    <div className="pt-4 border-t border-border-default">
                                        <h4 className="font-semibold text-text-primary mb-3 pb-1 border-b border-border-default">
                                            Alur Disposisi
                                        </h4>
                                        {isLoadingTimeline ? (
                                            <p className="text-sm text-text-secondary italic">Memuat data disposisi...</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {disposisiEntries.map((entry) => (
                                                    <div key={entry.id} className="flex items-start gap-2 text-sm">
                                                        <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-text-primary">{entry.keterangan}</p>
                                                            <p className="text-xs text-text-secondary">
                                                                {new Date(entry.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                                                                {new Date(entry.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Identitas Agenda */}
                            <div className="pt-4 border-t border-border-default">
                                <h4 className="font-semibold text-text-primary mb-3 pb-1 border-b border-border-default">
                                    Identitas Agenda
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-text-secondary">Tanggal Diterima</p>
                                        <p className="font-medium text-text-primary">{sm?.tanggal_diterima ? formatDateShort(sm.tanggal_diterima) : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">No Agenda</p>
                                        <p className="font-medium text-text-primary">{formatNoAgenda(sm?.nomor_agenda)}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Indeks Surat</p>
                                        <p className="font-medium text-text-primary">
                                            {sm?.indeks_berkas
                                                ? `${sm.indeks_berkas.kode} - ${sm.indeks_berkas.nama}`
                                                : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Kode Klasifikasi</p>
                                        <p className="font-medium text-text-primary">
                                            {sm?.kode_klasifikasi
                                                ? `${sm.kode_klasifikasi.kode} - ${sm.kode_klasifikasi.nama}`
                                                : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Staff Pengolah</p>
                                        <p className="font-medium text-text-primary">{sm?.staff_pengolah?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Tanggal Diteruskan</p>
                                        <p className="font-medium text-text-primary">
                                            {sm?.tanggal_diteruskan ? formatDateShort(sm.tanggal_diteruskan) : '-'}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-text-secondary">Catatan Tambahan</p>
                                        <p className="font-medium text-text-primary">{sm?.catatan_tambahan || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Jadwal */}
                            <div className="pt-4 border-t border-border-default">
                                <h4 className="font-semibold text-text-primary mb-3 pb-1 border-b border-border-default">
                                    Detail Jadwal
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="sm:col-span-2">
                                        <p className="text-text-secondary">Kegiatan</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.nama_kegiatan}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Tanggal</p>
                                        <p className="font-medium text-text-primary">
                                            {selectedAgenda.tanggal_agenda ? selectedAgenda.tanggal_format_indonesia : <span className="italic text-text-muted">Menunggu Tindak Lanjut</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Waktu</p>
                                        <p className="font-medium text-text-primary">
                                            {selectedAgenda.waktu_mulai
                                                ? formatAgendaTimeForDetail(selectedAgenda)
                                                : <span className="italic text-text-muted">Belum Diatur</span>}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-text-secondary">Lokasi</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.tempat || '-'}</p>
                                        <MapPreview lokasi={selectedAgenda.wilayah_text ?? selectedAgenda.tempat} />
                                    </div>
                                    {selectedAgenda.keterangan && (
                                        <div>
                                            <p className="text-text-secondary">Keterangan</p>
                                            <p className="font-medium text-text-primary">{selectedAgenda.keterangan}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="pt-4 border-t border-border-default">
                                <h4 className="font-semibold text-text-primary mb-3 pb-1 border-b border-border-default">
                                    Status
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-secondary w-28 shrink-0">Status Jadwal</span>
                                        <Badge variant={getWorkflowStatusVariant(selectedAgenda.status_tindak_lanjut)}>
                                            {getWorkflowStatusLabel(selectedAgenda)}
                                        </Badge>
                                    </div>
                                    {selectedAgenda.dihadiri_oleh && (
                                        <div className="flex gap-2 text-sm">
                                            <span className="text-text-secondary w-28 shrink-0">Dihadiri oleh</span>
                                            <span className="font-medium text-text-primary">
                                                {selectedAgenda.dihadiri_oleh}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan - Preview PDF */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-text-primary">Preview Surat</h4>
                                {suratPreviewUrl && (
                                    <a
                                        href={suratPreviewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Buka di tab baru
                                    </a>
                                )}
                            </div>
                            <div className="bg-surface-hover rounded-lg border border-border-default overflow-hidden flex-1">
                                {!suratFilePath || !suratPreviewUrl ? (
                                    <div className="flex items-center justify-center h-[560px]">
                                        <p className="text-text-secondary text-sm">File surat tidak tersedia</p>
                                    </div>
                                ) : isPdfFile ? (
                                    <iframe
                                        src={suratPreviewUrl}
                                        className="w-full h-[640px]"
                                        title="Preview Surat"
                                        style={{ border: 'none' }}
                                    />
                                ) : isImageFile ? (
                                    <div className="p-4">
                                        <img
                                            src={suratPreviewUrl}
                                            alt="Preview Surat"
                                            className="w-full h-auto max-h-[640px] object-contain rounded border border-border-default bg-surface"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[560px] gap-2 px-4 text-center">
                                        <p className="text-text-secondary text-sm">
                                            Preview tidak tersedia untuk format file ini.
                                        </p>
                                        {suratDownloadUrl && (
                                            <a
                                                href={suratDownloadUrl}
                                                className="text-primary text-sm hover:underline"
                                            >
                                                Download File
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                type="delete"
                title="Hapus Jadwal"
                message={
                    <p>
                        Apakah Anda yakin ingin menghapus jadwal{' '}
                        <strong>{selectedAgenda?.nama_kegiatan}</strong>?
                        Data akan dipindahkan ke arsip.
                    </p>
                }
                isLoading={isDeleting}
            />

            {/* Disposisi Modal */}
            <DisposisiModal
                isOpen={disposisiModalOpen}
                onClose={() => setDisposisiModalOpen(false)}
                suratMasukId={selectedSuratForDisposisi?.id ?? null}
                suratPerihal={selectedSuratForDisposisi?.perihal ?? undefined}
                onSuccess={() => {
                    const agendaId = selectedAgenda?.id;
                    if (agendaId) {
                        // Setelah disposisi, aksi pindah ke pemegang terakhir.
                        updateAndCache((prev) => ({
                            ...prev,
                            data: prev.data.map((agenda) => (
                                agenda.id === agendaId
                                    ? {
                                        ...agenda,
                                        status_tindak_lanjut: 'Sudah Didisposisi',
                                        status_tindak_lanjut_label: 'Sudah Didisposisi',
                                        can_tindak_lanjut: false,
                                        can_disposisi: false,
                                    }
                                    : agenda
                            )),
                        }));
                    }

                    router.visit(window.location.href, {
                        only: ['tentatif'],
                        preserveState: true,
                        preserveScroll: true,
                    });
                }}
            />

            <TimelineModal
                isOpen={timelineModalOpen}
                onClose={() => setTimelineModalOpen(false)}
                suratMasuk={timelineSurat}
                sifatOptions={sifatOptions}
            />
        </>
    );
};

TentatifIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default TentatifIndex;
