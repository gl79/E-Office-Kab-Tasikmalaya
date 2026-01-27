import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

/**
 * Cuti Index Page
 * Placeholder - akan dikembangkan di tahap selanjutnya
 */
export default function CutiIndex() {
    return (
        <AppLayout>
            <Head title="Cuti" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                    Cuti
                </h1>
                <p className="text-text-secondary mt-1">
                    Pengajuan dan Manajemen Cuti
                </p>
            </div>

            <div className="bg-surface border border-border-default rounded-lg p-12 text-center">
                <div className="text-text-muted mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    Halaman Cuti
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
