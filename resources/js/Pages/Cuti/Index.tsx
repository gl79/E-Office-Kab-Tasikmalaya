import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { CalendarOff, Clock, FileText, CheckSquare, BarChart2, Wrench } from 'lucide-react';

/**
 * Cuti Index Page
 * Placeholder - akan dikembangkan di tahap selanjutnya
 */
export default function CutiIndex() {
    const features = [
        {
            icon: <FileText className="h-5 w-5" />,
            title: 'Pengajuan Cuti',
            desc: 'Ajukan cuti tahunan, sakit, maupun alasan lainnya secara digital.',
            color: 'bg-primary-light text-primary',
        },
        {
            icon: <CheckSquare className="h-5 w-5" />,
            title: 'Persetujuan Atasan',
            desc: 'Alur persetujuan berjenjang langsung dari atasan yang berwenang.',
            color: 'bg-success-light text-success',
        },
        {
            icon: <BarChart2 className="h-5 w-5" />,
            title: 'Sisa Kuota Cuti',
            desc: 'Pantau sisa kuota dan riwayat cuti pegawai secara real-time.',
            color: 'bg-accent-light text-accent',
        },
        {
            icon: <Clock className="h-5 w-5" />,
            title: 'Riwayat & Laporan',
            desc: 'Laporan rekap cuti bulanan dan tahunan dapat dicetak kapan saja.',
            color: 'bg-danger-light text-danger',
        },
    ];

    return (
        <AppLayout>
            <Head title="Data Cuti" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Data Cuti</h1>
                <p className="mt-1 text-sm text-text-secondary">Manajemen data cuti pegawai</p>
            </div>

            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-dark p-8 text-center shadow-sm">
                {/* Dekorasi */}
                <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-white/5" />

                <div className="relative">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
                        <CalendarOff className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Modul Cuti</h2>
                    <p className="mt-2 text-white/75 text-sm max-w-md mx-auto">
                        Fitur manajemen cuti pegawai sedang dalam tahap pengembangan dan akan segera tersedia.
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
                        <Wrench className="h-4 w-4" />
                        Sedang Dikembangkan
                    </div>
                </div>
            </div>

            {/* Fitur yang akan hadir */}
            <div className="mt-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                    Fitur yang akan hadir
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="rounded-xl border border-border-default bg-surface p-5 transition-shadow hover:shadow-sm"
                        >
                            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${f.color}`}>
                                {f.icon}
                            </div>
                            <h4 className="text-sm font-semibold text-text-primary">{f.title}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-text-secondary">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
