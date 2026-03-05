import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/Components/ui';
import Badge from '@/Components/ui/Badge';
import { Clock, User, FileText, Send, Eye, Check, CalendarPlus, CalendarCheck } from 'lucide-react';
import axios from 'axios';
import type { TimelineEntry } from '@/types/persuratan';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    suratMasukId: string | null;
    suratPerihal?: string;
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
export default function TimelineModal({ isOpen, onClose, suratMasukId, suratPerihal }: Props) {
    const [timelines, setTimelines] = useState<TimelineEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTimeline = useCallback(async () => {
        if (!suratMasukId) return;
        setIsLoading(true);
        try {
            const { data } = await axios.get(route('persuratan.surat-masuk.timeline', suratMasukId));
            setTimelines(data.timelines ?? []);
        } catch {
            setTimelines([]);
        } finally {
            setIsLoading(false);
        }
    }, [suratMasukId]);

    useEffect(() => {
        if (isOpen && suratMasukId) {
            fetchTimeline();
        }
    }, [isOpen, suratMasukId, fetchTimeline]);

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Timeline Surat" size="lg">
            {suratPerihal && (
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">{suratPerihal}</p>
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
                        {timelines.map((entry, idx) => (
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
                                        {entry.user_name} — {entry.user_jabatan}
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
