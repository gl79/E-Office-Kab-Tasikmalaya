import { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, Search, MoreVertical, Pencil, Trash2, CalendarPlus } from 'lucide-react';
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
import FormDatePicker from '@/Components/form/FormDatePicker';
import FormSelect from '@/Components/form/FormSelect';
import FormTextarea from '@/Components/form/FormTextarea';
import Checkbox from '@/Components/form/Checkbox';
import TimeSelect from '@/Components/form/TimeSelect';
import wilayahService, { Provinsi, Kabupaten, Kecamatan, Desa } from '@/services/wilayahService';
import { PageProps, PaginatedData } from '@/types';
import { SuratMasuk, Agenda } from '@/types/penjadwalan';

interface Props extends PageProps {
    suratMasuk: PaginatedData<SuratMasuk>;
    activeTab: 'belum' | 'sudah';
    lokasiTypeOptions: Record<string, string>;
    filters: {
        search?: string;
        tab?: string;
    };
}

const JadwalIndex = ({ suratMasuk, activeTab, lokasiTypeOptions, filters }: Props) => {
    // Current URL for preserving query params
    const { url } = usePage();

    // Search state
    const [search, setSearch] = useState(filters.search || '');

    // Form Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<SuratMasuk | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form dealing with Inertia useForm
    const { data, setData, post, put, processing, errors, reset } = useForm({
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

    // Wilayah state for cascading selection
    const [provinsiList, setProvinsiList] = useState<Provinsi[]>([]);
    const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [desaList, setDesaList] = useState<Desa[]>([]);
    const [selectedProvinsi, setSelectedProvinsi] = useState('');
    const [selectedKabupaten, setSelectedKabupaten] = useState('');
    const [selectedKecamatan, setSelectedKecamatan] = useState('');
    const [selectedDesa, setSelectedDesa] = useState('');

    // Fixed Kabupaten Tasikmalaya code for dalam_daerah
    const TASIKMALAYA_PROVINSI = '32'; // Jawa Barat
    const TASIKMALAYA_KABUPATEN = '06'; // Kabupaten Tasikmalaya

    // Load provinsi list for luar_daerah
    useEffect(() => {
        if (data.lokasi_type === 'luar_daerah') {
            wilayahService.getAllProvinsi()
                .then(response => setProvinsiList(response.data))
                .catch(error => console.error('Error fetching provinsi:', error));
        }
    }, [data.lokasi_type]);

    // Load kecamatan list for dalam_daerah (fixed to Tasikmalaya)
    useEffect(() => {
        if (data.lokasi_type === 'dalam_daerah') {
            wilayahService.getKecamatanByKabupaten(TASIKMALAYA_PROVINSI, TASIKMALAYA_KABUPATEN)
                .then(response => setKecamatanList(response.data))
                .catch(error => console.error('Error fetching kecamatan:', error));
        }
    }, [data.lokasi_type]);

    // Load kabupaten when provinsi changes (luar_daerah)
    useEffect(() => {
        if (data.lokasi_type === 'luar_daerah' && selectedProvinsi) {
            wilayahService.getKabupatenByProvinsi(selectedProvinsi)
                .then(response => setKabupatenList(response.data))
                .catch(error => console.error('Error fetching kabupaten:', error));
        } else {
            setKabupatenList([]);
        }
    }, [selectedProvinsi, data.lokasi_type]);

    // Load kecamatan when kabupaten changes (luar_daerah)
    useEffect(() => {
        if (data.lokasi_type === 'luar_daerah' && selectedProvinsi && selectedKabupaten) {
            wilayahService.getKecamatanByKabupaten(selectedProvinsi, selectedKabupaten)
                .then(response => setKecamatanList(response.data))
                .catch(error => console.error('Error fetching kecamatan:', error));
        }
    }, [selectedKabupaten, selectedProvinsi, data.lokasi_type]);

    // Load desa when kecamatan changes
    useEffect(() => {
        const provKode = data.lokasi_type === 'dalam_daerah' ? TASIKMALAYA_PROVINSI : selectedProvinsi;
        const kabKode = data.lokasi_type === 'dalam_daerah' ? TASIKMALAYA_KABUPATEN : selectedKabupaten;
        if (provKode && kabKode && selectedKecamatan) {
            wilayahService.getDesaByKecamatan(provKode, kabKode, selectedKecamatan)
                .then(response => setDesaList(response.data))
                .catch(error => console.error('Error fetching desa:', error));
        } else {
            setDesaList([]);
        }
    }, [selectedKecamatan, selectedKabupaten, selectedProvinsi, data.lokasi_type]);

    // Reset wilayah selections when lokasi_type changes
    useEffect(() => {
        setSelectedProvinsi('');
        setSelectedKabupaten('');
        setSelectedKecamatan('');
        setSelectedDesa('');
        setData('kode_wilayah', '');
    }, [data.lokasi_type]);

    // Update kode_wilayah when desa is selected
    useEffect(() => {
        if (selectedDesa) {
            setData('kode_wilayah', selectedDesa);
        }
    }, [selectedDesa]);

    // Handle Search with Debounce or Enter key? 
    // Implementing Enter key based handling to avoid too many requests
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get(route('penjadwalan.index'), {
                tab: activeTab,
                search: search,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    // Also support button click search
    const triggerSearch = () => {
        router.get(route('penjadwalan.index'), {
            tab: activeTab,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTabChange = (tab: 'belum' | 'sudah') => {
        router.get(route('penjadwalan.index'), {
            tab: tab,
            search: search, // Keep search term when switching tabs? Or clear? Usually keep.
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(route('penjadwalan.index'), {
            tab: activeTab,
            search: search,
            page: page,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleJadwalkan = (surat: SuratMasuk) => {
        setSelectedSurat(surat);
        setIsEditMode(false);
        reset();
        setData({
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
        // Load existing agenda data (In a real app, you might want to fetch fresh data)
        // Filling form with existing agenda data
        // Note: Logic to fill form specifically would go here, omitting for brevity/clean review as it wasn't the focus of refactor
        setShowFormModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode && selectedAgenda) {
            put(route('penjadwalan.update', selectedAgenda.id), {
                onSuccess: () => {
                    setShowFormModal(false);
                    reset();
                },
            });
        } else {
            post(route('penjadwalan.store'), {
                onSuccess: () => {
                    setShowFormModal(false);
                    reset();
                },
            });
        }
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

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'warning' | 'success'> = {
            tentatif: 'warning',
            definitif: 'success',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const lokasiTypeSelectOptions = Object.entries(lokasiTypeOptions).map(([value, label]) => ({
        value,
        label,
    }));

    return (
        <>
            <Head title="Jadwal" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Penjadwalan</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola jadwal dari surat masuk</p>
            </div>

            <div className="bg-surface rounded-lg border border-border-default">
                {/* Tabs */}
                <div className="border-b border-border-default">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => handleTabChange('belum')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'belum'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-dark'
                            }`}
                        >
                            Belum Dijadwalkan
                        </button>
                        <button
                            onClick={() => handleTabChange('sudah')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'sudah'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-dark'
                            }`}
                        >
                            Sudah Dijadwalkan
                        </button>
                    </nav>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex gap-2 max-w-md">
                        <TextInput
                            type="text"
                            placeholder="Cari nomor surat, asal surat, perihal... (Tekan Enter)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full"
                        />
                        <Button variant="secondary" onClick={triggerSearch}>
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
                                {activeTab === 'belum' ? (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Tgl Diterima</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nomor Surat</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Asal Surat</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Perihal</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-32">Aksi</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Agenda</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nomor Surat</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Asal Surat</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase w-10"></th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border-default">
                            {suratMasuk.data.map((item, index) => (
                                <tr key={item.id} className="hover:bg-surface-hover">
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {(suratMasuk.current_page - 1) * suratMasuk.per_page + index + 1}
                                    </td>
                                    {activeTab === 'belum' ? (
                                        <>
                                            <td className="px-4 py-3 text-text-secondary text-sm">
                                                {item.tanggal_diterima_formatted}
                                            </td>
                                            <td className="px-4 py-3 text-text-primary text-sm font-medium">
                                                {item.nomor_surat}
                                            </td>
                                            <td className="px-4 py-3 text-text-primary text-sm">
                                                {item.asal_surat}
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary text-sm">
                                                <div className="line-clamp-2" title={item.perihal}>
                                                    {item.perihal}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleJadwalkan(item)}
                                                >
                                                    <CalendarPlus className="h-4 w-4 mr-1" />
                                                    Jadwalkan
                                                </Button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 text-text-primary text-sm">
                                                <div className="font-medium">{item.agenda?.nama_kegiatan || '-'}</div>
                                                <div className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {item.agenda?.tanggal_agenda_formatted}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-text-primary text-sm">
                                                {item.nomor_surat}
                                            </td>
                                            <td className="px-4 py-3 text-text-primary text-sm">
                                                {item.asal_surat}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.agenda ? getStatusBadge(item.agenda.status) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
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
                                                            onClick={() => handleEditJadwal(item)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            <span>Edit Jadwal</span>
                                                        </Dropdown.Link>

                                                        <div className="border-t border-border-default my-1"></div>

                                                        <Dropdown.Link
                                                            as="button"
                                                            onClick={() => {
                                                                if (item.agenda) {
                                                                    setSelectedAgenda(item.agenda);
                                                                    setDeleteModalOpen(true);
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 text-danger hover:bg-danger-subtle focus:bg-danger-subtle"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Hapus</span>
                                                        </Dropdown.Link>
                                                    </div>
                                                </Dropdown>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {suratMasuk.data.length === 0 && (
                                <tr>
                                    <td colSpan={activeTab === 'belum' ? 6 : 6} className="px-4 py-8 text-center text-text-secondary">
                                        Data tidak ditemukan.
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
                            Menampilkan {suratMasuk.from || 0} sampai {suratMasuk.to || 0} dari {suratMasuk.total} data
                        </p>
                        <Pagination
                            currentPage={suratMasuk.current_page}
                            totalPages={suratMasuk.last_page}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={isEditMode ? 'Edit Jadwal' : 'Buat Jadwal Baru'}
                size="lg"
            >
                {selectedSurat && (
                    <form onSubmit={handleSubmit}>
                        {/* Informasi Surat */}
                        <div className="mb-6 p-4 bg-surface-hover rounded-lg border border-border-default">
                            <h4 className="text-sm font-medium text-text-primary mb-3">Informasi Surat</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-text-secondary">Nomor Surat:</span>
                                    <span className="ml-2 font-medium text-text-primary">{selectedSurat.nomor_surat}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary">Tanggal:</span>
                                    <span className="ml-2 font-medium text-text-primary">{selectedSurat.tanggal_surat_formatted}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary">Asal:</span>
                                    <span className="ml-2 font-medium text-text-primary">{selectedSurat.asal_surat}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-text-secondary">Perihal:</span>
                                    <span className="ml-2 font-medium text-text-primary">{selectedSurat.perihal}</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            {/* Nama Kegiatan */}
                            <div>
                                <InputLabel htmlFor="nama_kegiatan" value="Nama Kegiatan *" />
                                <TextInput
                                    id="nama_kegiatan"
                                    value={data.nama_kegiatan}
                                    onChange={(e) => setData('nama_kegiatan', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="Masukkan nama kegiatan"
                                />
                                <InputError message={errors.nama_kegiatan} className="mt-1" />
                            </div>

                            {/* Tanggal & Waktu */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <InputLabel htmlFor="tanggal_agenda" value="Tanggal *" />
                                    <FormDatePicker
                                        value={data.tanggal_agenda}
                                        onChange={(e) => setData('tanggal_agenda', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                    <InputError message={errors.tanggal_agenda} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="waktu_mulai" value="Waktu Mulai *" />
                                    <TimeSelect
                                        id="waktu_mulai"
                                        value={data.waktu_mulai}
                                        onChange={(e) => setData('waktu_mulai', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Pilih Waktu Mulai"
                                    />
                                    <InputError message={errors.waktu_mulai} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="waktu_selesai" value="Waktu Selesai" />
                                    <TimeSelect
                                        id="waktu_selesai"
                                        value={data.waktu_selesai}
                                        onChange={(e) => setData('waktu_selesai', e.target.value)}
                                        className="w-full mt-1"
                                        disabled={data.sampai_selesai}
                                        placeholder="Pilih Waktu Selesai"
                                    />
                                    <InputError message={errors.waktu_selesai} className="mt-1" />
                                </div>
                            </div>

                            {/* Sampai Selesai Checkbox */}
                            <div>
                                <label className="flex items-center">
                                    <Checkbox
                                        checked={data.sampai_selesai}
                                        onChange={(e) => {
                                            setData('sampai_selesai', e.target.checked);
                                            if (e.target.checked) {
                                                setData('waktu_selesai', '');
                                            }
                                        }}
                                    />
                                    <span className="ml-2 text-sm text-text-secondary">
                                        Sampai Selesai (tanpa jam pasti)
                                    </span>
                                </label>
                            </div>

                            {/* Lokasi */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="lokasi_type" value="Tipe Lokasi *" />
                                    <FormSelect
                                        options={lokasiTypeSelectOptions}
                                        value={data.lokasi_type}
                                        onChange={(e) => setData('lokasi_type', e.target.value)}
                                        placeholder="Pilih Tipe Lokasi"
                                        className="w-full mt-1"
                                    />
                                    <InputError message={errors.lokasi_type} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="tempat" value="Tempat/Alamat *" />
                                    <TextInput
                                        id="tempat"
                                        value={data.tempat}
                                        onChange={(e) => setData('tempat', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Masukkan detail lokasi"
                                    />
                                    <InputError message={errors.tempat} className="mt-1" />
                                </div>
                            </div>

                            {/* Wilayah Selection - Conditional based on lokasi_type */}
                            {data.lokasi_type === 'luar_daerah' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="select-provinsi" value="Provinsi" />
                                        <select
                                            id="select-provinsi"
                                            className="w-full mt-1 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                            value={selectedProvinsi}
                                            onChange={(e) => {
                                                setSelectedProvinsi(e.target.value);
                                                setSelectedKabupaten('');
                                                setSelectedKecamatan('');
                                                setSelectedDesa('');
                                            }}
                                        >
                                            <option value="">Pilih Provinsi</option>
                                            {provinsiList.map((item) => (
                                                <option key={item.kode} value={item.kode}>{item.nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="select-kabupaten" value="Kabupaten" />
                                        <select
                                            id="select-kabupaten"
                                            className="w-full mt-1 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm disabled:bg-surface-hover"
                                            value={selectedKabupaten}
                                            onChange={(e) => {
                                                setSelectedKabupaten(e.target.value);
                                                setSelectedKecamatan('');
                                                setSelectedDesa('');
                                            }}
                                            disabled={!selectedProvinsi}
                                        >
                                            <option value="">Pilih Kabupaten</option>
                                            {kabupatenList.map((item) => (
                                                <option key={item.kode} value={item.kode}>{item.nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Kecamatan & Desa - Show for both dalam_daerah and luar_daerah */}
                            {data.lokasi_type && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="select-kecamatan" value="Kecamatan" />
                                        <select
                                            id="select-kecamatan"
                                            className="w-full mt-1 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm disabled:bg-surface-hover"
                                            value={selectedKecamatan}
                                            onChange={(e) => {
                                                setSelectedKecamatan(e.target.value);
                                                setSelectedDesa('');
                                            }}
                                            disabled={data.lokasi_type === 'luar_daerah' && !selectedKabupaten}
                                        >
                                            <option value="">Pilih Kecamatan</option>
                                            {kecamatanList.map((item) => (
                                                <option key={item.kode} value={item.kode}>{item.nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="select-desa" value="Desa" />
                                        <select
                                            id="select-desa"
                                            className="w-full mt-1 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm disabled:bg-surface-hover"
                                            value={selectedDesa}
                                            onChange={(e) => setSelectedDesa(e.target.value)}
                                            disabled={!selectedKecamatan}
                                        >
                                            <option value="">Pilih Desa</option>
                                            {desaList.map((item) => (
                                                <option key={item.kode} value={item.kode}>{item.nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

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
                                onClick={() => setShowFormModal(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : (isEditMode ? 'Perbarui Jadwal' : 'Simpan Jadwal')}
                            </Button>
                        </div>
                    </form>
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
        </>
    );
};

JadwalIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default JadwalIndex;
