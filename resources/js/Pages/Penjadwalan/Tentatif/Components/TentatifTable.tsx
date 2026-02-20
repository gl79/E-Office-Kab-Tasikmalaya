import React from 'react';
import { Button, Dropdown, Badge } from '@/Components/ui';
import { Clock, MapPin, User, MoreVertical, Pencil, CheckCircle, FileText, MessageCircle, Trash2 } from 'lucide-react';
import { getDisposisiVariant, getDisposisiLabel } from '@/utils/badgeVariants';
import type { Agenda } from '@/types/penjadwalan';

interface Props {
    data: Agenda[];
    onEditKehadiran: (agenda: Agenda) => void;
    onJadikanDefinitif: (agenda: Agenda) => void;
    onViewDetail: (agenda: Agenda) => void;
    onExportWhatsApp: (agenda: Agenda) => void;
    onDelete: (agenda: Agenda) => void;
    currentPage: number;
    itemsPerPage: number;
    search: string;
}

const TentatifTable: React.FC<Props> = ({
    data,
    onEditKehadiran,
    onJadikanDefinitif,
    onViewDetail,
    onExportWhatsApp,
    onDelete,
    currentPage,
    itemsPerPage,
    search
}) => {
    const renderDisposisiBadge = (status: string) => (
        <Badge variant={getDisposisiVariant(status)}>{getDisposisiLabel(status)}</Badge>
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-default">
                <thead className="bg-surface-hover">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-12">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Tanggal/Waktu</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Kegiatan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Surat Masuk</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status Disposisi</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase w-56">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border-default">
                    {data.map((item, index) => (
                        <tr key={item.id} className="hover:bg-surface-hover">
                            <td className="px-4 py-3 text-text-secondary text-sm">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-4 py-3">
                                <div className="font-medium text-text-primary text-sm">{item.hari}</div>
                                <div className="text-sm text-text-secondary">{item.tanggal_agenda_formatted}</div>
                                <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3" />
                                    {item.waktu_lengkap}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-text-primary line-clamp-2">{item.nama_kegiatan}</div>
                                <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="line-clamp-1">{item.tempat}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-text-primary">{item.surat_masuk?.nomor_surat || '-'}</div>
                                <div className="text-xs text-text-secondary line-clamp-1">{item.surat_masuk?.asal_surat || '-'}</div>
                                {item.surat_masuk?.perihal && (
                                    <div className="text-xs text-text-secondary italic line-clamp-1">{item.surat_masuk.perihal}</div>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <div className="flex flex-col gap-1 items-start">
                                    {renderDisposisiBadge(item.status_disposisi)}
                                    {item.dihadiri_oleh && (
                                        <div className="text-xs text-text-secondary flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {item.dihadiri_oleh}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    {/* Atur Kehadiran – tersedia bagi pembuat jadwal */}
                                    {item.can_edit_kehadiran && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => onEditKehadiran(item)}
                                        >
                                            <Pencil className="h-4 w-4 mr-1" />
                                            Atur Kehadiran
                                        </Button>
                                    )}

                                    {/* Jadikan Definitif – tersedia ketika sudah ada disposisi */}
                                    {item.status_disposisi !== 'menunggu' && (
                                        <Button
                                            size="sm"
                                            variant="success"
                                            onClick={() => onJadikanDefinitif(item)}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Definitif
                                        </Button>
                                    )}

                                    {/* Dropdown aksi lainnya */}
                                    <Dropdown
                                        align="right"
                                        width="48"
                                        trigger={
                                            <button className="p-1 hover:bg-surface-hover rounded-full transition-colors text-text-secondary">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        }
                                    >
                                        <div className="py-1">
                                            <Dropdown.Link
                                                as="button"
                                                onClick={() => onViewDetail(item)}
                                                className="flex items-center gap-2"
                                            >
                                                <FileText className="h-4 w-4" />
                                                <span>Lihat Detail</span>
                                            </Dropdown.Link>

                                            <Dropdown.Link
                                                as="button"
                                                onClick={() => onExportWhatsApp(item)}
                                                className="flex items-center gap-2"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                <span>Export WhatsApp</span>
                                            </Dropdown.Link>

                                            <div className="border-t border-border-default my-1"></div>

                                            <Dropdown.Link
                                                as="button"
                                                onClick={() => onDelete(item)}
                                                className="flex items-center gap-2 text-danger hover:bg-danger-light focus:bg-danger-light"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>Hapus</span>
                                            </Dropdown.Link>
                                        </div>
                                    </Dropdown>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                                {search ? 'Tidak ada data yang cocok.' : 'Tidak ada jadwal tentatif.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TentatifTable;
