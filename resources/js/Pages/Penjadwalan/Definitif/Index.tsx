import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';
import { Trash2, ExternalLink, Filter, RotateCcw, CalendarPlus } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Badge, ConfirmDialog } from '@/Components/ui';
import { TextInput, FormSelect } from '@/Components/form';
import { useMemoryCache } from '@/hooks/useMemoryCache';
import { getDisposisiVariant, getDisposisiLabel } from '@/utils/badgeVariants';
import { formatDateShort, getSifatBadge } from '@/utils';
import type { PageProps } from '@/types';
import type { Agenda, CalendarEvent } from '@/types/penjadwalan';

interface Props extends PageProps {
    disposisiOptions: Record<string, string>;
    sifatOptions: Record<string, string>;
}

const CACHE_TTL_MS = 60_000;

const formatNoAgenda = (nomor?: string) => {
    if (!nomor) return '-';
    const parts = nomor.split('/');
    return parts.length >= 2 ? parts[1] : nomor;
};

const DefinitifIndex = ({ disposisiOptions, sifatOptions }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const cacheKey = `penjadwalan_definitif_${auth.user.id}`;
    const { read, write } = useMemoryCache<CalendarEvent[]>(cacheKey, CACHE_TTL_MS);
    const cachedEvents = read();

    // State — all events from API (unfiltered)
    const [allEvents, setAllEvents] = useState<CalendarEvent[]>(() => cachedEvents ?? []);
    const [isLoading, setIsLoading] = useState(cachedEvents === null);

    // Client-side filter state — instant, no delay, no URL change
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Date range ref
    const dateRangeRef = useRef<{ start?: string; end?: string }>({});
    const hasFetched = useRef(false);

    // Fetch ALL events from API (no search/status filters — those are client-side)
    const fetchEvents = useCallback(async (start?: string, end?: string) => {
        if (!hasFetched.current) {
            setIsLoading(true);
        }
        try {
            const params = new URLSearchParams();
            if (start) params.append('start', start);
            if (end) params.append('end', end);

            const response = await fetch(`${route('penjadwalan.definitif.calendar-data')}?${params.toString()}`);
            const data = await response.json();
            setAllEvents(data);
            write(data);
            hasFetched.current = true;
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
        } finally {
            setIsLoading(false);
        }
    }, [write]);

    // Initial load
    useEffect(() => {
        fetchEvents(dateRangeRef.current.start, dateRangeRef.current.end);
    }, [fetchEvents]);

    // Handle date range change (only time we re-fetch from API)
    const handleDatesSet = (dateInfo: { startStr: string; endStr: string }) => {
        dateRangeRef.current = { start: dateInfo.startStr, end: dateInfo.endStr };
        fetchEvents(dateInfo.startStr, dateInfo.endStr);
    };

    // Client-side filtering — instant, no delay, no URL change (like Surat Masuk)
    const filteredEvents = useMemo(() => {
        let events = allEvents;

        if (search) {
            const lowerSearch = search.toLowerCase();
            events = events.filter((event) => {
                const agenda = event.extendedProps?.agenda;
                return (
                    event.title?.toLowerCase().includes(lowerSearch) ||
                    agenda?.surat_masuk?.nomor_surat?.toLowerCase().includes(lowerSearch) ||
                    agenda?.surat_masuk?.asal_surat?.toLowerCase().includes(lowerSearch) ||
                    agenda?.surat_masuk?.perihal?.toLowerCase().includes(lowerSearch) ||
                    agenda?.surat_masuk?.nomor_agenda?.toLowerCase().includes(lowerSearch) ||
                    agenda?.tempat?.toLowerCase().includes(lowerSearch)
                );
            });
        }

        if (statusFilter) {
            events = events.filter((event) =>
                event.extendedProps?.status_disposisi === statusFilter
            );
        }

        return events;
    }, [allEvents, search, statusFilter]);

    // Handle event click
    const handleEventClick = (info: unknown) => {
        const eventInfo = info as { event: { extendedProps: Record<string, unknown> } };
        const agenda = eventInfo.event.extendedProps.agenda as Agenda;
        setSelectedAgenda(agenda);
        setShowDetailModal(true);
    };

    // Handle delete
    const handleDelete = () => {
        if (!selectedAgenda) return;
        setIsDeleting(true);

        router.delete(route('penjadwalan.definitif.destroy', selectedAgenda.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                setShowDetailModal(false);
                setSelectedAgenda(null);
                fetchEvents(dateRangeRef.current.start, dateRangeRef.current.end);
            },
        });
    };

    const hasActiveFilters = !!(search || statusFilter);

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
    };

    const renderDisposisiBadge = (status: string) => (
        <Badge variant={getDisposisiVariant(status)}>{getDisposisiLabel(status)}</Badge>
    );

    const disposisiSelectOptions = [
        { value: '', label: 'Semua Status' },
        ...Object.entries(disposisiOptions).map(([value, label]) => ({
            value,
            label,
        })),
    ];

    const sm = selectedAgenda?.surat_masuk;
    const suratMasukId = sm?.id;
    const suratFilePath = sm?.file_path ?? null;
    const suratPreviewUrl = suratMasukId
        ? route('persuratan.surat-masuk.preview', suratMasukId)
        : null;
    const suratDownloadUrl = suratMasukId
        ? route('persuratan.surat-masuk.download', suratMasukId)
        : null;
    const isPdfFile = !!suratFilePath && /\.(pdf)$/i.test(suratFilePath);
    const isImageFile = !!suratFilePath && /\.(jpe?g|png|webp)$/i.test(suratFilePath);

    return (
        <>
            <Head title="Jadwal Definitif" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Jadwal Definitif</h1>
                <p className="text-text-secondary text-sm mt-1">Jadwal yang sudah pasti dan terkonfirmasi</p>
            </div>

            <div className="bg-surface border border-border-default rounded-lg">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            {/* Legend */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <span className="text-sm text-text-secondary">Bupati</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                    <span className="text-sm text-text-secondary">Wakil Bupati</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                                    <span className="text-sm text-text-secondary">Diwakilkan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-border-dark"></div>
                                    <span className="text-sm text-text-secondary">Lainnya</span>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                {(auth.user?.role === 'pejabat' || auth.user?.role === 'superadmin') && (
                                    <Link href={route('bupati.jadwal.custom')}>
                                        <Button className="flex items-center gap-2 whitespace-nowrap">
                                            <CalendarPlus className="h-4 w-4" />
                                            Jadwal Custom
                                        </Button>
                                    </Link>
                                )}
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Filter className={`h-4 w-4 ${showFilters ? 'text-primary' : ''}`} />
                                    Filter
                                    {hasActiveFilters && (
                                        <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-text-inverse">
                                            {(search ? 1 : 0) + (statusFilter ? 1 : 0)}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Expandable Filter Panel */}
                        {showFilters && (
                            <div className="p-4 bg-surface-hover rounded-lg border border-border-default animate-in fade-in slide-in-from-top-2 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">
                                            Pencarian
                                        </label>
                                        <TextInput
                                            type="text"
                                            placeholder="Cari kegiatan, nomor surat, lokasi..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full px-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">
                                            Status Disposisi
                                        </label>
                                        <FormSelect
                                            options={disposisiSelectOptions}
                                            value={statusFilter}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                                            placeholder="Semua Status"
                                            className="w-full px-2 text-sm"
                                        />
                                    </div>
                                </div>
                                {hasActiveFilters && (
                                    <div className="flex justify-end">
                                        <Button variant="secondary" size="sm" onClick={handleResetFilters} className="gap-2">
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            Reset Filter
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Calendar Container */}
                <div className="p-4 relative">
                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-surface/75 flex items-center justify-center z-10 rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    <div className="relative">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                            buttonText={{
                                today: 'Hari Ini',
                                month: 'Bulan',
                                week: 'Minggu',
                                day: 'Hari',
                            }}
                            locale="id"
                            events={filteredEvents as EventInput[]}
                            eventClick={handleEventClick}
                            datesSet={handleDatesSet}
                            height="auto"
                            contentHeight={600}
                            eventDisplay="block"
                            dayMaxEvents={3}
                            moreLinkText={(num) => `+${num} lagi`}
                            noEventsText="Tidak ada jadwal"
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Detail Modal — Full Surat Masuk Details */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Jadwal Definitif"
                size="2xl"
            >
                {selectedAgenda && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Kolom Kiri - Informasi */}
                        <div className="space-y-5 overflow-y-auto max-h-[70vh] pr-1">
                            {/* Identitas Surat */}
                            <div>
                                <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Identitas Surat</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-text-secondary">Tanggal Surat</p>
                                        <p className="font-medium text-text-primary">{sm?.tanggal_surat ? formatDateShort(sm.tanggal_surat) : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Asal Surat</p>
                                        {sm?.asal_surat ? (
                                            <Badge variant="primary" className="mt-1">{sm.asal_surat}</Badge>
                                        ) : (
                                            <p className="font-medium text-text-primary">-</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Nomor Surat</p>
                                        <p className="font-medium text-text-primary">{sm?.nomor_surat || '-'}</p>
                                    </div>
                                    {sm?.jenis_surat ? (
                                        <div>
                                            <p className="text-sm text-text-secondary">Jenis Surat</p>
                                            <p className="font-medium text-text-primary">{sm.jenis_surat.nama}</p>
                                        </div>
                                    ) : <div />}
                                    <div>
                                        <p className="text-sm text-text-secondary">Sifat Surat</p>
                                        {sm?.sifat ? getSifatBadge(sm.sifat, sifatOptions) : <p className="font-medium text-text-primary">-</p>}
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Lampiran</p>
                                        <p className="font-medium text-text-primary">{sm?.lampiran || 0} berkas</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Perihal</p>
                                        <p className="font-medium text-text-primary">{sm?.perihal || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Kepada (Tujuan Surat)</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {sm?.tujuans?.length ? (
                                                sm.tujuans.map((t) => (
                                                    <Badge key={t.id} variant="primary" size="sm">
                                                        {t.tujuan}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="font-medium text-text-primary">-</p>
                                            )}
                                        </div>
                                    </div>
                                    {sm?.isi_ringkas && (
                                        <div className="sm:col-span-2">
                                            <p className="text-sm text-text-secondary">Isi Ringkas Surat</p>
                                            <p className="font-medium text-text-primary">{sm.isi_ringkas}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Identitas Agenda */}
                            <div className="pt-4 border-t border-border-default">
                                <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Identitas Agenda</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-text-secondary">Tanggal Diterima</p>
                                        <p className="font-medium text-text-primary">{sm?.tanggal_diterima ? formatDateShort(sm.tanggal_diterima) : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">No Agenda</p>
                                        <p className="font-medium text-text-primary">{formatNoAgenda(sm?.nomor_agenda)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Indeks Surat</p>
                                        <p className="font-medium text-text-primary">
                                            {sm?.indeks_berkas
                                                ? `${sm.indeks_berkas.kode} - ${sm.indeks_berkas.nama}`
                                                : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Kode Klasifikasi</p>
                                        <p className="font-medium text-text-primary">
                                            {sm?.kode_klasifikasi
                                                ? `${sm.kode_klasifikasi.kode} - ${sm.kode_klasifikasi.nama}`
                                                : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Staff Pengolah</p>
                                        <p className="font-medium text-text-primary">{sm?.staff_pengolah?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Tanggal Diteruskan</p>
                                        <p className="font-medium text-text-primary">
                                            {sm?.tanggal_diteruskan ? formatDateShort(sm.tanggal_diteruskan) : '-'}
                                        </p>
                                    </div>
                                    {sm?.catatan_tambahan && (
                                        <div className="sm:col-span-2">
                                            <p className="text-sm text-text-secondary">Catatan Tambahan</p>
                                            <p className="font-medium text-text-primary">{sm.catatan_tambahan}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detail Jadwal */}
                            <div className="pt-4 border-t border-border-default">
                                <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Detail Jadwal</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="sm:col-span-2">
                                        <p className="text-text-secondary">Kegiatan</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.nama_kegiatan}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Tanggal</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.tanggal_format_indonesia}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Waktu</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.waktu_lengkap} WIB</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Lokasi</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.tempat}</p>
                                    </div>
                                    {selectedAgenda.keterangan && (
                                        <div>
                                            <p className="text-text-secondary">Keterangan</p>
                                            <p className="font-medium text-text-primary">{selectedAgenda.keterangan}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="pt-4 border-t border-border-default">
                                <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Status</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-secondary">Status Jadwal:</span>
                                        <Badge variant="success">
                                            {selectedAgenda.status_formal_label ?? selectedAgenda.status_label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-secondary">Disposisi:</span>
                                        {renderDisposisiBadge(selectedAgenda.status_disposisi)}
                                    </div>
                                    {selectedAgenda.dihadiri_oleh && (
                                        <p className="text-sm text-text-primary">
                                            <span className="text-text-secondary">Dihadiri:</span>{' '}
                                            <span className="font-medium">{selectedAgenda.dihadiri_oleh}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Audit Info */}
                            {sm?.created_by && (
                                <div className="pt-4 border-t border-border-default">
                                    <p className="text-xs text-text-secondary">
                                        Diinput oleh <span className="font-medium text-text-primary">{sm.created_by.name}</span>
                                        {sm.created_at && ` pada ${formatDateShort(sm.created_at)}`}
                                    </p>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-4 border-t border-border-default">
                                <Button
                                    variant="danger"
                                    onClick={() => setDeleteModalOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus Jadwal
                                </Button>
                            </div>
                        </div>

                        {/* Kolom Kanan - Preview PDF */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-text-primary">Preview Surat</h4>
                                {suratPreviewUrl && (
                                    <a
                                        href={suratPreviewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Buka di tab baru
                                    </a>
                                )}
                            </div>
                            <div className="bg-surface-hover rounded-lg border border-border-default overflow-hidden flex-1">
                                {!suratFilePath || !suratPreviewUrl ? (
                                    <div className="flex items-center justify-center h-[560px]">
                                        <p className="text-text-secondary text-sm">File surat tidak tersedia</p>
                                    </div>
                                ) : isPdfFile ? (
                                    <iframe
                                        src={suratPreviewUrl}
                                        className="w-full h-[640px]"
                                        title="Preview Surat"
                                        style={{ border: 'none' }}
                                    />
                                ) : isImageFile ? (
                                    <div className="p-4">
                                        <img
                                            src={suratPreviewUrl}
                                            alt="Preview Surat"
                                            className="w-full h-auto max-h-[640px] object-contain rounded border border-border-default bg-surface"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[560px] gap-2 px-4 text-center">
                                        <p className="text-text-secondary text-sm">
                                            Preview tidak tersedia untuk format file ini.
                                        </p>
                                        {suratDownloadUrl && (
                                            <a
                                                href={suratDownloadUrl}
                                                className="text-primary text-sm hover:underline"
                                            >
                                                Download File
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                type="delete"
                message={
                    <p>
                        Apakah Anda yakin ingin menghapus jadwal{' '}
                        <strong>{selectedAgenda?.nama_kegiatan}</strong>?
                        Data akan dipindahkan ke arsip.
                    </p>
                }
                isLoading={isDeleting}
            />
        </>
    );
};

DefinitifIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default DefinitifIndex;
