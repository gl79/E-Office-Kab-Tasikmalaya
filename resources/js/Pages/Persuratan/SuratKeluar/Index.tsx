import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

/**
 * Surat Keluar Index Page
 * Placeholder - akan dikembangkan di tahap selanjutnya
 */
export default function SuratKeluarIndex() {
    return (
        <AppLayout>
            <Head title="Surat Keluar" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                    Surat Keluar
                </h1>
                <p className="text-text-secondary mt-1">
                    Daftar Surat Keluar
                </p>
            </div>

            <div className="bg-surface border border-border-default rounded-lg p-12 text-center">
                <div className="text-text-muted mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    Halaman Surat Keluar
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
