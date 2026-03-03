import React from 'react';
import { Button, Dropdown, Badge } from '@/Components/ui';
import { MoreVertical, Pencil, CheckCircle, FileText, Trash2 } from 'lucide-react';
import { getDisposisiVariant, getDisposisiLabel } from '@/utils/badgeVariants';
import { formatDateShort, getSifatBadge } from '@/utils';
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
    sifatOptions: Record<string, string>;
}

const formatNoAgenda = (nomor?: string) => {
    if (!nomor) return '-';
    const parts = nomor.split('/');
    return parts.length >= 2 ? parts[1] : nomor;
};

const TentatifTable: React.FC<Props> = ({
    data,
    onEditKehadiran,
    onJadikanDefinitif,
    onViewDetail,
    onDelete,
    currentPage,
    itemsPerPage,
    search,
    sifatOptions,
}) => {
    const renderDisposisiBadge = (status: string) => (
        <Badge variant={getDisposisiVariant(status)}>{getDisposisiLabel(status)}</Badge>
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-border-default">
                <thead className="bg-surface-hover">
                    <tr>
                        <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase w-12">No</th>
                        <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">No Agenda</th>
                        <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase"><div>Tanggal</div><div>Diterima</div></th>
                        <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase"><div>Tgl Surat</div><div>No Surat</div></th>
                        <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Asal Surat</th>
                        <th className="border border-border-default px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase">Perihal</th>
                        <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">Sifat</th>
                        <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">Status</th>
                        <th className="border border-border-default px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase w-56">Aksi</th>
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
                            <td className="border border-border-default px-4 py-3 text-text-secondary text-sm">
                                {item.surat_masuk?.tanggal_diterima
                                    ? formatDateShort(item.surat_masuk.tanggal_diterima)
                                    : '-'}
                            </td>
                            <td className="border border-border-default px-4 py-3 text-sm">
                                <div className="font-medium text-text-primary">
                                    {item.surat_masuk?.tanggal_surat
                                        ? formatDateShort(item.surat_masuk.tanggal_surat)
                                        : '-'}
                                </div>
                                <div className="text-text-secondary text-xs">
                                    {item.surat_masuk?.nomor_surat || '-'}
                                </div>
                            </td>
                            <td className="border border-border-default px-4 py-3 text-text-primary text-sm">
                                {item.surat_masuk?.asal_surat || '-'}
                            </td>
                            <td className="border border-border-default px-4 py-3 text-text-primary text-sm">
                                <span className="line-clamp-2">{item.surat_masuk?.perihal || '-'}</span>
                            </td>
                            <td className="border border-border-default px-4 py-3 text-center">
                                {item.surat_masuk?.sifat
                                    ? getSifatBadge(item.surat_masuk.sifat, sifatOptions)
                                    : '-'}
                            </td>
                            <td className="border border-border-default px-4 py-3 text-center">
                                <div className="flex flex-col gap-1 items-center">
                                    {renderDisposisiBadge(item.status_disposisi)}
                                    {item.dihadiri_oleh && (
                                        <div className="text-xs text-text-secondary">
                                            {item.dihadiri_oleh}
                                        </div>
                                    )}
                                    {item.sumber_jadwal && item.sumber_jadwal !== 'disposisi' && (
                                        <div className="text-[10px] text-text-muted italic">
                                            {item.sumber_jadwal_label}
                                        </div>
                                    )}
                                </div>
                            </td>
                            {/* Kolom Aksi — tidak diubah */}
                            <td className="border border-border-default px-4 py-3 text-center align-middle">
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

                                        {item.can_edit_kehadiran && item.status_disposisi !== 'menunggu' && (
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
                            <td colSpan={9} className="border border-border-default px-4 py-8 text-center text-text-secondary">
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
