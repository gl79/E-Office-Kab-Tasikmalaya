import { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, Eye, Printer, FileText, Filter, MoreVertical } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import Table, { TableHeader } from '@/Components/ui/Table';
import Dropdown from '@/Components/ui/Dropdown';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import Badge from '@/Components/ui/Badge';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import TextInput from '@/Components/form/TextInput';
import FormSelect from '@/Components/form/FormSelect';
import FormDatePicker from '@/Components/form/FormDatePicker';
import type { PageProps } from '@/types';

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
    [key: string]: unknown;
}

interface Props extends PageProps {
    suratMasuk: SuratMasuk[];
    sifatOptions: Record<string, string>;
}

export default function Index({ suratMasuk: initialSuratMasuk, sifatOptions }: Props) {
    // Local state for real-time updates
    const [suratMasuk, setSuratMasuk] = useState(initialSuratMasuk);

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
                // Remove item from local state for real-time update
                setSuratMasuk(prev => prev.filter(item => item.id !== itemToDelete.id));
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

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getSifatBadge = (sifatValue: string) => {
        const variants: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
            biasa: 'default',
            penting: 'info',
            segera: 'warning',
            amat_segera: 'danger',
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

    const tableHeaders: TableHeader<SuratMasuk>[] = [
        {
            key: 'no',
            label: 'No',
            className: 'w-12',
            render: (_: unknown, __: unknown, index: number) =>
                ((currentPage - 1) * itemsPerPage + index + 1).toString(),
        },
        { key: 'nomor_agenda', label: 'No. Agenda' },
        {
            key: 'tanggal_diterima',
            label: 'Tgl Diterima',
            render: (value: unknown) => formatDate(value as string),
        },
        {
            key: 'nomor_surat',
            label: 'Nomor / Tgl Surat',
            render: (_: unknown, item: SuratMasuk) => (
                <div>
                    <div className="font-medium">{item.nomor_surat}</div>
                    <div className="text-sm text-gray-500">{formatDate(item.tanggal_surat)}</div>
                </div>
            ),
        },
        { key: 'asal_surat', label: 'Asal Surat' },
        {
            key: 'sifat',
            label: 'Sifat',
            className: 'w-32',
            render: (value: unknown) => (
                <div className="flex">
                    {getSifatBadge(value as string)}
                </div>
            ),
        },
        {
            key: 'actions',
            label: '',
            className: 'w-10 relative',
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
                            
                            <div className="border-t border-gray-100 my-1"></div>
                            
                            <Dropdown.Link
                                as="button"
                                onClick={() => {
                                    setSelectedSurat(item);
                                    setDeleteModalOpen(true);
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
            <Head title="Surat Masuk" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <h1 className="text-2xl font-semibold text-gray-900">Surat Masuk</h1>
                            <Link href={route('persuratan.surat-masuk.create')}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Surat Masuk
                                </Button>
                            </Link>
                        </div>

                        {/* Search & Filter */}
                        <div className="mb-6 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex gap-2 flex-1">
                                    <TextInput
                                        type="text"
                                        placeholder="Cari nomor agenda, nomor surat, asal surat, perihal..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        className="w-full"
                                    />
                                    <Button variant="secondary" disabled>
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </div>

                            {showFilters && (
                                <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Mulai
                                        </label>
                                        <FormDatePicker
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Akhir
                                        </label>
                                        <FormDatePicker
                                            value={endDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sifat Surat
                                        </label>
                                        <FormSelect
                                            options={sifatSelectOptions}
                                            value={sifat}
                                            onChange={(e) => {
                                                setSifat(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            placeholder="Semua Sifat"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="rounded-md border overflow-x-auto">
                            <Table<SuratMasuk>
                                headers={tableHeaders}
                                data={paginatedData}
                                keyExtractor={(item) => item.id}
                                emptyMessage={search ? "Tidak ada surat masuk yang cocok dengan pencarian." : "Tidak ada data surat masuk."}
                            />
                        </div>

                        {/* Pagination */}
                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                type="delete"
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
                                <p className="text-sm text-gray-500">Nomor Agenda</p>
                                <p className="font-medium">{detailSurat.nomor_agenda}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tanggal Diterima</p>
                                <p className="font-medium">{formatDate(detailSurat.tanggal_diterima)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Nomor Surat</p>
                                <p className="font-medium">{detailSurat.nomor_surat}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tanggal Surat</p>
                                <p className="font-medium">{formatDate(detailSurat.tanggal_surat)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Asal Surat</p>
                                <p className="font-medium">{detailSurat.asal_surat}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Sifat</p>
                                {getSifatBadge(detailSurat.sifat)}
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-gray-500">Tujuan</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {detailSurat.tujuans?.map((t) => (
                                        <Badge key={t.id} variant="primary" size="sm">
                                            {t.tujuan}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-gray-500">Perihal</p>
                                <p className="font-medium">{detailSurat.perihal}</p>
                            </div>
                            {detailSurat.isi_ringkas && (
                                <div className="sm:col-span-2">
                                    <p className="text-sm text-gray-500">Isi Ringkas</p>
                                    <p className="font-medium">{detailSurat.isi_ringkas}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500">Lampiran</p>
                                <p className="font-medium">{detailSurat.lampiran || 0} berkas</p>
                            </div>
                        </div>
                        {detailSurat.file_path && (
                            <div className="pt-4 border-t">
                                <a
                                    href={route('persuratan.surat-masuk.cetak-isi', detailSurat.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800"
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
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Nomor Agenda:</span>
                                    <span className="ml-2 font-medium">{disposisiSurat.nomor_agenda}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Nomor Surat:</span>
                                    <span className="ml-2 font-medium">{disposisiSurat.nomor_surat}</span>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-gray-500">Perihal:</span>
                                    <span className="ml-2 font-medium">{disposisiSurat.perihal}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                Pilih Penanda Tangan:
                            </p>
                            <div className="space-y-2">
                                {penandaTanganOptions.map((option, index) => (
                                    <label
                                        key={index}
                                        className={`
                                            flex items-center p-3 rounded-lg border cursor-pointer
                                            ${selectedPenandaTangan === index
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="penanda_tangan"
                                            value={index}
                                            checked={selectedPenandaTangan === index}
                                            onChange={() => setSelectedPenandaTangan(index)}
                                            className="mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">{option.nama}</p>
                                            <p className="text-sm text-gray-500">{option.jabatan}</p>
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
        </AppLayout>
    );
}
