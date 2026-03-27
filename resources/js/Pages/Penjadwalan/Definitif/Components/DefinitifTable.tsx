import React from 'react';
import { Badge, Button, Dropdown } from '@/Components/ui';
import { Eye, MapPin, Clock, Calendar, MoreVertical } from 'lucide-react';
import { formatDateShort } from '@/utils';
import type { Agenda } from '@/types/penjadwalan';

interface Props {
    data: Agenda[];
    onViewDetail: (agenda: Agenda) => void;
    onViewTimeline?: (agenda: Agenda) => void;
    currentPage: number;
    itemsPerPage: number;
}

const formatNoAgenda = (nomor?: string) => {
    if (!nomor) return '-';
    const parts = nomor.split('/');
    return parts.length >= 2 ? parts[1] : nomor;
};

const formatTimeNoSeconds = (time?: string | null) => {
    if (!time) return '';
    return time.length >= 5 ? time.slice(0, 5) : time;
};

const getWorkflowStatusVariant = (status?: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
        case 'Jadwal Definitif':
            return 'primary';
        case 'Selesai':
            return 'success';
        case 'Sudah Didisposisi':
            return 'info';
        case 'Masuk Jadwal Tentatif':
            return 'warning';
        default:
            return 'default';
    }
};

const DefinitifTable: React.FC<Props> = ({
    data,
    onViewDetail,
    onViewTimeline,
    currentPage,
    itemsPerPage,
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-border-default">
                <thead className="bg-surface-hover">
                    <tr>
                        <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase w-12">No</th>
                        <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">No Agenda</th>
                        <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase w-32">Tanggal</th>
                        <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase w-32">Waktu</th>
                        <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Kegiatan</th>
                        <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Lokasi</th>
                        <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">Status</th>
                        <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase w-24">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-surface">
                    {data.map((item, index) => (
                        <tr key={item.id} className="hover:bg-surface-hover">
                            <td className="border border-border-default px-4 py-3 text-center text-text-secondary text-sm">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="border border-border-default px-4 py-3 text-center text-text-primary text-sm font-medium">
                                {formatNoAgenda(item.surat_masuk?.nomor_agenda)}
                            </td>
                            <td className="border border-border-default px-4 py-3 text-sm text-text-primary">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                                    {item.tanggal_agenda ? formatDateShort(item.tanggal_agenda) : '-'}
                                </div>
                            </td>
                            <td className="border border-border-default px-4 py-3 text-sm text-text-primary">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-text-secondary" />
                                    {formatTimeNoSeconds(item.waktu_mulai)}
                                    {item.sampai_selesai ? ' - Selesai' : (item.waktu_selesai ? ` - ${formatTimeNoSeconds(item.waktu_selesai)}` : '')}
                                </div>
                            </td>
                            <td className="border border-border-default px-4 py-3 text-text-primary text-sm leading-relaxed">
                                <span className="line-clamp-2 font-medium">{item.nama_kegiatan}</span>
                                {item.surat_masuk?.asal_surat && (
                                    <div className="text-xs text-text-secondary mt-1">
                                        Asal: {item.surat_masuk.asal_surat}
                                    </div>
                                )}
                            </td>
                            <td className="border border-border-default px-4 py-3 text-text-secondary text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{item.tempat || '-'}</span>
                                </div>
                            </td>
                            <td className="border border-border-default px-4 py-3 text-center">
                                <div className="flex flex-col gap-1 items-center">
                                    <Badge variant={getWorkflowStatusVariant(item.status_tindak_lanjut)}>
                                        {item.status_tindak_lanjut ?? item.status_formal_label ?? item.status_label ?? 'Jadwal Definitif'}
                                    </Badge>
                                </div>
                            </td>
                            <td className="border border-border-default px-4 py-3 text-center align-middle">
                                <Dropdown
                                    align="right"
                                    width="48"
                                    trigger={
                                        <button
                                            type="button"
                                            aria-label="Aksi lainnya"
                                            className="
                                                inline-flex h-8 w-8 items-center justify-center rounded-lg
                                                border border-border-default bg-surface text-text-secondary
                                                transition-colors hover:bg-surface-hover hover:text-text-primary
                                                mx-auto
                                            "
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    }
                                >
                                    <div className="py-1">
                                        <Dropdown.Link
                                            as="button"
                                            onClick={() => onViewDetail(item)}
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span>Lihat Detail</span>
                                        </Dropdown.Link>
                                        
                                        {onViewTimeline && item.surat_masuk && (
                                            <Dropdown.Link
                                                as="button"
                                                onClick={() => onViewTimeline(item)}
                                                className="flex items-center gap-2"
                                            >
                                                <Clock className="h-4 w-4" />
                                                <span>Lihat Timeline</span>
                                            </Dropdown.Link>
                                        )}
                                    </div>
                                </Dropdown>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={8} className="border border-border-default px-4 py-8 text-center text-text-secondary">
                                Tidak ada data jadwal definitif.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DefinitifTable;
