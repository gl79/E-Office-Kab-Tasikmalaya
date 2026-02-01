import { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, Eye, Printer, Filter, MoreVertical } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import Table, { TableHeader } from '@/Components/ui/Table';
import Dropdown from '@/Components/ui/Dropdown';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import Badge from '@/Components/ui/Badge';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import TextInput from '@/Components/form/TextInput';
import FormDatePicker from '@/Components/form/FormDatePicker';
import type { PageProps } from '@/types';

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
    file_path: string | null;
    indeks?: { kode: string; nama: string } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    unit_kerja?: { nama: string; singkatan: string } | null;
    [key: string]: unknown;
}

interface Props extends PageProps {
    suratKeluar: SuratKeluar[];
    sifat1Options: Record<string, string>;
}

export default function Index({ suratKeluar: initialSuratKeluar, sifat1Options }: Props) {
    // Local state for real-time updates
    const [suratKeluar, setSuratKeluar] = useState(initialSuratKeluar);

    // Client-side Search & Pagination
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 10;

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<SuratKeluar | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailSurat, setDetailSurat] = useState<SuratKeluar | null>(null);

    // Filter data client-side
    const filteredData = useMemo(() => {
        let data = suratKeluar;

        // Search filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(item =>
                item.nomor_surat?.toLowerCase().includes(lowerSearch) ||
                item.kepada?.toLowerCase().includes(lowerSearch) ||
                item.perihal?.toLowerCase().includes(lowerSearch) ||
                item.no_urut?.toLowerCase().includes(lowerSearch)
            );
        }

        // Date range filter
        if (startDate) {
            data = data.filter(item => item.tanggal_surat >= startDate);
        }
        if (endDate) {
            data = data.filter(item => item.tanggal_surat <= endDate);
        }

        return data;
    }, [suratKeluar, search, startDate, endDate]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset page on search
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
                // Remove item from local state for real-time update
                setSuratKeluar(prev => prev.filter(item => item.id !== itemToDelete.id));
            },
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                setSelectedSurat(null);
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

    const tableHeaders: TableHeader<SuratKeluar>[] = [
        {
            key: 'no',
            label: 'No',
            className: 'w-12',
            render: (_: unknown, __: unknown, index: number) =>
                ((currentPage - 1) * itemsPerPage + index + 1).toString(),
        },
        { key: 'no_urut', label: 'Agenda' },
        {
            key: 'tanggal_surat',
            label: 'Tgl Surat',
            render: (value: unknown) => formatDate(value as string),
        },
        { key: 'nomor_surat', label: 'Nomor Surat' },
        { key: 'kepada', label: 'Kepada' },
        {
            key: 'sifat_1',
            label: 'Sifat',
            className: 'w-32',
            render: (value: unknown) => (
                <div className="flex">
                    <Badge variant="info" className="justify-center min-w-[80px]">
                        {sifat1Options[value as string] || (value as string)}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'actions',
            label: '',
            className: 'w-10 relative',
            render: (_: unknown, item: SuratKeluar) => (
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
                                href={route('persuratan.surat-keluar.edit', item.id)}
                                className="flex items-center gap-2"
                            >
                                <Pencil className="h-4 w-4" />
                                <span>Edit</span>
                            </Dropdown.Link>
                            
                            <Dropdown.Link
                                as="button"
                                onClick={() => window.open(route('persuratan.surat-keluar.cetak-kartu', item.id), '_blank')}
                                className="flex items-center gap-2"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Cetak Kartu</span>
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
            <Head title="Surat Keluar" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <h1 className="text-2xl font-semibold text-gray-900">Surat Keluar</h1>
                            <Link href={route('persuratan.surat-keluar.create')}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Surat Keluar
                                </Button>
                            </Link>
                        </div>

                        <div className="mb-6 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex gap-2 flex-1">
                                    <TextInput
                                        type="text"
                                        placeholder="Cari nomor surat, kepada, perihal..."
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
                                <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                </div>
                            )}
                        </div>

                        <div className="rounded-md border overflow-x-auto">
                            <Table<SuratKeluar>
                                headers={tableHeaders}
                                data={paginatedData}
                                keyExtractor={(item) => item.id}
                                emptyMessage={search ? "Tidak ada surat keluar yang cocok dengan pencarian." : "Tidak ada data surat keluar."}
                            />
                        </div>

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

            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                type="delete"
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
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Nomor Surat</p>
                                <p className="font-medium">{detailSurat.nomor_surat}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tanggal Surat</p>
                                <p className="font-medium">{formatDate(detailSurat.tanggal_surat)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">No Urut/Agenda</p>
                                <p className="font-medium">{detailSurat.no_urut}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Kepada</p>
                                <p className="font-medium">{detailSurat.kepada}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-gray-500">Perihal</p>
                                <p className="font-medium">{detailSurat.perihal}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-gray-500">Isi Ringkas</p>
                                <p className="font-medium">{detailSurat.isi_ringkas || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Sifat</p>
                                <Badge variant="info">{sifat1Options[detailSurat.sifat_1] || detailSurat.sifat_1}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Lampiran</p>
                                <p className="font-medium">{detailSurat.lampiran || 0} berkas</p>
                            </div>
                            {detailSurat.indeks && (
                                <div>
                                    <p className="text-sm text-gray-500">Indeks</p>
                                    <p className="font-medium">{detailSurat.indeks.kode} - {detailSurat.indeks.nama}</p>
                                </div>
                            )}
                            {detailSurat.unit_kerja && (
                                <div>
                                    <p className="text-sm text-gray-500">Unit Kerja</p>
                                    <p className="font-medium">{detailSurat.unit_kerja.nama}</p>
                                </div>
                            )}
                            {detailSurat.catatan && (
                                <div className="sm:col-span-2">
                                    <p className="text-sm text-gray-500">Catatan</p>
                                    <p className="font-medium">{detailSurat.catatan}</p>
                                </div>
                            )}
                        </div>
                        {detailSurat.file_path && (
                            <div className="pt-4 border-t">
                                <a
                                    href={route('persuratan.surat-keluar.download', detailSurat.id)}
                                    className="text-indigo-600 hover:text-indigo-800"
                                >
                                    Download File Surat
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
