/**
 * E-Office Color Tokens
 * 
 * TypeScript representation of the design tokens.
 * These values mirror the CSS variables in app.css.
 * Use for programmatic access or when CSS variables are not available.
 * 
 * IMPORTANT: When changing colors, update BOTH this file AND app.css
 */

export const colors = {
    /** Primary - Blue: buttons, links, active states */
    primary: {
        DEFAULT: '#2563eb',
        hover: '#1d4ed8',
        light: '#dbeafe',
        dark: '#1e40af',
    },

    /** Secondary - Green: success states, confirmations */
    secondary: {
        DEFAULT: '#16a34a',
        hover: '#15803d',
        light: '#dcfce7',
        dark: '#166534',
    },

    /** Accent - Orange: highlights, warnings, badges */
    accent: {
        DEFAULT: '#f59e0b',
        hover: '#d97706',
        light: '#fef3c7',
        dark: '#b45309',
    },

    /** Danger - Red: errors, destructive actions */
    danger: {
        DEFAULT: '#dc2626',
        hover: '#b91c1c',
        light: '#fee2e2',
        dark: '#991b1b',
    },

    /** Semantic aliases */
    success: {
        DEFAULT: '#16a34a',
        light: '#dcfce7',
    },

    warning: {
        DEFAULT: '#f59e0b',
        light: '#fef3c7',
    },

    /** Neutral - Background & Surface */
    background: '#f3f4f6',
    surface: {
        DEFAULT: '#ffffff',
        hover: '#f9fafb',
    },

    /** Text colors */
    text: {
        primary: '#111827',
        secondary: '#6b7280',
        muted: '#9ca3af',
        inverse: '#ffffff',
    },

    /** Border colors */
    border: {
        DEFAULT: '#e5e7eb',
        light: '#f3f4f6',
        dark: '#d1d5db',
    },
} as const;

/** Type for color tokens */
export type Colors = typeof colors;

/** CSS variable names for colors */
export const colorVars = {
    primary: 'var(--color-primary)',
    primaryHover: 'var(--color-primary-hover)',
    primaryLight: 'var(--color-primary-light)',
    primaryDark: 'var(--color-primary-dark)',

    secondary: 'var(--color-secondary)',
    secondaryHover: 'var(--color-secondary-hover)',
    secondaryLight: 'var(--color-secondary-light)',
    secondaryDark: 'var(--color-secondary-dark)',

    accent: 'var(--color-accent)',
    accentHover: 'var(--color-accent-hover)',
    accentLight: 'var(--color-accent-light)',
    accentDark: 'var(--color-accent-dark)',

    danger: 'var(--color-danger)',
    dangerHover: 'var(--color-danger-hover)',
    dangerLight: 'var(--color-danger-light)',
    dangerDark: 'var(--color-danger-dark)',

    success: 'var(--color-success)',
    successLight: 'var(--color-success-light)',

    warning: 'var(--color-warning)',
    warningLight: 'var(--color-warning-light)',

    background: 'var(--color-background)',
    surface: 'var(--color-surface)',
    surfaceHover: 'var(--color-surface-hover)',

    textPrimary: 'var(--color-text-primary)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    textInverse: 'var(--color-text-inverse)',

    border: 'var(--color-border)',
    borderLight: 'var(--color-border-light)',
    borderDark: 'var(--color-border-dark)',
} as const;
