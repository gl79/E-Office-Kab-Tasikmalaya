import { useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, MoreVertical, Eye, Pencil, CheckCircle, XCircle, Ban, Trash2 } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Dropdown, Pagination } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import CutiStatusBadge from './Components/CutiStatusBadge';
import CutiConfirmDialog from './Components/CutiConfirmDialog';
import CutiTableShimmer from './Components/CutiTableShimmer';
import { useDeferredDataMutable } from '@/hooks';
import { useCutiFilters } from './hooks/useCutiFilters';
import type { PageProps } from '@/types';
import type { CutiItem, CutiStatus } from '@/types/cuti';

interface Props extends PageProps {
    cuti?: { data: CutiItem[] };
    statusOptions: Record<string, string>;
    filters: {
        search?: string;
        status?: string;
    };
}

type CutiAction = 'cancel' | 'approve' | 'reject' | 'delete';

const CutiIndex = ({ cuti, statusOptions, filters }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const cacheKey = `cuti_index_${auth.user.id}`;

    const {
        data: cutiRaw,
        isLoading,
        updateAndCache,
    } = useDeferredDataMutable<{ data: CutiItem[] }>(cacheKey, cuti);

    const cutiData = cutiRaw?.data || [];

    const {
        search,
        status,
        currentPage,
        itemsPerPage,
        filteredData,
        paginatedData,
        totalPages,
        setCurrentPage,
        setSearch,
        setStatus,
    } = useCutiFilters(cutiData, {
        initialSearch: filters.search,
        initialStatus: filters.status,
        itemsPerPage: 10,
    });

    const [selectedCuti, setSelectedCuti] = useState<CutiItem | null>(null);
    const [action, setAction] = useState<CutiAction>('cancel');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const statusSelectOptions = useMemo(() => {
        return [
            { value: '', label: 'Semua Status' },
            ...Object.entries(statusOptions).map(([value, label]) => ({
                value,
                label,
            })),
        ];
    }, [statusOptions]);

    const openConfirm = (nextAction: CutiAction, item: CutiItem) => {
        setSelectedCuti(item);
        setAction(nextAction);
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (!selectedCuti) return;
        setIsProcessing(true);

        const itemId = selectedCuti.id;
        const label = statusOptions;

        const onSuccess = (status?: CutiStatus) => {
            updateAndCache((prev) => {
                const next: { data: CutiItem[] } = {
                    ...prev,
                    data: prev.data.map((item) => {
                        if (item.id !== itemId) return item;
                        if (!status) return item;
                        return {
                            ...item,
                            status,
                            status_label: label[status] || status,
                            is_pending: status === 'pending',
                        };
                    }),
                };

                if (action === 'delete') {
                    next.data = next.data.filter((item) => item.id !== itemId);
                }

                return next;
            });
        };

        if (action === 'cancel') {
            router.post(route('cuti.cancel', itemId), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => onSuccess('cancelled'),
                onFinish: () => {
                    setIsProcessing(false);
                    setConfirmOpen(false);
                },
            });
            return;
        }

        if (action === 'approve') {
            router.post(route('cuti.approve', itemId), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => onSuccess('approved'),
                onFinish: () => {
                    setIsProcessing(false);
                    setConfirmOpen(false);
                },
            });
            return;
        }

        if (action === 'reject') {
            router.post(route('cuti.reject', itemId), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => onSuccess('rejected'),
                onFinish: () => {
                    setIsProcessing(false);
                    setConfirmOpen(false);
                },
            });
            return;
        }

        router.delete(route('cuti.destroy', itemId), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => onSuccess(),
            onFinish: () => {
                setIsProcessing(false);
                setConfirmOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Cuti" />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Cuti</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Kelola pengajuan cuti pegawai dan status persetujuan
                    </p>
                </div>
                <Link href={route('cuti.create')}>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Cuti
                    </Button>
                </Link>
            </div>

            <div className="bg-surface border border-border-default rounded-lg">
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                        <div className="flex gap-2 max-w-md flex-1">
                            <TextInput
                                type="text"
                                placeholder="Cari pegawai, atasan, jenis cuti..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                            <Button variant="secondary" disabled>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex gap-2 items-center">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="rounded-md border-border-default shadow-sm focus:border-primary focus:ring-primary text-sm"
                            >
                                {statusSelectOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <CutiTableShimmer columns={6} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border-default text-sm">
                            <thead className="bg-surface-hover">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-12">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Pegawai</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Atasan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Detail Cuti</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border-default">
                                {paginatedData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-surface-hover">
                                        <td className="px-4 py-3 text-text-secondary">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-text-primary">{item.pegawai?.name}</div>
                                            <div className="text-xs text-text-secondary">{item.pegawai?.nip || '-'}</div>
                                            <div className="text-xs text-text-muted">{item.pegawai?.jabatan || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.atasan ? (
                                                <>
                                                    <div className="font-medium text-text-primary">{item.atasan.name}</div>
                                                    <div className="text-xs text-text-secondary">{item.atasan.nip || '-'}</div>
                                                    <div className="text-xs text-text-muted">{item.atasan.jabatan || '-'}</div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-text-muted italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-text-primary">{item.jenis_cuti}</div>
                                            <div className="text-xs text-text-secondary mt-1">
                                                Lama: <span className="font-semibold">{item.lama_cuti}</span> hari
                                            </div>
                                            <div className="text-xs text-text-muted mt-1">
                                                {item.tanggal_range_formatted}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <CutiStatusBadge status={item.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
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
                                                    <Dropdown.Link href={route('cuti.show', item.id)} className="flex items-center gap-2">
                                                        <Eye className="h-4 w-4" />
                                                        Detail
                                                    </Dropdown.Link>
                                                    {item.is_pending && (
                                                        <Dropdown.Link href={route('cuti.edit', item.id)} className="flex items-center gap-2">
                                                            <Pencil className="h-4 w-4" />
                                                            Edit
                                                        </Dropdown.Link>
                                                    )}
                                                    {item.is_pending && (
                                                        <>
                                                            <Dropdown.Link
                                                                as="button"
                                                                onClick={() => openConfirm('approve', item)}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <CheckCircle className="h-4 w-4 text-success" />
                                                                Setujui
                                                            </Dropdown.Link>
                                                            <Dropdown.Link
                                                                as="button"
                                                                onClick={() => openConfirm('reject', item)}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <XCircle className="h-4 w-4 text-danger" />
                                                                Tolak
                                                            </Dropdown.Link>
                                                            <Dropdown.Link
                                                                as="button"
                                                                onClick={() => openConfirm('cancel', item)}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Ban className="h-4 w-4 text-warning" />
                                                                Batalkan
                                                            </Dropdown.Link>
                                                        </>
                                                    )}
                                                    <Dropdown.Link
                                                        as="button"
                                                        onClick={() => openConfirm('delete', item)}
                                                        className="flex items-center gap-2 text-danger hover:bg-danger-light"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Hapus
                                                    </Dropdown.Link>
                                                </div>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                                            {search || status
                                                ? 'Tidak ada data yang cocok dengan filter.'
                                                : 'Belum ada data cuti.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

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

            <CutiConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
                action={action}
                itemLabel={selectedCuti?.pegawai?.name}
                isLoading={isProcessing}
            />
        </>
    );
};

CutiIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default CutiIndex;
