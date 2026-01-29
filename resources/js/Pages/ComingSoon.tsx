import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import { Construction, ArrowLeft } from 'lucide-react';

export default function ComingSoon() {
    return (
        <AppLayout>
            <Head title="Coming Soon" />

            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="bg-yellow-50 p-6 rounded-full mb-6">
                    <Construction className="w-16 h-16 text-yellow-600" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Fitur Segera Hadir
                </h1>
                
                <p className="text-gray-600 max-w-md mb-8">
                    Halaman ini sedang dalam tahap pengembangan. Kami sedang bekerja keras untuk menghadirkan fitur ini secepatnya.
                </p>

                <Link href={route('dashboard')}>
                    <Button variant="secondary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Dashboard
                    </Button>
                </Link>
            </div>
        </AppLayout>
    );
}
