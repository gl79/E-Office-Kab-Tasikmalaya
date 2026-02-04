import { ReactNode, useEffect, useCallback } from 'react';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Modal title (optional) */
    title?: string;
    /** Callback when modal should close */
    onClose: () => void;
    /** Modal content */
    children: ReactNode;
    /** Modal size */
    size?: ModalSize;
    /** Whether clicking outside closes the modal */
    closeOnClickOutside?: boolean;
    /** Whether pressing ESC closes the modal */
    closeOnEsc?: boolean;
}

/**
 * Modal Component
 * 
 * Generic modal dialog dengan title header.
 * Supports ESC key dan click outside to close.
 * 
 * @example
 * <Modal 
 *     isOpen={showModal} 
 *     title="Konfirmasi" 
 *     onClose={() => setShowModal(false)}
 * >
 *     <p>Apakah Anda yakin?</p>
 * </Modal>
 */
export default function Modal({
    isOpen,
    title,
    onClose,
    children,
    size = 'md',
    closeOnClickOutside = true,
    closeOnEsc = true,
}: ModalProps) {
    // Size styles
    const sizeStyles: Record<ModalSize, string> = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    };

    // Handle ESC key press
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEsc) {
            onClose();
        }
    }, [closeOnEsc, onClose]);

    // Handle backdrop click
    const handleBackdropClick = () => {
        if (closeOnClickOutside) {
            onClose();
        }
    };

    // Add/remove event listener for ESC key
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    // Don't render if not open
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-text-primary/50"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div 
                className={`
                    relative w-full mx-4
                    bg-surface rounded-lg shadow-xl
                    ${sizeStyles[size]}
                `}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
                        <h2 
                            id="modal-title"
                            className="text-lg font-semibold text-text-primary"
                        >
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                p-1 rounded-lg
                                text-text-secondary hover:text-text-primary
                                hover:bg-surface-hover
                                transition-colors
                            "
                            aria-label="Close modal"
                        >
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M6 18L18 6M6 6l12 12" 
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
