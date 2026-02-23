import React from 'react';
import { Button, Dropdown, Badge } from '@/Components/ui';
import { Clock, MapPin, User, MoreVertical, Pencil, CheckCircle, FileText, Trash2 } from 'lucide-react';
import { getDisposisiVariant, getDisposisiLabel } from '@/utils/badgeVariants';
import type { Agenda } from '@/types/penjadwalan';

interface Props {
    data: Agenda[];
    onEditKehadiran: (agenda: Agenda) => void;
    onJadikanDefinitif: (agenda: Agenda) => void;
    onViewDetail: (agenda: Agenda) => void;
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
                        <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase w-56">Aksi</th>
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
                            <td className="px-4 py-3 text-center align-middle">
                                <div className="mx-auto flex w-full max-w-[220px] flex-col items-center gap-2">
                                    <div className="flex w-full flex-col items-center gap-2">
                                        {item.can_edit_kehadiran && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => onEditKehadiran(item)}
                                                className="w-full justify-center"
                                            >
                                                <Pencil className="h-4 w-4 mr-1" />
                                                Atur Kehadiran
                                            </Button>
                                        )}

                                        {item.status_disposisi !== 'menunggu' && (
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => onJadikanDefinitif(item)}
                                                className="w-full justify-center"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Jadikan Definitif
                                            </Button>
                                        )}
                                    </div>

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
                                                <FileText className="h-4 w-4" />
                                                <span>Lihat Detail</span>
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
