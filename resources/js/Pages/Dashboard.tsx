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
    Inbox,
    Send,
    Calendar,
    Clock,
    Mail,
    CalendarOff,
    Archive,
    LucideIcon
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface DashboardStats {
    wilayah: {
        provinsi: number;
        kabupaten: number;
        kecamatan: number;
        desa: number;
    };
    master: {
        pengguna: number;
        unit_kerja: number;
        indeks_surat: number;
    };
    persuratan: {
        surat_masuk: number;
        surat_keluar: number;
    };
    archive: {
        master: number;
        persuratan: number;
        total: number;
    };
}

interface DashboardPageProps extends PageProps {
    stats: DashboardStats;
}

/**
 * Dashboard Page
 * 
 * Landing page setelah login.
 * Menampilkan info user dan statistik data berdasarkan role.
 */
export default function Dashboard() {
    const { auth, stats } = usePage<DashboardPageProps>().props;
    const user = auth.user;

    // Check if user is admin (superadmin or tu)
    const isAdmin = user.role === 'superadmin' || user.role === 'tu';

    // Role labels for display
    const roleLabels: Record<string, string> = {
        superadmin: 'Super Admin',
        tu: 'Tata Usaha',
        sekpri_bupati: 'Sekpri Bupati',
        sekpri_wakil_bupati: 'Sekpri Wakil Bupati',
    };

    // Get greeting based on current time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'Selamat Pagi';
        if (hour >= 11 && hour < 15) return 'Selamat Siang';
        if (hour >= 15 && hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    // Statistics cards configuration for Admin/TU
    const wilayahStats = [
        { label: 'Provinsi', value: stats?.wilayah?.provinsi ?? 0, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Kabupaten', value: stats?.wilayah?.kabupaten ?? 0, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Kecamatan', value: stats?.wilayah?.kecamatan ?? 0, icon: Home, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Desa', value: stats?.wilayah?.desa ?? 0, icon: Tent, color: 'text-violet-600', bg: 'bg-violet-50' },
    ];

    const masterStats = [
        { label: 'Pengguna', value: stats?.master?.pengguna ?? 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Unit Kerja', value: stats?.master?.unit_kerja ?? 0, icon: Building, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { label: 'Indeks Surat', value: stats?.master?.indeks_surat ?? 0, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    // Coming soon cards for Sekpri roles - filter based on role
    const getSekpriCards = () => {
        const baseCards = [
            { title: 'Surat Masuk', description: 'Daftar surat masuk terbaru', icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Surat Keluar', description: 'Daftar surat keluar terbaru', icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ];

        if (user.role === 'sekpri_bupati') {
            return [...baseCards, { title: 'Jadwal Bupati', description: 'Jadwal kegiatan Bupati', icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' }];
        } else if (user.role === 'sekpri_wakil_bupati') {
            return [...baseCards, { title: 'Jadwal Wakil Bupati', description: 'Jadwal kegiatan Wakil Bupati', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }];
        }

        return baseCards;
    };

    // Persuratan statistics cards - with actual data
    const persuratanStats: Array<{
        label?: string;
        value?: number;
        href?: string;
        title?: string;
        description?: string;
        comingSoon?: boolean;
        icon: LucideIcon;
        color: string;
        bg: string;
    }> = [
        { label: 'Surat Masuk', value: stats?.persuratan?.surat_masuk ?? 0, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50', href: '/persuratan/surat-masuk' },
        { label: 'Surat Keluar', value: stats?.persuratan?.surat_keluar ?? 0, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/persuratan/surat-keluar' },
        { title: 'Disposisi', description: 'Total disposisi surat', icon: Mail, color: 'text-orange-600', bg: 'bg-orange-50', comingSoon: true },
        { label: 'Arsip Persuratan', value: stats?.archive?.persuratan ?? 0, icon: Archive, color: 'text-gray-600', bg: 'bg-gray-50', href: '/persuratan/archive' },
    ];

    // Penjadwalan cards - Coming Soon
    const penjadwalanCards = [
        { title: 'Jadwal Bupati', description: 'Jadwal kegiatan Bupati', icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
        { title: 'Jadwal Wakil Bupati', description: 'Jadwal kegiatan Wakil Bupati', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Arsip Penjadwalan', description: 'Data arsip penjadwalan', icon: Archive, color: 'text-slate-600', bg: 'bg-slate-50' },
    ];

    // Cuti cards - Coming Soon
    const cutiCards = [
        { title: 'Pengajuan Cuti', description: 'Total pengajuan cuti', icon: CalendarOff, color: 'text-pink-600', bg: 'bg-pink-50' },
        { title: 'Arsip Cuti', description: 'Data arsip cuti', icon: Archive, color: 'text-slate-600', bg: 'bg-slate-50' },
    ];

    // Archive statistics
    const archiveStats = [
        { label: 'Arsip Data Master', value: stats?.archive?.master ?? 0, icon: Archive, color: 'text-slate-600', bg: 'bg-slate-50', href: '/master/archive' },
    ];

    const sekpriCards = getSekpriCards();

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* Welcome Section with User Photo */}
            <div className="mb-8">
                <div className="bg-linear-to-r from-primary to-primary-dark rounded-xl p-6 text-white">
                    <div className="flex items-center gap-5">
                        <img 
                            src={user.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=ffffff&color=2563eb&size=128`} 
                            alt={user.name} 
                            className="h-20 w-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
                        />
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">
                                {getGreeting()}, {user.name}!
                            </h1>
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-white/10 rounded-lg px-3 py-2">
                                    <span className="text-primary-light text-xs">Nama Lengkap</span>
                                    <p className="text-white font-medium text-sm">{user.name}</p>
                                </div>
                                <div className="bg-white/10 rounded-lg px-3 py-2">
                                    <span className="text-primary-light text-xs">NIP</span>
                                    <p className="text-white font-medium text-sm">{user.nip || '-'}</p>
                                </div>
                                <div className="bg-white/10 rounded-lg px-3 py-2">
                                    <span className="text-primary-light text-xs">Jabatan</span>
                                    <p className="text-white font-medium text-sm">{user.jabatan || '-'}</p>
                                </div>
                                <div className="bg-white/10 rounded-lg px-3 py-2">
                                    <span className="text-primary-light text-xs">Role</span>
                                    <p className="text-white font-medium text-sm">{roleLabels[user.role] || user.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content based on role */}
            {isAdmin ? (
                <>
                    {/* Persuratan Statistics Section - Admin/TU - FIRST */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Persuratan</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {persuratanStats.map((stat, index) => {
                                const Icon = stat.icon;
                                // Check if it's a coming soon card
                                if (stat.comingSoon) {
                                    return (
                                        <div
                                            key={stat.title || index}
                                            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        Coming Soon
                                                    </span>
                                                </div>
                                                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={stat.label || index}
                                        href={stat.href || '#'}
                                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-primary/20 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {(stat.value ?? 0).toLocaleString('id-ID')}
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

                    {/* Penjadwalan Coming Soon Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Penjadwalan</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {penjadwalanCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div
                                        key={card.title}
                                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Coming Soon
                                                </span>
                                            </div>
                                            <div className={`${card.bg} ${card.color} p-3 rounded-lg`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cuti Coming Soon Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Cuti</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {cutiCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div
                                        key={card.title}
                                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Coming Soon
                                                </span>
                                            </div>
                                            <div className={`${card.bg} ${card.color} p-3 rounded-lg`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Wilayah Statistics Section - Admin/TU - SECOND */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Wilayah</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {wilayahStats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div 
                                        key={stat.label}
                                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-900">
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
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Master</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {masterStats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={stat.label}
                                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-900">
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
                            {/* Archive card for Master Data */}
                            {archiveStats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <Link
                                        key={stat.label}
                                        href={stat.href}
                                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-primary/20 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-900">
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
                </>
            ) : (
                /* Coming Soon cards for Sekpri roles */
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu Cepat</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sekpriCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div 
                                    key={card.title}
                                    className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`${card.bg} ${card.color} p-3 rounded-lg shrink-0`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {card.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {card.description}
                                            </p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mt-3">
                                                Coming Soon
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
