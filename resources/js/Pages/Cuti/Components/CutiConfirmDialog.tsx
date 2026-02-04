import ConfirmDialog from '@/Components/ui/ConfirmDialog';

type CutiAction = 'cancel' | 'approve' | 'reject' | 'delete' | 'restore' | 'forceDelete';

interface CutiConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    action: CutiAction;
    itemLabel?: string;
    isLoading?: boolean;
}

const actionConfig: Record<CutiAction, {
    type: 'warning' | 'delete' | 'restore' | 'info';
    title: string;
    confirmText: string;
    message: (label?: string) => JSX.Element;
}> = {
    cancel: {
        type: 'warning',
        title: 'Batalkan Pengajuan',
        confirmText: 'Ya, Batalkan',
        message: (label) => (
            <p>
                Apakah Anda yakin ingin membatalkan pengajuan cuti
                {label ? ` untuk ${label}` : ''}? Status akan berubah menjadi <strong>Cancelled</strong>.
            </p>
        ),
    },
    approve: {
        type: 'info',
        title: 'Setujui Pengajuan',
        confirmText: 'Ya, Setujui',
        message: (label) => (
            <p>
                Apakah Anda yakin ingin menyetujui pengajuan cuti
                {label ? ` untuk ${label}` : ''}? Status akan berubah menjadi <strong>Approved</strong>.
            </p>
        ),
    },
    reject: {
        type: 'warning',
        title: 'Tolak Pengajuan',
        confirmText: 'Ya, Tolak',
        message: (label) => (
            <p>
                Apakah Anda yakin ingin menolak pengajuan cuti
                {label ? ` untuk ${label}` : ''}? Status akan berubah menjadi <strong>Rejected</strong>.
            </p>
        ),
    },
    delete: {
        type: 'delete',
        title: 'Hapus Pengajuan',
        confirmText: 'Ya, Hapus',
        message: (label) => (
            <p>
                Apakah Anda yakin ingin menghapus pengajuan cuti
                {label ? ` untuk ${label}` : ''}? Data akan dipindahkan ke arsip.
            </p>
        ),
    },
    restore: {
        type: 'restore',
        title: 'Pulihkan Pengajuan',
        confirmText: 'Ya, Pulihkan',
        message: (label) => (
            <p>
                Apakah Anda yakin ingin memulihkan pengajuan cuti
                {label ? ` untuk ${label}` : ''}? Data akan dikembalikan ke daftar utama.
            </p>
        ),
    },
    forceDelete: {
        type: 'delete',
        title: 'Hapus Permanen',
        confirmText: 'Ya, Hapus Permanen',
        message: (label) => (
            <div>
                <p className="mb-3">
                    Apakah Anda yakin ingin menghapus permanen pengajuan cuti
                    {label ? ` untuk ${label}` : ''}?
                </p>
                <p className="text-sm text-danger font-medium p-2 bg-danger-light rounded border border-danger-light">
                    Perhatian: Data yang dihapus permanen tidak dapat dipulihkan.
                </p>
            </div>
        ),
    },
};

export default function CutiConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    action,
    itemLabel,
    isLoading = false,
}: CutiConfirmDialogProps) {
    const config = actionConfig[action];

    return (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            type={config.type}
            title={config.title}
            message={config.message(itemLabel)}
            confirmText={config.confirmText}
            isLoading={isLoading}
        />
    );
}
