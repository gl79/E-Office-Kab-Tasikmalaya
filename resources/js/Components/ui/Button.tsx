import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    /** Button visual variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Button content */
    children: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Button Component
 * 
 * Reusable button dengan variants dan sizes.
 * Menggunakan color tokens dari theme.
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>Submit</Button>
 * <Button variant="danger" disabled>Delete</Button>
 * <Button variant="secondary" size="sm">Cancel</Button>
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    children,
    ...props
}: ButtonProps) {
    // Variant styles using color tokens
    const variantStyles: Record<ButtonVariant, string> = {
        primary: `
            bg-primary text-text-inverse
            hover:bg-primary-hover
            focus:ring-primary-light
        `,
        secondary: `
            bg-surface text-text-primary
            border border-border-default
            hover:bg-surface-hover
            focus:ring-primary-light
        `,
        danger: `
            bg-danger text-text-inverse
            hover:bg-danger-hover
            focus:ring-danger-light
        `,
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, string> = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    // Base styles
    const baseStyles = `
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    return (
        <button
            {...props}
            disabled={disabled}
            className={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${className}
            `.replace(/\s+/g, ' ').trim()}
        >
            {children}
        </button>
    );
}
