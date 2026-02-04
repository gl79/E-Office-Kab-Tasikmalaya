import { useState, useMemo, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Search, Copy } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination, Badge, ConfirmDialog } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks'; // Ensure index export exists or use explicit path
import TentatifTabNav from './Components/TentatifTabNav';
import TentatifTable from './Components/TentatifTable';
import TentatifEditModal from './Components/TentatifEditModal';
import { getDisposisiVariant, getDisposisiLabel } from '@/utils/badgeVariants';
import type { PageProps } from '@/types';
import type { Agenda } from '@/types/penjadwalan';

interface Props extends PageProps {
    menungguPeninjauan?: { data: Agenda[] };
    sudahDitinjau?: { data: Agenda[] };
    disposisiOptions: Record<string, string>;
    filters: {
        search?: string;
    };
}

const TentatifIndex = ({
    menungguPeninjauan,
    sudahDitinjau,
    disposisiOptions,
    filters,
}: Props) => {
    const { auth } = usePage<PageProps>().props;

    // Cache keys
    const menungguCacheKey = `penjadwalan_tentatif_menunggu_${auth.user.id}`;
    const sudahCacheKey = `penjadwalan_tentatif_sudah_${auth.user.id}`;

    // Deferred Data
    const {
        data: menungguDataRaw,
        isLoading: isMenungguLoading
    } = useDeferredDataMutable<{ data: Agenda[] }>(menungguCacheKey, menungguPeninjauan);

    const {
        data: sudahDataRaw,
        isLoading: isSudahLoading
    } = useDeferredDataMutable<{ data: Agenda[] }>(sudahCacheKey, sudahDitinjau);

    const menungguData = menungguDataRaw?.data || [];
    const sudahData = sudahDataRaw?.data || [];

    // Tab state
    const [activeTab, setActiveTab] = useState<'menunggu' | 'sudah'>('menunggu');

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

    // Definitif modal
    const [definitifModalOpen, setDefinitifModalOpen] = useState(false);
    const [isUpdatingDefinitif, setIsUpdatingDefinitif] = useState(false);

    // Form for editing kehadiran
    const form = useForm({
        dihadiri_oleh: '',
        status_disposisi: 'menunggu',
        keterangan: '',
    });

    const currentData = activeTab === 'menunggu' ? menungguData : sudahData;
    const isLoading = activeTab === 'menunggu' ? isMenungguLoading : isSudahLoading;

    // Filter data client-side
    const filteredData = useMemo(() => {
        if (!search) return currentData;
        const lowerSearch = search.toLowerCase();
        return currentData.filter((item) =>
            item.nama_kegiatan?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.nomor_surat?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.asal_surat?.toLowerCase().includes(lowerSearch) ||
            item.tempat?.toLowerCase().includes(lowerSearch) ||
            (activeTab === 'sudah' && item.dihadiri_oleh?.toLowerCase().includes(lowerSearch))
        );
    }, [currentData, search, activeTab]);

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

    const handleTabChange = (tab: 'menunggu' | 'sudah') => {
        setActiveTab(tab);
        setSearch('');
        setCurrentPage(1);
    };

    const handleEditKehadiran = (agenda: Agenda) => {
        setSelectedAgenda(agenda);
        form.setData({
            dihadiri_oleh: agenda.dihadiri_oleh || '',
            status_disposisi: agenda.status_disposisi || 'menunggu',
            keterangan: agenda.keterangan || '',
        });
        setShowEditModal(true);
    };

    const handleSubmitKehadiran = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgenda) return;

        form.put(route('penjadwalan.tentatif.update-kehadiran', selectedAgenda.id), {
            onSuccess: () => {
                setShowEditModal(false);
                form.reset();
            },
        });
    };

    const handleExportWhatsApp = async (agenda: Agenda) => {
        setSelectedAgenda(agenda);
        setIsLoadingTemplate(true);
        setShowWhatsAppModal(true);
        setIsCopied(false);

        try {
            const response = await fetch(route('penjadwalan.tentatif.export-wa', agenda.id));
            const data = await response.json();
            setWhatsAppTemplate(data.template);
        } catch (error) {
            console.error('Failed to fetch WhatsApp template:', error);
            setWhatsAppTemplate('Gagal memuat template WhatsApp');
        } finally {
            setIsLoadingTemplate(false);
        }
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

    const handleJadikanDefinitif = () => {
        if (!selectedAgenda) return;
        setIsUpdatingDefinitif(true);

        router.post(route('penjadwalan.tentatif.definitif', selectedAgenda.id), {}, {
            onFinish: () => {
                setIsUpdatingDefinitif(false);
                setDefinitifModalOpen(false);
                setSelectedAgenda(null);
            },
        });
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

    const disposisiSelectOptions = useMemo(() => {
        if (!disposisiOptions) return [];
        return Object.entries(disposisiOptions).map(([value, label]) => ({
            value,
            label,
        }));
    }, [disposisiOptions]);

    const formWithSubmit = {
        ...form,
        submitHandler: handleSubmitKehadiran
    };

    return (
        <>
            <Head title="Jadwal Tentatif" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Jadwal Tentatif</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola jadwal yang masih dalam tahap konfirmasi</p>
            </div>

            <div className="bg-surface rounded-lg border border-border-default">
                {/* Tabs */}
                <TentatifTabNav
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    countMenunggu={menungguData.length}
                    countSudah={sudahData.length}
                />

                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex gap-2 max-w-md">
                        <TextInput
                            type="text"
                            placeholder="Cari kegiatan, nomor surat, lokasi..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full"
                        />
                        <Button variant="secondary" disabled>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="p-4">
                        <TableShimmer columns={6} />
                    </div>
                ) : (
                    <TentatifTable
                        data={paginatedData}
                        activeTab={activeTab}
                        onEditKehadiran={handleEditKehadiran}
                        onJadikanDefinitif={(agenda) => {
                            setSelectedAgenda(agenda);
                            setDefinitifModalOpen(true);
                        }}
                        onViewDetail={(agenda) => {
                            setSelectedAgenda(agenda);
                            setShowDetailModal(true);
                        }}
                        onExportWhatsApp={handleExportWhatsApp}
                        onDelete={(agenda) => {
                            setSelectedAgenda(agenda);
                            setDeleteModalOpen(true);
                        }}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        search={search}
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

            {/* Edit Kehadiran Modal */}
            <TentatifEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                selectedAgenda={selectedAgenda}
                form={formWithSubmit}
                disposisiSelectOptions={disposisiSelectOptions}
            />

            {/* WhatsApp Export Modal */}
            <Modal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                title="Export WhatsApp"
                size="md"
            >
                <div className="space-y-4">
                    {isLoadingTemplate ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
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
                title="Detail Jadwal"
                size="lg"
            >
                {selectedAgenda && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Kolom Kiri - Informasi */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-text-primary mb-3">Informasi Surat</h4>
                                <div className="space-y-2 text-sm text-text-primary">
                                    <p>
                                        <span className="text-text-secondary">Nomor:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.nomor_surat}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Tanggal:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.tanggal_surat_formatted}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Dari:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.asal_surat}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Perihal:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.perihal}</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-text-primary mb-3">Detail Jadwal</h4>
                                <div className="space-y-2 text-sm text-text-primary">
                                    <p>
                                        <span className="text-text-secondary">Kegiatan:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.nama_kegiatan}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Tanggal:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.tanggal_format_indonesia}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Waktu:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.waktu_lengkap} WIB</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Lokasi:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.tempat}</span>
                                    </p>
                                    {selectedAgenda.keterangan && (
                                        <p>
                                            <span className="text-text-secondary">Keterangan:</span>{' '}
                                            <span className="font-medium">{selectedAgenda.keterangan}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-text-primary mb-3">Status</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-secondary">Status Jadwal:</span>
                                        <Badge variant="warning">{selectedAgenda.status_label}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-secondary">Disposisi:</span>
                                        {renderDisposisiBadge(selectedAgenda.status_disposisi)}
                                    </div>
                                    {selectedAgenda.dihadiri_oleh && (
                                        <p className="text-sm text-text-primary">
                                            <span className="text-text-secondary">Dihadiri:</span>{' '}
                                            <span className="font-medium">{selectedAgenda.dihadiri_oleh}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan - Preview PDF */}
                        <div className="bg-surface-hover rounded-lg p-4 border border-border-default">
                            <h4 className="font-medium text-text-primary mb-4">Preview Surat</h4>
                            {selectedAgenda.surat_masuk?.file_url ? (
                                <iframe
                                    src={selectedAgenda.surat_masuk.file_url}
                                    className="w-full h-[500px] border border-border-default rounded"
                                    title="Preview Surat"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-[500px] bg-surface rounded">
                                    <p className="text-text-secondary">File surat tidak tersedia</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Definitif Confirmation */}
            <ConfirmDialog
                isOpen={definitifModalOpen}
                onClose={() => setDefinitifModalOpen(false)}
                onConfirm={handleJadikanDefinitif}
                type="warning"
                title="Jadikan Definitif"
                message={
                    <p>
                        Apakah Anda yakin ingin menjadikan jadwal{' '}
                        <strong>{selectedAgenda?.nama_kegiatan}</strong> sebagai definitif?
                        Jadwal akan dipindahkan ke menu Definitif.
                    </p>
                }
                confirmText="Ya, Jadikan Definitif"
                isLoading={isUpdatingDefinitif}
            />

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
        </>
    );
};

TentatifIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default TentatifIndex;
