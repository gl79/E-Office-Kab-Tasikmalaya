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
    type = 'button',
    children,
    ...props
}: ButtonProps) {
    // Variant styles using color tokens
    const variantStyles: Record<ButtonVariant, string> = {
        primary: `
            bg-gradient-to-br from-primary to-primary-dark
            text-white
            shadow-md shadow-primary/20
            hover:shadow-lg hover:shadow-primary/30 hover:to-primary
            active:opacity-90 active:scale-[0.98]
            border border-transparent
        `,
        secondary: `
            bg-surface text-text-primary
            border border-border-default
            shadow-sm
            hover:bg-surface-hover hover:border-border-dark hover:shadow
            active:bg-border-light active:scale-[0.98]
        `,
        danger: `
            bg-gradient-to-br from-danger to-danger-dark
            text-white
            shadow-md shadow-danger/20
            hover:shadow-lg hover:shadow-danger/30 hover:to-danger
            active:opacity-90 active:scale-[0.98]
            border border-transparent
        `,
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, string> = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
    };

    // Base styles
    const baseStyles = `
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        cursor-pointer
    `;

    return (
        <button
            {...props}
            type={type}
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
