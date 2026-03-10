import { useState, useMemo } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Copy, ExternalLink, MessageCircle } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination, Badge, ConfirmDialog } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks';
import TentatifTable from './Components/TentatifTable';
import TindakLanjutModal from './Components/TentatifEditModal';
import { getDisposisiVariant, getDisposisiLabel } from '@/utils/badgeVariants';
import { formatDateShort } from '@/utils';
import DisposisiModal from '@/Components/persuratan/DisposisiModal';
import TimelineModal from '@/Components/persuratan/TimelineModal';
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

const TentatifIndex = ({
    tentatif,
    sifatOptions,
    filters,
}: Props) => {
    const { auth } = usePage<PageProps>().props;

    const cacheKey = `penjadwalan_tentatif_${auth.user.id}`;

    const {
        data: tentatifDataRaw,
        isLoading,
    } = useDeferredDataMutable<{ data: Agenda[] }>(cacheKey, tentatif);

    const allData = tentatifDataRaw?.data || [];

    // Search state
    const [search, setSearch] = useState(filters.search || '');
    const [currentPage, setCurrentPage] = useState(1);
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

    // Filter data client-side
    const filteredData = useMemo(() => {
        if (!search) return allData;
        const lowerSearch = search.toLowerCase();
        return allData.filter((item) =>
            item.nama_kegiatan?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.nomor_surat?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.asal_surat?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.perihal?.toLowerCase().includes(lowerSearch) ||
            item.tempat?.toLowerCase().includes(lowerSearch) ||
            item.dihadiri_oleh?.toLowerCase().includes(lowerSearch)
        );
    }, [allData, search]);

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

        form.put(route('penjadwalan.tentatif.tindak-lanjut', selectedAgenda.id), {
            onSuccess: () => {
                setShowEditModal(false);
                form.reset();
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
            lines.push(`   Status: ${item.status_disposisi_label}`);
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

    const renderDisposisiBadge = (status: string) => (
        <Badge variant={getDisposisiVariant(status)}>{getDisposisiLabel(status)}</Badge>
    );
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
                <h1 className="text-2xl font-semibold text-text-primary">Jadwal Tentatif</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola jadwal yang masih dalam tahap konfirmasi</p>
            </div>

            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-2 flex-1 max-w-2xl">
                            <TextInput
                                type="text"
                                placeholder="Cari kegiatan, nomor surat, perihal, lokasi..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full px-3"
                            />
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
                        }}
                        onDisposisi={(agenda) => {
                            if (agenda.surat_masuk) {
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
                                <div className="space-y-2 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">No. Agenda</span>
                                        <span className="font-medium text-text-primary">
                                            {formatNoAgenda(selectedAgenda.surat_masuk?.nomor_agenda)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">No. Surat</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.surat_masuk?.nomor_surat || '-'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">Tanggal Surat</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.surat_masuk?.tanggal_surat_formatted || '-'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">Asal Surat</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.surat_masuk?.asal_surat || '-'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">Perihal</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.surat_masuk?.perihal || '-'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">Sifat</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.surat_masuk?.sifat_label || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Identitas Agenda */}
                            <div>
                                <h4 className="font-semibold text-text-primary mb-3 pb-1 border-b border-border-default">
                                    Identitas Agenda
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">Tanggal Diterima</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.surat_masuk?.tanggal_diterima ? formatDateShort(selectedAgenda.surat_masuk.tanggal_diterima) : '-'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">No Agenda</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.surat_masuk?.nomor_agenda ? (selectedAgenda.surat_masuk.nomor_agenda.split('/')[1] || selectedAgenda.surat_masuk.nomor_agenda) : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Jadwal */}
                            <div>
                                <h4 className="font-semibold text-text-primary mb-3 pb-1 border-b border-border-default">
                                    Detail Jadwal
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">Kegiatan</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.nama_kegiatan}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">Tanggal</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.tanggal_agenda ? selectedAgenda.tanggal_format_indonesia : <span className="italic text-text-muted">Menunggu Tindak Lanjut</span>}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">Waktu</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.waktu_mulai ? (
                                                <>
                                                    {selectedAgenda.waktu_mulai.substring(0, 5)} WIB {' '}
                                                    Sampai Dengan {' '}
                                                    {selectedAgenda.sampai_selesai
                                                        ? 'Selesai'
                                                        : (selectedAgenda.waktu_selesai ? `${selectedAgenda.waktu_selesai.substring(0, 5)} WIB` : 'Selesai')
                                                    }
                                                </>
                                            ) : <span className="italic text-text-muted">Belum Diatur</span>}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-text-secondary w-28 shrink-0">Lokasi</span>
                                        <span className="font-medium text-text-primary">
                                            {selectedAgenda.tempat}
                                        </span>
                                    </div>
                                    {selectedAgenda.lokasi_type_label && (
                                        <div className="flex gap-2">
                                            <span className="text-text-secondary w-28 shrink-0">Tipe Lokasi</span>
                                            <span className="font-medium text-text-primary">
                                                {selectedAgenda.lokasi_type_label}
                                            </span>
                                        </div>
                                    )}
                                    {selectedAgenda.keterangan && (
                                        <div className="flex gap-2">
                                            <span className="text-text-secondary w-28 shrink-0">Keterangan</span>
                                            <span className="font-medium text-text-primary">
                                                {selectedAgenda.keterangan}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <h4 className="font-semibold text-text-primary mb-3 pb-1 border-b border-border-default">
                                    Status
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-secondary w-28 shrink-0">Status Jadwal</span>
                                        <Badge variant="warning">
                                            {selectedAgenda.status_formal_label ?? selectedAgenda.status_label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-secondary w-28 shrink-0">
                                            {selectedAgenda.sumber_jadwal && selectedAgenda.sumber_jadwal !== 'disposisi'
                                                ? 'Kehadiran'
                                                : 'Disposisi'}
                                        </span>
                                        {renderDisposisiBadge(selectedAgenda.status_disposisi)}
                                    </div>
                                    {selectedAgenda.dihadiri_oleh && (
                                        <div className="flex gap-2 text-sm">
                                            <span className="text-text-secondary w-28 shrink-0">Dihadiri</span>
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
