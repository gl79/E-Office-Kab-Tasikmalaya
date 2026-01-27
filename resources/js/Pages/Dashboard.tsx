import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

/**
 * Dashboard Page
 * 
 * Landing page setelah login.
 * Menampilkan info user dan placeholder cards.
 */
export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    // Role labels for display
    const roleLabels: Record<string, string> = {
        superadmin: 'Super Admin',
        tu: 'Tata Usaha',
        sekpri_bupati: 'Sekpri Bupati',
        sekpri_wakil_bupati: 'Sekpri Wakil Bupati',
    };

    // Placeholder cards data
    const placeholderCards = [
        {
            title: 'Ringkasan Surat',
            description: 'Statistik surat masuk dan keluar',
            status: 'Coming Soon',
        },
        {
            title: 'Surat Masuk',
            description: 'Daftar surat masuk terbaru',
            status: 'Coming Soon',
        },
        {
            title: 'Surat Keluar',
            description: 'Daftar surat keluar terbaru',
            status: 'Coming Soon',
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                    Dashboard
                </h1>
                <p className="text-text-secondary mt-1">
                    Selamat datang, <span className="font-medium">{user.name}</span>
                </p>
            </div>

            {/* User Info Card */}
            <div className="bg-surface border border-border-default rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Informasi Akun
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-text-secondary">Username</span>
                        <p className="text-text-primary font-medium">{user.username}</p>
                    </div>
                    <div>
                        <span className="text-sm text-text-secondary">Role</span>
                        <p className="text-text-primary font-medium">
                            {roleLabels[user.role] || user.role}
                        </p>
                    </div>
                </div>
            </div>

            {/* Placeholder Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {placeholderCards.map((card, index) => (
                    <div 
                        key={index}
                        className="bg-surface border border-border-default rounded-lg p-6"
                    >
                        <h3 className="text-lg font-semibold text-text-primary">
                            {card.title}
                        </h3>
                        <p className="text-text-secondary text-sm mt-1">
                            {card.description}
                        </p>
                        <div className="mt-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-light text-accent-dark">
                                {card.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
