import { useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    CheckCircle,
    MessageCircle,
    Copy,
    Clock,
    MapPin,
    User,
    FileText
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import Dropdown from '@/Components/ui/Dropdown';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import Badge from '@/Components/ui/Badge';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import TextInput from '@/Components/form/TextInput';
import InputLabel from '@/Components/form/InputLabel';
import InputError from '@/Components/form/InputError';
import FormSelect from '@/Components/form/FormSelect';
import FormTextarea from '@/Components/form/FormTextarea';
import type { PageProps } from '@/types';

interface SuratMasuk {
    id: string;
    nomor_agenda: string;
    nomor_surat: string;
    tanggal_surat: string;
    tanggal_surat_formatted: string;
    asal_surat: string;
    perihal: string;
    file_url: string | null;
}

interface Agenda {
    id: string;
    surat_masuk: SuratMasuk;
    nama_kegiatan: string;
    tanggal_agenda: string;
    tanggal_agenda_formatted: string;
    tanggal_format_indonesia: string;
    hari: string;
    waktu_mulai: string;
    waktu_selesai: string | null;
    waktu_lengkap: string;
    lokasi_type: string;
    lokasi_type_label: string;
    tempat: string;
    status: string;
    status_label: string;
    status_disposisi: string;
    status_disposisi_label: string;
    dihadiri_oleh: string | null;
    keterangan: string | null;
    can_edit_kehadiran: boolean;
    created_by: {
        id: number;
        name: string;
    } | null;
    [key: string]: unknown;
}

interface Props extends PageProps {
    menungguPeninjauan: { data: Agenda[] };
    sudahDitinjau: { data: Agenda[] };
    disposisiOptions: Record<string, string>;
    filters: {
        search?: string;
    };
}

type TabType = 'menunggu' | 'sudah';

const TentatifIndex = ({
    menungguPeninjauan,
    sudahDitinjau,
    disposisiOptions,
    filters,
}: Props) => {
    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('menunggu');

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
    const { data, setData, put, processing, errors, reset } = useForm({
        dihadiri_oleh: '',
        status_disposisi: 'menunggu',
        keterangan: '',
    });

    // Extract data arrays
    const menungguData = menungguPeninjauan?.data || [];
    const sudahData = sudahDitinjau?.data || [];

    // Filter data client-side
    const filteredMenunggu = useMemo(() => {
        if (!search) return menungguData;
        const lowerSearch = search.toLowerCase();
        return menungguData.filter((item) =>
            item.nama_kegiatan?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.nomor_surat?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.asal_surat?.toLowerCase().includes(lowerSearch) ||
            item.tempat?.toLowerCase().includes(lowerSearch)
        );
    }, [menungguData, search]);

    const filteredSudah = useMemo(() => {
        if (!search) return sudahData;
        const lowerSearch = search.toLowerCase();
        return sudahData.filter((item) =>
            item.nama_kegiatan?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.nomor_surat?.toLowerCase().includes(lowerSearch) ||
            item.surat_masuk?.asal_surat?.toLowerCase().includes(lowerSearch) ||
            item.tempat?.toLowerCase().includes(lowerSearch) ||
            item.dihadiri_oleh?.toLowerCase().includes(lowerSearch)
        );
    }, [sudahData, search]);

    const currentData = activeTab === 'menunggu' ? filteredMenunggu : filteredSudah;

    // Pagination
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return currentData.slice(start, start + itemsPerPage);
    }, [currentData, currentPage]);

    const totalPages = Math.ceil(currentData.length / itemsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleEditKehadiran = (agenda: Agenda) => {
        setSelectedAgenda(agenda);
        setData({
            dihadiri_oleh: agenda.dihadiri_oleh || '',
            status_disposisi: agenda.status_disposisi || 'menunggu',
            keterangan: agenda.keterangan || '',
        });
        setShowEditModal(true);
    };

    const handleSubmitKehadiran = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgenda) return;

        put(route('penjadwalan.tentatif.update-kehadiran', selectedAgenda.id), {
            onSuccess: () => {
                setShowEditModal(false);
                reset();
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

    const handleViewDetail = (agenda: Agenda) => {
        setSelectedAgenda(agenda);
        setShowDetailModal(true);
    };

    const getDisposisiBadge = (status: string) => {
        const variants: Record<string, 'default' | 'warning' | 'success' | 'info'> = {
            menunggu: 'warning',
            bupati: 'info',
            wakil_bupati: 'success',
            diwakilkan: 'success',
        };
        const labels: Record<string, string> = {
            menunggu: 'Menunggu',
            bupati: 'Bupati',
            wakil_bupati: 'Wakil Bupati',
            diwakilkan: 'Diwakilkan',
        };
        return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
    };

    const disposisiSelectOptions = Object.entries(disposisiOptions).map(([value, label]) => ({
        value,
        label,
    }));

    return (
        <>
            <Head title="Jadwal Tentatif" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Jadwal Tentatif</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola jadwal yang masih dalam tahap konfirmasi</p>
            </div>

            <div className="bg-surface rounded-lg border border-border-default">
                {/* Tabs */}
                <div className="border-b border-border-default">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => handleTabChange('menunggu')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'menunggu'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-dark'
                            }`}
                        >
                            Menunggu Peninjauan
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                                {menungguData.length}
                            </span>
                        </button>
                        <button
                            onClick={() => handleTabChange('sudah')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'sudah'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-dark'
                            }`}
                        >
                            Sudah Ditinjau
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-success-subtle text-success">
                                {sudahData.length}
                            </span>
                        </button>
                    </nav>
                </div>

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
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-default">
                        <thead className="bg-surface-hover">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-12">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Tanggal/Waktu</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Kegiatan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Surat Undangan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Disposisi</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase w-48">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border-default">
                            {paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-surface-hover">
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-text-primary text-sm">{item.hari}</div>
                                        <div className="text-sm text-text-secondary">{item.tanggal_agenda_formatted}</div>
                                        <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                            <Clock className="h-3 w-3" />
                                            {item.waktu_lengkap}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="font-medium text-text-primary line-clamp-2">{item.nama_kegiatan}</div>
                                        <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span className="line-clamp-1">{item.tempat}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="font-medium text-text-primary">{item.surat_masuk?.nomor_surat || '-'}</div>
                                        <div className="text-text-secondary line-clamp-1">{item.surat_masuk?.asal_surat || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex flex-col gap-1 items-start">
                                            {getDisposisiBadge(item.status_disposisi)}
                                            {item.dihadiri_oleh && (
                                                <div className="text-xs text-text-secondary flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {item.dihadiri_oleh}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Atur Kehadiran button - shown for Menunggu Peninjauan tab */}
                                            {activeTab === 'menunggu' && item.can_edit_kehadiran && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleEditKehadiran(item)}
                                                >
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Atur Kehadiran
                                                </Button>
                                            )}
                                            
                                            {/* Jadikan Definitif button - shown for Sudah Ditinjau tab */}
                                            {activeTab === 'sudah' && item.status_disposisi !== 'menunggu' && (
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => {
                                                        setSelectedAgenda(item);
                                                        setDefinitifModalOpen(true);
                                                    }}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Definitif
                                                </Button>
                                            )}
                                            
                                            {/* Dropdown for other actions */}
                                            <Dropdown
                                                align="right"
                                                width="48"
                                                trigger={
                                                    <button className="p-1 hover:bg-surface-active rounded-full transition-colors text-text-secondary">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>
                                                }
                                            >
                                                <div className="py-1">
                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => handleViewDetail(item)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span>Lihat Detail</span>
                                                    </Dropdown.Link>

                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => handleExportWhatsApp(item)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span>Export WhatsApp</span>
                                                    </Dropdown.Link>

                                                    <div className="border-t border-border-default my-1"></div>

                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => {
                                                            setSelectedAgenda(item);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 text-danger hover:bg-danger-subtle focus:bg-danger-subtle"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span>Hapus</span>
                                                    </Dropdown.Link>
                                                </div>
                                            </Dropdown>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                                        {activeTab === 'menunggu' 
                                            ? (search ? 'Tidak ada data yang cocok.' : 'Tidak ada jadwal yang menunggu peninjauan.')
                                            : (search ? 'Tidak ada data yang cocok.' : 'Tidak ada jadwal yang sudah ditinjau.')
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border-default">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-text-secondary">
                            Menampilkan {paginatedData.length} dari {currentData.length} data
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

            {/* Edit Kehadiran Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Kehadiran"
                size="md"
            >
                {selectedAgenda && (
                    <form onSubmit={handleSubmitKehadiran}>
                        {/* Informasi Jadwal */}
                        <div className="mb-6 p-4 bg-surface-hover rounded-lg border border-border-default">
                            <h4 className="text-sm font-medium text-text-primary mb-3">Informasi Jadwal</h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-text-secondary">Kegiatan:</span>
                                    <span className="ml-2 font-medium text-text-primary">{selectedAgenda.nama_kegiatan}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <span className="text-text-secondary">Tanggal:</span>
                                        <span className="ml-2 font-medium text-text-primary">{selectedAgenda.tanggal_format_indonesia}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-secondary">Waktu:</span>
                                        <span className="ml-2 font-medium text-text-primary">{selectedAgenda.waktu_lengkap}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-text-secondary">Tempat:</span>
                                    <span className="ml-2 font-medium text-text-primary">{selectedAgenda.tempat}</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            {/* Status Disposisi */}
                            <div>
                                <InputLabel htmlFor="status_disposisi" value="Status Disposisi *" />
                                <FormSelect
                                    id="status_disposisi"
                                    options={disposisiSelectOptions}
                                    value={data.status_disposisi}
                                    onChange={(e) => setData('status_disposisi', e.target.value)}
                                    className="w-full mt-1"
                                />
                                <InputError message={errors.status_disposisi} className="mt-1" />
                            </div>

                            {/* Dihadiri Oleh */}
                            <div>
                                <InputLabel htmlFor="dihadiri_oleh" value="Dihadiri Oleh" />
                                <TextInput
                                    id="dihadiri_oleh"
                                    value={data.dihadiri_oleh}
                                    onChange={(e) => setData('dihadiri_oleh', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="Nama yang menghadiri"
                                />
                                <InputError message={errors.dihadiri_oleh} className="mt-1" />
                            </div>

                            {/* Keterangan */}
                            <div>
                                <InputLabel htmlFor="keterangan" value="Keterangan" />
                                <FormTextarea
                                    id="keterangan"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    className="w-full mt-1"
                                    rows={3}
                                    placeholder="Keterangan tambahan (opsional)"
                                />
                                <InputError message={errors.keterangan} className="mt-1" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border-default">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowEditModal(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

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
                                        {getDisposisiBadge(selectedAgenda.status_disposisi)}
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
