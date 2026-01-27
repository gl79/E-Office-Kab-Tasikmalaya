import { Button } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';

/**
 * Error 404 - Not Found Page
 */
export default function NotFound() {
    return (
        <>
            <Head title="404 - Halaman Tidak Ditemukan" />

            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="text-center max-w-md">
                    {/* Error Icon */}
                    <div className="text-text-muted mb-6">
                        <svg 
                            className="w-24 h-24 mx-auto" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="1.5" 
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                        </svg>
                    </div>

                    {/* Error Code */}
                    <h1 className="text-6xl font-bold text-text-primary mb-4">
                        404
                    </h1>

                    {/* Error Message */}
                    <h2 className="text-xl font-semibold text-text-primary mb-2">
                        Halaman Tidak Ditemukan
                    </h2>
                    <p className="text-text-secondary mb-8">
                        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/dashboard">
                            <Button variant="primary">
                                Kembali ke Dashboard
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="secondary">
                                Ke Halaman Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
