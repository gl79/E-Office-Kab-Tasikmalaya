import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/Components/ui';
import Badge from '@/Components/ui/Badge';
import { Clock, User, FileText, Send, Eye, Check, CalendarPlus, CalendarCheck } from 'lucide-react';
import axios from 'axios';
import type { TimelineEntry, SuratMasuk } from '@/types/persuratan';
import { formatDateShort, getSifatBadge } from '@/utils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    suratMasuk: SuratMasuk | null;
    sifatOptions: Record<string, string>;
}

const AKSI_ICON_MAP: Record<string, React.ReactNode> = {
    input: <FileText className="h-4 w-4" />,
    kirim: <Send className="h-4 w-4" />,
    baca: <Eye className="h-4 w-4" />,
    terima: <Check className="h-4 w-4" />,
    disposisi: <User className="h-4 w-4" />,
    jadwalkan: <CalendarPlus className="h-4 w-4" />,
    definitif: <CalendarCheck className="h-4 w-4" />,
};

const AKSI_COLOR_MAP: Record<string, string> = {
    input: 'bg-primary text-white',
    kirim: 'bg-primary-light text-primary-dark',
    baca: 'bg-accent-light text-accent-dark',
    terima: 'bg-secondary-light text-secondary-dark',
    disposisi: 'bg-primary text-white',
    jadwalkan: 'bg-accent text-white',
    definitif: 'bg-secondary text-white',
};

/**
 * Modal untuk menampilkan timeline/riwayat aksi pada surat masuk.
 */
export default function TimelineModal({ isOpen, onClose, suratMasuk, sifatOptions }: Props) {
    const [timelines, setTimelines] = useState<TimelineEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTimeline = useCallback(async () => {
        if (!suratMasuk?.id) return;
        setIsLoading(true);
        try {
            const { data } = await axios.get(route('persuratan.surat-masuk.timeline', suratMasuk.id));
            setTimelines(data.timelines ?? []);
        } catch {
            setTimelines([]);
        } finally {
            setIsLoading(false);
        }
    }, [suratMasuk?.id]);

    useEffect(() => {
        if (isOpen && suratMasuk?.id) {
            fetchTimeline();
        }
    }, [isOpen, suratMasuk?.id, fetchTimeline]);

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatNoAgenda = (nomor?: string) => {
        if (!nomor) return '-';
        const parts = nomor.split('/');
        return parts.length >= 2 ? parts[1] : nomor;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Timeline Surat" size="lg">
            {suratMasuk && (
                <>
                    {/* Identitas Surat */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Identitas Surat</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-secondary">Tanggal Surat</p>
                                <p className="font-medium text-text-primary">{formatDateShort(suratMasuk.tanggal_surat)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Asal Surat</p>
                                <Badge variant="primary" className="mt-1">{suratMasuk.asal_surat}</Badge>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-text-secondary">Kepada (Tujuan Surat)</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {suratMasuk.tujuans?.length ? (
                                        suratMasuk.tujuans.map((tujuan) => (
                                            <Badge key={tujuan.id} variant="primary" size="sm">
                                                {tujuan.user?.jabatan_nama || tujuan.tujuan}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="font-medium text-text-primary">-</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Nomor Surat</p>
                                <p className="font-medium text-text-primary">{suratMasuk.nomor_surat}</p>
                            </div>
                            {suratMasuk.jenis_surat ? (
                                <div>
                                    <p className="text-sm text-text-secondary">Jenis Surat</p>
                                    <p className="font-medium text-text-primary">{suratMasuk.jenis_surat.nama}</p>
                                </div>
                            ) : <div />}
                            <div>
                                <p className="text-sm text-text-secondary">Sifat Surat</p>
                                {getSifatBadge(suratMasuk.sifat, sifatOptions)}
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Jumlah Lampiran</p>
                                <p className="font-medium text-text-primary">{suratMasuk.lampiran ?? 0} berkas</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Perihal</p>
                                <p className="font-medium text-text-primary">{suratMasuk.perihal || '-'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-text-secondary">Isi Ringkas Surat</p>
                                <p className="font-medium text-text-primary">{suratMasuk.isi_ringkas || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Identitas Agenda */}
                    <div className="pt-4 mb-6 border-t border-border-default">
                        <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Identitas Agenda</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-secondary">Tanggal Diterima</p>
                                <p className="font-medium text-text-primary">{formatDateShort(suratMasuk.tanggal_diterima)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">No Agenda</p>
                                <p className="font-medium text-text-primary">{formatNoAgenda(suratMasuk.nomor_agenda)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Indeks Surat</p>
                                <p className="font-medium text-text-primary">
                                    {suratMasuk.indeks_berkas
                                        ? `${suratMasuk.indeks_berkas.kode} - ${suratMasuk.indeks_berkas.nama}`
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Kode Klasifikasi</p>
                                <p className="font-medium text-text-primary">
                                    {suratMasuk.kode_klasifikasi
                                        ? `${suratMasuk.kode_klasifikasi.kode} - ${suratMasuk.kode_klasifikasi.nama}`
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Staff Pengolah</p>
                                <p className="font-medium text-text-primary">
                                    {suratMasuk.staff_pengolah?.jabatan_nama || suratMasuk.staff_pengolah?.name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Tanggal Diteruskan</p>
                                <p className="font-medium text-text-primary">
                                    {suratMasuk.tanggal_diteruskan ? formatDateShort(suratMasuk.tanggal_diteruskan) : '-'}
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-text-secondary">Catatan Tambahan</p>
                                <p className="font-medium text-text-primary">{suratMasuk.catatan_tambahan || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide pt-4 border-t border-border-default">Riwayat Timeline</h3>
                </>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex gap-4">
                            <div className="h-8 w-8 rounded-full bg-border-default" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-border-default rounded w-1/3" />
                                <div className="h-3 bg-border-light rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : timelines.length === 0 ? (
                <p className="text-center text-text-muted py-8">Belum ada riwayat untuk surat ini.</p>
            ) : (
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-border-default" />

                    <div className="space-y-6">
                        {[...timelines].reverse().map((entry) => (
                            <div key={entry.id} className="relative flex gap-4 pl-0">
                                {/* Icon circle */}
                                <div className={`relative z-10 flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${AKSI_COLOR_MAP[entry.aksi] ?? 'bg-border-dark text-white'}`}>
                                    {AKSI_ICON_MAP[entry.aksi] ?? <Clock className="h-4 w-4" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="primary" size="sm">{entry.aksi_label}</Badge>
                                        <span className="text-xs text-text-muted">{formatTime(entry.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-text-primary mt-1">{entry.keterangan}</p>
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        {entry.user_name === 'Sistem' ? 'Sistem' : (entry.user_jabatan || '-')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Modal>
    );
}
