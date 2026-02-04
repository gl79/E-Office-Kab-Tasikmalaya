import { ApplicationLogo } from '@/Components/form';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect } from 'react';
import { ToastProvider, useToast } from '@/Components/ui';
import { PageProps } from '@/types';
import { Building2 } from 'lucide-react';

export default function Guest({ children }: PropsWithChildren) {
    const { flash } = usePage<PageProps & { flash: { success?: string; error?: string } }>().props;
    const { showToast } = useToast();

    useEffect(() => {
        if (flash?.success) {
            showToast('success', flash.success);
        }
        if (flash?.error) {
            showToast('error', flash.error);
        }
    }, [flash]);

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-hover to-primary-dark relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-surface rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-surface rounded-full blur-3xl"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
                    <div className="text-center">
                        <div className="mb-8">
                            <img src="/images/pemkabtasik.png" alt="Logo Kabupaten Tasikmalaya" className="w-32 h-32 object-contain mx-auto" />
                        </div>
                        <h1 className="text-4xl font-bold text-text-inverse mb-4">
                            E-Office
                        </h1>
                        <p className="text-xl text-primary-light mb-2">
                            Kabupaten Tasikmalaya
                        </p>
                        <p className="text-text-inverse/90 text-sm max-w-sm mx-auto leading-relaxed">
                            Sistem Informasi Tata Kelola Surat Menyurat, Penjadwalan Kegiatan dan Cuti
                        </p>
                    </div>
                    
                    {/* Footer */}
                    <div className="absolute bottom-8 text-center">
                        <p className="text-text-inverse/80 text-sm">
                            (c) 2026 Pemerintah Kabupaten Tasikmalaya
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-background px-6 py-12">
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                    <div className="mb-6">
                        <img src="/images/pemkabtasik.png" alt="Logo Kabupaten Tasikmalaya" className="w-24 h-24 object-contain mx-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary">E-Office</h1>
                    <p className="text-text-secondary text-sm">Kabupaten Tasikmalaya</p>
                </div>

                {/* Form Card */}
                <div className="w-full max-w-md">
                    <div className="bg-surface rounded-2xl shadow-sm border border-border-default px-8 py-10">
                        {children}
                    </div>
                    
                    {/* Desktop Footer */}
                    <p className="hidden lg:block text-center text-text-muted text-sm mt-8">
                        (c) 2026 Pemerintah Kabupaten Tasikmalaya
                    </p>
                </div>
            </div>
        </div>
    );
}

