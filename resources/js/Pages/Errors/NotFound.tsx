import { Button } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ShieldX, FileQuestion, ServerCrash } from 'lucide-react';

interface ErrorPageProps extends PageProps {
    status?: number;
}

const errorConfig: Record<number, { title: string; heading: string; description: string; icon: typeof ShieldX }> = {
    404: {
        title: '404 - Halaman Tidak Ditemukan',
        heading: 'Halaman Tidak Ditemukan',
        description: 'Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.',
        icon: FileQuestion,
    },
    500: {
        title: '500 - Kesalahan Server',
        heading: 'Terjadi Kesalahan',
        description: 'Maaf, terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
        icon: ServerCrash,
    },
};

const defaultError = {
    title: 'Error - Halaman Tidak Ditemukan',
    heading: 'Halaman Tidak Ditemukan',
    description: 'Maaf, halaman yang Anda cari tidak tersedia.',
    icon: FileQuestion,
};

/**
 * Error Page — Halaman error universal.
 *
 * Mendukung status 404 dan 500.
 * AuthorizationException (403) juga di-redirect ke halaman ini sebagai 404
 * agar tidak membocorkan eksistensi resource.
 */
export default function NotFound() {
    const { status } = usePage<ErrorPageProps>().props;
    const config = errorConfig[status ?? 404] ?? defaultError;
    const Icon = config.icon;

    return (
        <>
            <Head title={config.title} />

            <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
                <div className="text-center max-w-lg w-full">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-danger-light p-5 rounded-full">
                            <Icon className="w-16 h-16 text-danger" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Error Code */}
                    <h1 className="text-7xl sm:text-8xl font-extrabold text-text-primary mb-3 tracking-tight">
                        {status ?? 404}
                    </h1>

                    {/* Message */}
                    <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">
                        {config.heading}
                    </h2>
                    <p className="text-text-secondary mb-10 text-sm sm:text-base leading-relaxed">
                        {config.description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/dashboard">
                            <Button variant="primary" className="w-full sm:w-auto">
                                Kembali ke Dashboard
                            </Button>
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg border border-border-default text-text-secondary bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                            Halaman Sebelumnya
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
