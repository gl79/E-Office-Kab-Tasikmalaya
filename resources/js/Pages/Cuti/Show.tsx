import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, CheckCircle, XCircle, Ban } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import CutiStatusBadge from './Components/CutiStatusBadge';
import CutiConfirmDialog from './Components/CutiConfirmDialog';
import type { PageProps } from '@/types';
import type { CutiItem } from '@/types/cuti';

interface Props extends PageProps {
    cuti: CutiItem;
}

type CutiAction = 'cancel' | 'approve' | 'reject';

const Show = ({ cuti }: Props) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [action, setAction] = useState<CutiAction>('cancel');
    const [isProcessing, setIsProcessing] = useState(false);

    const openConfirm = (nextAction: CutiAction) => {
        setAction(nextAction);
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        setIsProcessing(true);

        if (action === 'cancel') {
            router.post(route('cuti.cancel', cuti.id), {}, {
                onFinish: () => {
                    setIsProcessing(false);
                    setConfirmOpen(false);
                },
            });
            return;
        }

        if (action === 'approve') {
            router.post(route('cuti.approve', cuti.id), {}, {
                onFinish: () => {
                    setIsProcessing(false);
                    setConfirmOpen(false);
                },
            });
            return;
        }

        router.post(route('cuti.reject', cuti.id), {}, {
            onFinish: () => {
                setIsProcessing(false);
                setConfirmOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Detail Cuti" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link href={route('cuti.index')}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-text-primary">Detail Cuti</h1>
                        <p className="text-sm text-text-secondary mt-1">Informasi lengkap pengajuan cuti</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {cuti.is_pending && (
                        <Link href={route('cuti.edit', cuti.id)}>
                            <Button variant="secondary" className="gap-2">
                                <Pencil className="h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                    )}
                    {cuti.is_pending && (
                        <>
                            <Button variant="secondary" className="gap-2" onClick={() => openConfirm('approve')}>
                                <CheckCircle className="h-4 w-4 text-success" />
                                Setujui
                            </Button>
                            <Button variant="secondary" className="gap-2" onClick={() => openConfirm('reject')}>
                                <XCircle className="h-4 w-4 text-danger" />
                                Tolak
                            </Button>
                            <Button variant="secondary" className="gap-2" onClick={() => openConfirm('cancel')}>
                                <Ban className="h-4 w-4 text-warning" />
                                Batalkan
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-border-default rounded-lg p-5">
                        <h2 className="text-base font-semibold text-text-primary mb-4">Informasi Pegawai</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-text-secondary">Nama Pegawai</p>
                                <p className="font-medium text-text-primary">{cuti.pegawai?.name}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">NIP</p>
                                <p className="font-medium text-text-primary">{cuti.pegawai?.nip || '-'}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Jabatan</p>
                                <p className="font-medium text-text-primary">{cuti.pegawai?.jabatan || '-'}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Atasan</p>
                                <p className="font-medium text-text-primary">{cuti.atasan?.name || '-'}</p>
                                {cuti.atasan && (
                                    <p className="text-xs text-text-secondary mt-1">
                                        {cuti.atasan.nip || '-'} • {cuti.atasan.jabatan || '-'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-border-default rounded-lg p-5">
                        <h2 className="text-base font-semibold text-text-primary mb-4">Detail Cuti</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-text-secondary">Jenis Cuti</p>
                                <p className="font-medium text-text-primary">{cuti.jenis_cuti}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Lama Cuti</p>
                                <p className="font-medium text-text-primary">{cuti.lama_cuti} hari</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Tanggal Mulai</p>
                                <p className="font-medium text-text-primary">{cuti.tanggal_mulai_formatted}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Tanggal Selesai</p>
                                <p className="font-medium text-text-primary">{cuti.tanggal_selesai_formatted}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-text-secondary">Alamat Selama Cuti</p>
                                <p className="font-medium text-text-primary">{cuti.alamat_cuti}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-text-secondary">Alasan Cuti</p>
                                <p className="font-medium text-text-primary">{cuti.alasan_cuti}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-surface border border-border-default rounded-lg p-5">
                        <h2 className="text-base font-semibold text-text-primary mb-4">Status</h2>
                        <CutiStatusBadge status={cuti.status} />
                        <div className="mt-4 text-sm text-text-secondary">
                            <div>Tanggal Pengajuan: {cuti.created_at_formatted || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <CutiConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
                action={action}
                itemLabel={cuti.pegawai?.name}
                isLoading={isProcessing}
            />
        </>
    );
};

Show.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Show;
