import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

/**
 * Jadwal Tentatif Index Page
 * Placeholder - akan dikembangkan di tahap selanjutnya
 */
export default function JadwalTentatifIndex() {
    return (
        <AppLayout>
            <Head title="Jadwal Tentatif" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                    Jadwal Tentatif
                </h1>
                <p className="text-text-secondary mt-1">
                    Jadwal yang Masih Tentatif
                </p>
            </div>

            <div className="bg-surface border border-border-default rounded-lg p-12 text-center">
                <div className="text-text-muted mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    Halaman Jadwal Tentatif
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
