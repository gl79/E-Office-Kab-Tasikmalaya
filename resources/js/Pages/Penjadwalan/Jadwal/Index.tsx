import { useState, useMemo } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Pagination, ConfirmDialog } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks/useDeferredData';
import JadwalTabNav from './Components/JadwalTabNav';
import JadwalTable from './Components/JadwalTable';
import JadwalFormModal from './Components/JadwalFormModal';
import type { PageProps } from '@/types';
import type { SuratMasuk, Agenda } from '@/types/penjadwalan';

interface Props extends PageProps {
    belumDijadwalkan?: { data: SuratMasuk[] };
    sudahDijadwalkan?: { data: SuratMasuk[] };
    activeTab: 'belum' | 'sudah';
    lokasiTypeOptions: Record<string, string>;
}

const JadwalIndex = ({ belumDijadwalkan, sudahDijadwalkan, activeTab: initialTab, lokasiTypeOptions }: Props) => {
    const { props: { auth } } = usePage<PageProps>();

    // Cache keys
    const belumCacheKey = `penjadwalan_jadwal_belum_${auth.user.id}`;
    const sudahCacheKey = `penjadwalan_jadwal_sudah_${auth.user.id}`;

    // Use Deferred Data Mutable Pattern
    const {
        data: belumDataRaw,
        isLoading: isBelumLoading
    } = useDeferredDataMutable<{ data: SuratMasuk[] }>(belumCacheKey, belumDijadwalkan);

    const {
        data: sudahDataRaw,
        isLoading: isSudahLoading
    } = useDeferredDataMutable<{ data: SuratMasuk[] }>(sudahCacheKey, sudahDijadwalkan);

    const belumData = belumDataRaw?.data || [];
    const sudahData = sudahDataRaw?.data || [];

    // Tab state (client-side)
    const [activeTab, setActiveTab] = useState<'belum' | 'sudah'>(initialTab);

    // Client-side search & pagination
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<SuratMasuk | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form dealing with Inertia useForm
    const form = useForm({
        surat_masuk_id: '',
        nama_kegiatan: '',
        tanggal_agenda: '',
        waktu_mulai: '',
        waktu_selesai: '',
        sampai_selesai: false,
        lokasi_type: '',
        kode_wilayah: '',
        tempat: '',
        keterangan: '',
    });

    // Get current data based on active tab
    const currentTabData = activeTab === 'belum' ? belumData : sudahData;
    const isLoading = activeTab === 'belum' ? isBelumLoading : isSudahLoading;

    // Client-side filtering
    const filteredData = useMemo(() => {
        if (!search) return currentTabData;
        const lowerSearch = search.toLowerCase();
        return currentTabData.filter(item =>
            item.nomor_surat?.toLowerCase().includes(lowerSearch) ||
            item.asal_surat?.toLowerCase().includes(lowerSearch) ||
            item.perihal?.toLowerCase().includes(lowerSearch) ||
            (activeTab === 'sudah' && item.agenda?.nama_kegiatan?.toLowerCase().includes(lowerSearch))
        );
    }, [currentTabData, search, activeTab]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleTabChange = (tab: 'belum' | 'sudah') => {
        setActiveTab(tab);
        setSearch('');
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleJadwalkan = (surat: SuratMasuk) => {
        setSelectedSurat(surat);
        setIsEditMode(false);
        form.reset();
        form.setData({
            surat_masuk_id: surat.id,
            nama_kegiatan: surat.perihal || '',
            tanggal_agenda: '',
            waktu_mulai: '',
            waktu_selesai: '',
            sampai_selesai: false,
            lokasi_type: '',
            kode_wilayah: '',
            tempat: '',
            keterangan: '',
        });
        setShowFormModal(true);
    };

    const handleEditJadwal = (surat: SuratMasuk) => {
        if (!surat.agenda) return;
        setSelectedSurat(surat);
        setIsEditMode(true);
        setSelectedAgenda(surat.agenda);

        // Populate form for edit
        form.setData({
            surat_masuk_id: surat.id,
            nama_kegiatan: surat.agenda.nama_kegiatan,
            tanggal_agenda: surat.agenda.tanggal_agenda,
            waktu_mulai: surat.agenda.waktu_mulai?.slice(0, 5) || '',
            waktu_selesai: surat.agenda.waktu_selesai?.slice(0, 5) || '',
            sampai_selesai: !surat.agenda.waktu_selesai,
            lokasi_type: surat.agenda.lokasi_type || '',
            kode_wilayah: surat.agenda.kode_wilayah || '',
            tempat: surat.agenda.tempat || '',
            keterangan: surat.agenda.keterangan || '',
        });

        setShowFormModal(true);
    };

    const handleDelete = () => {
        if (!selectedAgenda) return;
        setIsDeleting(true);
        router.delete(route('penjadwalan.destroy', selectedAgenda.id), {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                setSelectedAgenda(null);
            },
        });
    };

    // Transform options for select
    const lokasiOptionsArray = useMemo(() => {
        if (!lokasiTypeOptions) return [];
        return Object.entries(lokasiTypeOptions).map(([value, label]) => ({
            value,
            label,
        }));
    }, [lokasiTypeOptions]);

    // Custom submit handler for the modal
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode && selectedAgenda) {
            form.put(route('penjadwalan.update', selectedAgenda.id), {
                onSuccess: () => {
                    setShowFormModal(false);
                    form.reset();
                },
            });
        } else {
            form.post(route('penjadwalan.store'), {
                onSuccess: () => {
                    setShowFormModal(false);
                    form.reset();
                },
            });
        }
    };

    // Add submit handler to form object to be used by child
    const formWithSubmit = {
        ...form,
        submitHandler: handleFormSubmit
    };

    return (
        <>
            <Head title="Jadwal" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Penjadwalan</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola jadwal dari surat masuk</p>
            </div>

            <div className="bg-surface rounded-lg border border-border-default">
                {/* Tabs */}
                <JadwalTabNav
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    countBelum={belumData?.length || 0}
                    countSudah={sudahData?.length || 0}
                />

                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex gap-2 max-w-md">
                        <TextInput
                            type="text"
                            placeholder="Cari nomor surat, asal surat, perihal..."
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
                    <JadwalTable
                        data={paginatedData}
                        activeTab={activeTab}
                        onJadwalkan={handleJadwalkan}
                        onEditJadwal={handleEditJadwal}
                        onDeleteJadwal={(agenda) => {
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
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <JadwalFormModal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                isEditMode={isEditMode}
                selectedSurat={selectedSurat}
                form={formWithSubmit}
                lokasiTypeOptions={lokasiOptionsArray}
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

JadwalIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default JadwalIndex;
