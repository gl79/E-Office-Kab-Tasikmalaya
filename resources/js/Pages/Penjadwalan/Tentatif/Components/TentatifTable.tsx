import React from 'react';
import { Button, Dropdown, Badge } from '@/Components/ui';
import { MoreVertical, CheckCircle, FileText, Trash2, Clock } from 'lucide-react';
import { formatDateShort, getSifatBadge } from '@/utils';
import type { Agenda } from '@/types/penjadwalan';

interface Props {
    data: Agenda[];
    onTindakLanjut: (agenda: Agenda) => void;
    onViewDetail: (agenda: Agenda) => void;
    onDelete: (agenda: Agenda) => void;
    onDisposisi: (agenda: Agenda) => void;
    onViewTimeline: (agenda: Agenda) => void;
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

const getWorkflowStatusVariant = (status?: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
        case 'Masuk Jadwal Tentatif':
            return 'warning';
        case 'Sudah Didisposisi':
            return 'info';
        case 'Jadwal Definitif':
            return 'primary';
        case 'Selesai':
            return 'success';
        default:
            return 'default';
    }
};

const isDisposedStatus = (status?: string): boolean => {
    return status === 'Sudah Didisposisi' || status === 'Sudah Disposisi';
};

const getDisposisiRecipientLabel = (item: Agenda): string | null => {
    const fromStatus = item.status_tindak_lanjut_disposisi_ke?.trim();
    if (fromStatus) {
        return fromStatus;
    }

    const fromAttend = item.dihadiri_oleh?.trim();
    return fromAttend || null;
};

const getWorkflowStatusLabel = (item: Agenda): string => {
    const status = item.status_tindak_lanjut ?? item.status_formal_label ?? item.status_label ?? '-';

    if (isDisposedStatus(status)) {
        const recipient = getDisposisiRecipientLabel(item);
        return recipient ? `Sudah Disposisi Ke ${recipient}` : 'Sudah Disposisi';
    }

    return status;
};

const TentatifTable: React.FC<Props> = ({
    data,
    onTindakLanjut,
    onViewDetail,
    onDelete,
    onDisposisi,
    onViewTimeline,
    currentPage,
    itemsPerPage,
    search,
    sifatOptions,
}) => {
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
                                    <Badge variant={getWorkflowStatusVariant(item.status_tindak_lanjut)}>
                                        {getWorkflowStatusLabel(item)}
                                    </Badge>
                                    {item.dihadiri_oleh && !isDisposedStatus(item.status_tindak_lanjut) && (
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
                                        {/* Tindak Lanjut Action */}
                                        {item.can_tindak_lanjut && (
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => onTindakLanjut(item)}
                                                className="w-full justify-center bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white border-transparent"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Tindak Lanjut
                                            </Button>
                                        )}

                                        {/* Disposisi Action */}
                                        {item.can_disposisi && item.surat_masuk && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => onDisposisi(item)}
                                                className="w-full justify-center"
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                Disposisi
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

                                            {item.surat_masuk && (
                                                <Dropdown.Link
                                                    as="button"
                                                    onClick={() => onViewTimeline(item)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Clock className="h-4 w-4" />
                                                    <span>Lihat Timeline</span>
                                                </Dropdown.Link>
                                            )}

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
