import { useState, useMemo, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Search, MoreVertical, Eye, Pencil, Trash2, CalendarPlus, X, MapPin, Clock } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import Table, { TableHeader } from '@/Components/ui/Table';
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
import type { PageProps } from '@/types';

interface SuratMasuk {
    id: string;
    nomor_agenda: string;
    nomor_surat: string;
    tanggal_surat: string;
    tanggal_surat_formatted: string;
    tanggal_diterima: string;
    tanggal_diterima_formatted: string;
    asal_surat: string;
    perihal: string;
    sifat: string;
    sifat_label: string;
    file_path: string | null;
    file_url: string | null;
    tujuan_list: string[];
    agenda?: Agenda | null;
    [key: string]: unknown;
}

interface Agenda {
    id: string;
    nama_kegiatan: string;
    tanggal_agenda: string;
    tanggal_agenda_formatted: string;
    waktu_lengkap: string;
    tempat: string;
    status: string;
    status_label: string;
    status_disposisi: string;
    status_disposisi_label: string;
}

interface Props extends PageProps {
    belumDijadwalkan: SuratMasuk[];
    sudahDijadwalkan: SuratMasuk[];
    lokasiTypeOptions: Record<string, string>;
    filters: {
        search?: string;
    };
}

type TabType = 'belum' | 'sudah';

export default function JadwalIndex({ belumDijadwalkan, sudahDijadwalkan, lokasiTypeOptions, filters }: Props) {
    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('belum');

    // Search state
    const [search, setSearch] = useState(filters.search || '');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<SuratMasuk | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form
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

    // Filter data client-side
    const filteredBelum = useMemo(() => {
        if (!search) return belumDijadwalkan;
        const lowerSearch = search.toLowerCase();
        return belumDijadwalkan.filter(item =>
            item.nomor_surat?.toLowerCase().includes(lowerSearch) ||
            item.asal_surat?.toLowerCase().includes(lowerSearch) ||
            item.perihal?.toLowerCase().includes(lowerSearch)
        );
    }, [belumDijadwalkan, search]);

    const filteredSudah = useMemo(() => {
        if (!search) return sudahDijadwalkan;
        const lowerSearch = search.toLowerCase();
        return sudahDijadwalkan.filter(item =>
            item.nomor_surat?.toLowerCase().includes(lowerSearch) ||
            item.asal_surat?.toLowerCase().includes(lowerSearch) ||
            item.perihal?.toLowerCase().includes(lowerSearch) ||
            item.agenda?.nama_kegiatan?.toLowerCase().includes(lowerSearch)
        );
    }, [sudahDijadwalkan, search]);

    const currentData = activeTab === 'belum' ? filteredBelum : filteredSudah;

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
        // Load existing agenda data (would need to fetch full data in real implementation)
        setShowFormModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode && selectedAgenda) {
            put(route('penjadwalan.jadwal.update', selectedAgenda.id), {
                onSuccess: () => {
                    setShowFormModal(false);
                    reset();
                },
            });
        } else {
            post(route('penjadwalan.jadwal.store'), {
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
        router.delete(route('penjadwalan.jadwal.destroy', selectedAgenda.id), {
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

    // Table headers for "Belum Dijadwalkan"
    const belumHeaders: TableHeader<SuratMasuk>[] = [
        {
            key: 'no',
            label: 'No',
            className: 'w-12',
            render: (_: unknown, __: unknown, index: number) =>
                ((currentPage - 1) * itemsPerPage + index + 1).toString(),
        },
        {
            key: 'tanggal_diterima_formatted',
            label: 'Tgl Diterima',
        },
        {
            key: 'nomor_surat',
            label: 'Nomor Surat',
        },
        {
            key: 'asal_surat',
            label: 'Asal Surat',
        },
        {
            key: 'perihal',
            label: 'Perihal',
            render: (value: unknown) => (
                <span className="line-clamp-2">{value as string}</span>
            ),
        },
        {
            key: 'actions',
            label: '',
            className: 'w-32',
            render: (_: unknown, item: SuratMasuk) => (
                <Button
                    size="sm"
                    onClick={() => handleJadwalkan(item)}
                >
                    <CalendarPlus className="h-4 w-4 mr-1" />
                    Jadwalkan
                </Button>
            ),
        },
    ];

    // Table headers for "Sudah Dijadwalkan"
    const sudahHeaders: TableHeader<SuratMasuk>[] = [
        {
            key: 'no',
            label: 'No',
            className: 'w-12',
            render: (_: unknown, __: unknown, index: number) =>
                ((currentPage - 1) * itemsPerPage + index + 1).toString(),
        },
        {
            key: 'agenda.nama_kegiatan',
            label: 'Agenda',
            render: (_: unknown, item: SuratMasuk) => (
                <div>
                    <div className="font-medium">{item.agenda?.nama_kegiatan || '-'}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.agenda?.tanggal_agenda_formatted}
                    </div>
                </div>
            ),
        },
        {
            key: 'nomor_surat',
            label: 'Nomor Surat',
        },
        {
            key: 'asal_surat',
            label: 'Asal Surat',
        },
        {
            key: 'agenda.status',
            label: 'Status',
            render: (_: unknown, item: SuratMasuk) =>
                item.agenda ? getStatusBadge(item.agenda.status) : '-',
        },
        {
            key: 'actions',
            label: '',
            className: 'w-10',
            render: (_: unknown, item: SuratMasuk) => (
                <div className="flex justify-end">
                    <Dropdown
                        align="right"
                        width="48"
                        trigger={
                            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <MoreVertical className="h-5 w-5 text-gray-500" />
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

                            <div className="border-t border-gray-100 my-1"></div>

                            <Dropdown.Link
                                as="button"
                                onClick={() => {
                                    if (item.agenda) {
                                        setSelectedAgenda(item.agenda);
                                        setDeleteModalOpen(true);
                                    }
                                }}
                                className="flex items-center gap-2 text-red-600 hover:bg-red-50 focus:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus</span>
                            </Dropdown.Link>
                        </div>
                    </Dropdown>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Jadwal" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Penjadwalan</h1>
                <p className="text-text-secondary mt-1">Kelola jadwal dari surat masuk</p>
            </div>

            {/* Tabs */}
            <div className="bg-surface border border-border-default rounded-lg">
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
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                                {belumDijadwalkan.length}
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
                            Sudah Dijadwalkan
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                                {sudahDijadwalkan.length}
                            </span>
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Search */}
                    <div className="mb-6">
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
                    <div className="rounded-md border overflow-x-auto">
                        {activeTab === 'belum' ? (
                            <Table<SuratMasuk>
                                headers={belumHeaders}
                                data={paginatedData}
                                keyExtractor={(item) => item.id}
                                emptyMessage="Tidak ada surat masuk yang belum dijadwalkan."
                            />
                        ) : (
                            <Table<SuratMasuk>
                                headers={sudahHeaders}
                                data={paginatedData}
                                keyExtractor={(item) => item.id}
                                emptyMessage="Tidak ada jadwal."
                            />
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
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
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Informasi Surat</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Nomor Surat:</span>
                                    <span className="ml-2 font-medium">{selectedSurat.nomor_surat}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Tanggal:</span>
                                    <span className="ml-2 font-medium">{selectedSurat.tanggal_surat_formatted}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Asal:</span>
                                    <span className="ml-2 font-medium">{selectedSurat.asal_surat}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500">Perihal:</span>
                                    <span className="ml-2 font-medium">{selectedSurat.perihal}</span>
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
                                        id="tanggal_agenda"
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
                                    <span className="ml-2 text-sm text-gray-600">
                                        Sampai Selesai (tanpa jam pasti)
                                    </span>
                                </label>
                            </div>

                            {/* Lokasi */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="lokasi_type" value="Tipe Lokasi *" />
                                    <FormSelect
                                        id="lokasi_type"
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
                                            className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
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
                                            className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm disabled:bg-gray-100"
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
                                            className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm disabled:bg-gray-100"
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
                                            className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm disabled:bg-gray-100"
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
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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
                message={
                    <p>
                        Apakah Anda yakin ingin menghapus jadwal{' '}
                        <strong>{selectedAgenda?.nama_kegiatan}</strong>?
                        Data akan dipindahkan ke arsip.
                    </p>
                }
                isLoading={isDeleting}
            />
        </AppLayout>
    );
}
