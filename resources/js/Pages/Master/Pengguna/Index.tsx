import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

/**
 * Pengguna Index Page
 * Placeholder - akan dikembangkan di tahap selanjutnya
 */
export default function PenggunaIndex() {
    return (
        <AppLayout>
            <Head title="Pengguna" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                    Pengguna
                </h1>
                <p className="text-text-secondary mt-1">
                    Data Master Pengguna Sistem
                </p>
            </div>

            <div className="bg-surface border border-border-default rounded-lg p-12 text-center">
                <div className="text-text-muted mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    Halaman Pengguna
                </h2>
                <p className="text-text-secondary">
                    Halaman ini sedang dikembangkan
                </p>
                <span className="inline-flex items-center mt-4 px-3 py-1 rounded-full text-xs font-medium bg-accent-light text-accent-dark">
                    Coming Soon
                </span>
            </div>
        </AppLayout>
    );
}
