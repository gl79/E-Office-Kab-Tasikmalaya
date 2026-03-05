import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    MapPin,
    Building2,
    Home,
    Tent,
    Users,
    Building,
    FileText,
    FileType,
    Inbox,
    Send,
    FileOutput,
    Calendar,
    Clock,
    History,
    LucideIcon
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import DashboardShimmer from '@/Components/shimmer/DashboardShimmer';
import { useEffect, useState } from 'react';
import { useMemoryCache } from '@/hooks/useMemoryCache';

interface DashboardStats {
    wilayah?: {
        provinsi: number;
        kabupaten: number;
        kecamatan: number;
        desa: number;
    };
    master?: {
        pengguna: number;
        unit_kerja: number;
        indeks_surat: number;
        jenis_surat: number;
    };
    persuratan: {
        surat_masuk: number;
        surat_keluar: number;
        disposisi: number;
    };
    penjadwalan?: {
        jadwal_tentatif: number;
        jadwal_definitif: number;
        history_penjadwalan: number;
    };
}

interface DashboardPageProps extends PageProps {
    stats?: DashboardStats;
}

const CACHE_TTL_MS = 60_000;

interface WelcomeBannerProps {
    fotoUrl?: string | null;
    name: string;
    nip?: string | null;
    jabatan_nama?: string | null;
    roleLabel: string;
    greeting: string;
}

const WelcomeBanner = ({ fotoUrl, name, nip, jabatan_nama, roleLabel, greeting }: WelcomeBannerProps) => (
    <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-text-inverse">
        <div className="flex items-center gap-5">
            <img
                src={fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=ffffff&color=2563eb&size=128`}
                alt={name}
                className="h-20 w-20 rounded-full object-cover border-4 border-text-inverse/30 shadow-lg"
            />
            <div className="flex-1">
                <h1 className="text-2xl font-bold">{greeting}, {name}</h1>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-text-inverse/10 rounded-lg px-3 py-2">
                        <span className="text-primary-light text-xs">Nama Lengkap</span>
                        <p className="text-text-inverse font-medium text-sm">{name}</p>
                    </div>
                    <div className="bg-text-inverse/10 rounded-lg px-3 py-2">
                        <span className="text-primary-light text-xs">NIP</span>
                        <p className="text-text-inverse font-medium text-sm break-all">{nip || '-'}</p>
                    </div>
                    <div className="bg-text-inverse/10 rounded-lg px-3 py-2">
                        <span className="text-primary-light text-xs">Jabatan</span>
                        <p className="text-text-inverse font-medium text-sm">{jabatan_nama || '-'}</p>
                    </div>
                    <div className="bg-text-inverse/10 rounded-lg px-3 py-2">
                        <span className="text-primary-light text-xs">Role</span>
                        <p className="text-text-inverse font-medium text-sm">{roleLabel}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * Dashboard Page
 *
 * Landing page setelah login.
 * Menampilkan info user dan statistik data berdasarkan role.
 */
const Dashboard = () => {
    const { auth, stats: deferredStats } = usePage<DashboardPageProps>().props;
    const user = auth.user;
    const cacheKey = `dashboard_stats_${user.id}`;
    const { read, write } = useMemoryCache<DashboardStats>(cacheKey, CACHE_TTL_MS);
    const cachedStats = read();
    const [localStats, setLocalStats] = useState<DashboardStats | undefined>(() => deferredStats ?? cachedStats ?? undefined);

    // Check if user is admin (superadmin or tu)
    const isAdmin = user.role === 'superadmin' || user.role === 'tu';

    // Role labels for display
    const roleLabels: Record<string, string> = {
        superadmin: 'Super Admin',
        pejabat: 'Pejabat',
        tu: 'Tata Usaha',
        user: 'User',
    };

    // Get greeting based on current time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'Selamat Pagi';
        if (hour >= 11 && hour < 15) return 'Selamat Siang';
        if (hour >= 15 && hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    // If stats is undefined (deferred), show loading shimmer
    useEffect(() => {
        if (deferredStats !== undefined) {
            setLocalStats(deferredStats);
            write(deferredStats);
        }
    }, [deferredStats, write]);

    if (!localStats) {
        return (
            <>
                <Head title="Dashboard" />
                <div className="mb-8">
                    <WelcomeBanner
                        fotoUrl={user.foto_url}
                        name={user.name}
                        nip={user.nip}
                        jabatan_nama={user.jabatan_nama}
                        roleLabel={roleLabels[user.role] || user.role}
                        greeting={getGreeting()}
                    />
                </div>
                <DashboardShimmer />
            </>
        );
    }

    const stats = localStats;

    // Statistics cards configuration for Admin/TU
    const wilayahStats = [
        { label: 'Provinsi', value: stats.wilayah?.provinsi ?? 0, icon: MapPin, color: 'text-primary', bg: 'bg-primary-light' },
        { label: 'Kabupaten', value: stats.wilayah?.kabupaten ?? 0, icon: Building2, color: 'text-secondary', bg: 'bg-secondary-light' },
        { label: 'Kecamatan', value: stats.wilayah?.kecamatan ?? 0, icon: Home, color: 'text-warning', bg: 'bg-warning-light' },
        { label: 'Desa', value: stats.wilayah?.desa ?? 0, icon: Tent, color: 'text-accent', bg: 'bg-accent-light' },
    ];

    const masterStats = [
        { label: 'Pengguna', value: stats.master?.pengguna ?? 0, icon: Users, color: 'text-primary', bg: 'bg-primary-light' },
        { label: 'Unit Kerja', value: stats.master?.unit_kerja ?? 0, icon: Building, color: 'text-secondary', bg: 'bg-secondary-light' },
        { label: 'Indeks Surat', value: stats.master?.indeks_surat ?? 0, icon: FileText, color: 'text-accent', bg: 'bg-accent-light' },
        { label: 'Jenis Surat', value: stats.master?.jenis_surat ?? 0, icon: FileType, color: 'text-warning', bg: 'bg-warning-light' },
    ];

    // Penjadwalan statistics cards
    const penjadwalanStats = [
        { label: 'Jadwal Tentatif', value: stats.penjadwalan?.jadwal_tentatif ?? 0, icon: Clock, color: 'text-accent', bg: 'bg-accent-light', href: '/penjadwalan/tentatif' },
        { label: 'Jadwal Definitif', value: stats.penjadwalan?.jadwal_definitif ?? 0, icon: Calendar, color: 'text-warning', bg: 'bg-warning-light', href: '/penjadwalan/definitif' },
        { label: 'History Penjadwalan', value: stats.penjadwalan?.history_penjadwalan ?? 0, icon: History, color: 'text-secondary', bg: 'bg-secondary-light', href: '/penjadwalan/history' },
    ];

    // Quick access cards for non-admin roles (with stats)
    const getQuickCards = () => {
        const cards: Array<{ title: string; description: string; value?: number; icon: LucideIcon; color: string; bg: string; href?: string }> = [];

        // Pejabat: persuratan (read-only) + penjadwalan
        if (user.role === 'pejabat') {
            cards.push(
                { title: 'Surat Masuk', description: 'Surat masuk untuk Anda', value: stats.persuratan?.surat_masuk ?? 0, icon: Inbox, color: 'text-primary', bg: 'bg-primary-light', href: '/persuratan/surat-masuk' },
                { title: 'Surat Keluar', description: 'Surat keluar Anda', value: stats.persuratan?.surat_keluar ?? 0, icon: Send, color: 'text-secondary', bg: 'bg-secondary-light', href: '/persuratan/surat-keluar' },
                { title: 'Jadwal Tentatif', description: 'Jadwal tentatif kegiatan', value: stats.penjadwalan?.jadwal_tentatif ?? 0, icon: Clock, color: 'text-accent', bg: 'bg-accent-light', href: '/penjadwalan/tentatif' },
                { title: 'Jadwal Definitif', description: 'Jadwal definitif kegiatan', value: stats.penjadwalan?.jadwal_definitif ?? 0, icon: Calendar, color: 'text-warning', bg: 'bg-warning-light', href: '/penjadwalan/definitif' },
                { title: 'History Penjadwalan', description: 'Riwayat perubahan jadwal', value: stats.penjadwalan?.history_penjadwalan ?? 0, icon: History, color: 'text-primary', bg: 'bg-primary-light', href: '/penjadwalan/history' },
            );
        }

        // User: persuratan only (filtered)
        if (user.role === 'user') {
            cards.push(
                { title: 'Surat Masuk', description: 'Surat masuk untuk Anda', value: stats.persuratan?.surat_masuk ?? 0, icon: Inbox, color: 'text-primary', bg: 'bg-primary-light', href: '/persuratan/surat-masuk' },
                { title: 'Surat Keluar', description: 'Surat keluar Anda', value: stats.persuratan?.surat_keluar ?? 0, icon: Send, color: 'text-secondary', bg: 'bg-secondary-light', href: '/persuratan/surat-keluar' },
            );
        }

        return cards;
    };

    const persuratanStats: Array<{
        label: string;
        value: number;
        href: string;
        icon: LucideIcon;
        color: string;
        bg: string;
    }> = [
            { label: 'Surat Masuk', value: stats.persuratan?.surat_masuk ?? 0, icon: Inbox, color: 'text-primary', bg: 'bg-primary-light', href: '/persuratan/surat-masuk' },
            { label: 'Surat Keluar', value: stats.persuratan?.surat_keluar ?? 0, icon: Send, color: 'text-secondary', bg: 'bg-secondary-light', href: '/persuratan/surat-keluar' },
            { label: 'Disposisi', value: stats.persuratan?.disposisi ?? 0, icon: FileOutput, color: 'text-warning', bg: 'bg-warning-light', href: '/persuratan/surat-masuk' },
        ];


    const quickCards = getQuickCards();

    return (
        <>
            <Head title="Dashboard" />

            {/* Welcome Section with User Photo */}
            <div className="mb-8">
                <WelcomeBanner
                    fotoUrl={user.foto_url}
                    name={user.name}
                    nip={user.nip}
                    jabatan_nama={user.jabatan_nama}
                    roleLabel={roleLabels[user.role] || user.role}
                    greeting={getGreeting()}
                />
            </div>

            {/* Content based on role */}
            {isAdmin ? (
                <>
                    {/* Persuratan Statistics Section - Admin/TU - FIRST */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Persuratan</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {persuratanStats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <Link
                                        key={stat.label}
                                        href={stat.href}
                                        className="bg-surface rounded-xl border border-border-default p-5 hover:shadow-md hover:border-primary/20 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-text-primary">
                                                    {stat.value.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Penjadwalan Statistics Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Penjadwalan</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {penjadwalanStats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <Link
                                        key={stat.label}
                                        href={stat.href}
                                        className="bg-surface rounded-xl border border-border-default p-5 hover:shadow-md hover:border-primary/20 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-text-primary">
                                                    {stat.value.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Wilayah Statistics Section - Admin/TU - SECOND */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Data Wilayah</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {wilayahStats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={stat.label}
                                        className="bg-surface rounded-xl border border-border-default p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-text-primary">
                                                    {stat.value.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Master Data Statistics Section - Admin/TU - THIRD */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Data Master</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {masterStats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={stat.label}
                                        className="bg-surface rounded-xl border border-border-default p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-text-primary">
                                                    {stat.value.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                /* Quick access cards for non-admin roles with stats */
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Ringkasan</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickCards.map((card) => {
                            const Icon = card.icon;
                            const content = (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">{card.title}</p>
                                        {card.value !== undefined ? (
                                            <p className="text-2xl font-bold text-text-primary">
                                                {card.value.toLocaleString('id-ID')}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-text-secondary">{card.description}</p>
                                        )}
                                    </div>
                                    <div className={`${card.bg} ${card.color} p-3 rounded-lg`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                            );
                            if (card.href) {
                                return (
                                    <Link
                                        key={card.title}
                                        href={card.href}
                                        className="bg-surface rounded-xl border border-border-default p-5 hover:shadow-md hover:border-primary/20 transition-all"
                                    >
                                        {content}
                                    </Link>
                                );
                            }
                            return (
                                <div
                                    key={card.title}
                                    className="bg-surface rounded-xl border border-border-default p-5 hover:shadow-md transition-shadow"
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};

Dashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Dashboard;
