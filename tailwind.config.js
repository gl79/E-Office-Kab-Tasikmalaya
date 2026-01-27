import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },

            /**
             * Custom Colors using CSS Variables
             * These reference the CSS variables defined in app.css
             */
            colors: {
                // Primary - Blue
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    hover: 'var(--color-primary-hover)',
                    light: 'var(--color-primary-light)',
                    dark: 'var(--color-primary-dark)',
                },

                // Secondary - Green
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    hover: 'var(--color-secondary-hover)',
                    light: 'var(--color-secondary-light)',
                    dark: 'var(--color-secondary-dark)',
                },

                // Accent - Orange
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    hover: 'var(--color-accent-hover)',
                    light: 'var(--color-accent-light)',
                    dark: 'var(--color-accent-dark)',
                },

                // Danger - Red
                danger: {
                    DEFAULT: 'var(--color-danger)',
                    hover: 'var(--color-danger-hover)',
                    light: 'var(--color-danger-light)',
                    dark: 'var(--color-danger-dark)',
                },

                // Semantic aliases
                success: {
                    DEFAULT: 'var(--color-success)',
                    light: 'var(--color-success-light)',
                },
                warning: {
                    DEFAULT: 'var(--color-warning)',
                    light: 'var(--color-warning-light)',
                },

                // Background & Surface
                background: 'var(--color-background)',
                surface: {
                    DEFAULT: 'var(--color-surface)',
                    hover: 'var(--color-surface-hover)',
                },

                // Text
                'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)',
                'text-muted': 'var(--color-text-muted)',
                'text-inverse': 'var(--color-text-inverse)',

                // Border
                'border-default': 'var(--color-border)',
                'border-light': 'var(--color-border-light)',
                'border-dark': 'var(--color-border-dark)',
            },

            /**
             * Semantic border colors
             */
            borderColor: {
                DEFAULT: 'var(--color-border)',
            },

            /**
             * Semantic background colors
             */
            backgroundColor: {
                page: 'var(--color-background)',
            },
        },
    },

    plugins: [forms],
};
