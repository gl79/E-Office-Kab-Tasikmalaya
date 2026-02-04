import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { Archive } from 'lucide-react';

/**
 * Cuti Archive Index Page
 * Placeholder - akan dikembangkan di tahap selanjutnya
 */
const ArchiveIndex = () => {
    return (
        <>
            <Head title="Arsip Cuti" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                    Arsip Cuti
                </h1>
                <p className="text-text-secondary mt-1">
                    Daftar Riwayat Cuti
                </p>
            </div>

            <div className="bg-surface border border-border-default rounded-lg p-12 text-center">
                <div className="text-text-muted mb-2">
                    <Archive className="w-16 h-16 mx-auto text-text-muted" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    Halaman Arsip Cuti
                </h2>
                <p className="text-text-secondary">
                    Halaman ini sedang dikembangkan
                </p>
                <span className="inline-flex items-center mt-4 px-3 py-1 rounded-full text-xs font-medium bg-accent-light text-accent-dark">
                    Coming Soon
                </span>
            </div>
        </>
    );
};

ArchiveIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ArchiveIndex;
