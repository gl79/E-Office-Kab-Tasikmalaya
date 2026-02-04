import { ReactNode } from 'react';
import { AlertTriangle, Trash2, RotateCcw, Info } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

type DialogType = 'delete' | 'restore' | 'warning' | 'info';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: ReactNode;
    type?: DialogType;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'warning',
    confirmText,
    cancelText = 'Batal',
    isLoading = false,
}: ConfirmDialogProps) {
    const typeConfig: Record<DialogType, {
        icon: ReactNode;
        iconBg: string;
        confirmVariant: 'primary' | 'danger' | 'secondary';
        defaultTitle: string;
        defaultConfirmText: string;
    }> = {
        delete: {
            icon: <Trash2 className="w-6 h-6 text-danger" />,
            iconBg: 'bg-danger-light',
            confirmVariant: 'danger',
            defaultTitle: 'Hapus Data',
            defaultConfirmText: 'Hapus',
        },
        restore: {
            icon: <RotateCcw className="w-6 h-6 text-success" />,
            iconBg: 'bg-success-light',
            confirmVariant: 'primary',
            defaultTitle: 'Pulihkan Data',
            defaultConfirmText: 'Pulihkan',
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-warning" />,
            iconBg: 'bg-warning-light',
            confirmVariant: 'primary',
            defaultTitle: 'Konfirmasi',
            defaultConfirmText: 'Ya, Lanjutkan',
        },
        info: {
            icon: <Info className="w-6 h-6 text-primary" />,
            iconBg: 'bg-primary-light',
            confirmVariant: 'primary',
            defaultTitle: 'Informasi',
            defaultConfirmText: 'OK',
        },
    };

    const config = typeConfig[type];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            closeOnClickOutside={!isLoading}
            closeOnEsc={!isLoading}
        >
            <div className="text-center">
                {/* Icon */}
                <div className={`
                    w-12 h-12 mx-auto rounded-full
                    flex items-center justify-center
                    ${config.iconBg}
                `}>
                    {config.icon}
                </div>

                {/* Title */}
                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                    {title || config.defaultTitle}
                </h3>

                {/* Message */}
                <div className="mt-2 text-sm text-text-secondary">
                    {message}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3 justify-center">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={config.confirmVariant}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : (confirmText || config.defaultConfirmText)}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
