import React from 'react';
import { Button, Dropdown, Badge } from '@/Components/ui';
import { CalendarPlus, Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { getPenjadwalanStatusVariant, getPenjadwalanStatusLabel } from '@/utils/badgeVariants';
import { formatDateShort } from '@/utils/dateFormatter';
import type { SuratMasuk, Agenda } from '@/types/penjadwalan';

interface Props {
    data: SuratMasuk[];
    activeTab: 'belum' | 'sudah';
    onJadwalkan: (surat: SuratMasuk) => void;
    onEditJadwal: (surat: SuratMasuk) => void;
    onDeleteJadwal: (agenda: Agenda) => void;
    currentPage: number;
    itemsPerPage: number;
    search: string;
}

const JadwalTable: React.FC<Props> = ({
    data,
    activeTab,
    onJadwalkan,
    onEditJadwal,
    onDeleteJadwal,
    currentPage,
    itemsPerPage,
    search
}) => {
    const renderStatusBadge = (status: string) => (
        <Badge variant={getPenjadwalanStatusVariant(status)}>{getPenjadwalanStatusLabel(status)}</Badge>
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-default">
                <thead className="bg-surface-hover">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-12">No</th>
                        {activeTab === 'belum' ? (
                            <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Tgl Diterima</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nomor Surat</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Asal Surat</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Perihal</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-32">Aksi</th>
                            </>
                        ) : (
                            <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Agenda</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nomor Surat</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Asal Surat</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase w-10"></th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border-default">
                    {data.map((item, index) => (
                        <tr key={item.id} className="hover:bg-surface-hover">
                            <td className="px-4 py-3 text-text-secondary text-sm">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            {activeTab === 'belum' ? (
                                <>
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {formatDateShort(item.tanggal_diterima)}
                                    </td>
                                    <td className="px-4 py-3 text-text-primary text-sm font-medium">
                                        {item.nomor_surat}
                                    </td>
                                    <td className="px-4 py-3 text-text-primary text-sm">
                                        {item.asal_surat}
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        <div className="line-clamp-2" title={item.perihal}>
                                            {item.perihal}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button
                                            size="sm"
                                            onClick={() => onJadwalkan(item)}
                                        >
                                            <CalendarPlus className="h-4 w-4 mr-1" />
                                            Jadwalkan
                                        </Button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-4 py-3 text-text-primary text-sm">
                                        <div className="font-medium">{item.agenda?.nama_kegiatan || '-'}</div>
                                        <div className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {item.agenda?.tanggal_agenda ? formatDateShort(item.agenda.tanggal_agenda) : '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-text-primary text-sm">
                                        {item.nomor_surat}
                                    </td>
                                    <td className="px-4 py-3 text-text-primary text-sm">
                                        {item.asal_surat}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.agenda ? renderStatusBadge(item.agenda.status) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
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
                                                    onClick={() => onEditJadwal(item)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span>Edit Jadwal</span>
                                                </Dropdown.Link>

                                                <div className="border-t border-border-default my-1"></div>

                                                <Dropdown.Link
                                                    as="button"
                                                    onClick={() => {
                                                        if (item.agenda) {
                                                            onDeleteJadwal(item.agenda);
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 text-danger hover:bg-danger-light focus:bg-danger-light"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Hapus</span>
                                                </Dropdown.Link>
                                            </div>
                                        </Dropdown>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                                {search ? 'Tidak ada data yang cocok dengan pencarian.' : 'Data tidak ditemukan.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default JadwalTable;
