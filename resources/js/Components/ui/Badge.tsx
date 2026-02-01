import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
}

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}: BadgeProps) {
    const variantStyles: Record<BadgeVariant, string> = {
        default: 'bg-surface-hover text-text-secondary',
        primary: 'bg-primary-light text-primary-dark',
        success: 'bg-success-light text-secondary-dark',
        warning: 'bg-warning-light text-accent-dark',
        danger: 'bg-danger-light text-danger-dark',
        info: 'bg-primary-light text-primary',
    };

    const sizeStyles: Record<BadgeSize, string> = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    return (
        <span
            className={`
                inline-flex items-center font-medium rounded-full
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${className}
            `}
        >
            {children}
        </span>
    );
}
