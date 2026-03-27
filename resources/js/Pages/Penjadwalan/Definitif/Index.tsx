import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';
import { Trash2, ExternalLink, Filter, RotateCcw, CalendarPlus, List, Calendar as CalendarIcon } from 'lucide-react';
import MapPreview from '@/Components/maps/MapPreview';
import TimelineModal from '@/Components/persuratan/TimelineModal';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Badge, ConfirmDialog, Pagination } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import { useMemoryCache } from '@/hooks/useMemoryCache';
import { formatDateShort, getSifatBadge } from '@/utils';
import type { PageProps } from '@/types';
import type { Agenda, CalendarEvent } from '@/types/penjadwalan';
import type { SuratMasuk } from '@/types/persuratan';
import DefinitifTable from './Components/DefinitifTable';

interface Props extends PageProps {
    sifatOptions: Record<string, string>;
}

const CACHE_TTL_MS = 60_000;

const formatNoAgenda = (nomor?: string) => {
    if (!nomor) return '-';
    const parts = nomor.split('/');
    return parts.length >= 2 ? parts[1] : nomor;
};

const formatTimeNoSeconds = (time?: string | null) => {
    if (!time) return '';
    return time.length >= 5 ? time.slice(0, 5) : time;
};

const isDisposedStatus = (status?: string): boolean => {
    return status === 'Sudah Didisposisi' || status === 'Sudah Disposisi';
};

const getDisposisiRecipientLabel = (agenda: Agenda): string | null => {
    const fromStatus = agenda.status_tindak_lanjut_disposisi_ke?.trim();
    if (fromStatus) {
        return fromStatus;
    }

    const fromSuratStatus = agenda.surat_masuk?.status_tindak_lanjut_disposisi_ke?.trim();
    if (fromSuratStatus) {
        return fromSuratStatus;
    }

    return null;
};

const getWorkflowStatusLabel = (agenda: Agenda): string => {
    const status = agenda.status_tindak_lanjut ?? agenda.status_formal_label ?? agenda.status_label ?? '-';

    if (isDisposedStatus(status)) {
        const recipient = getDisposisiRecipientLabel(agenda);
        return recipient ? `Sudah Disposisi Ke ${recipient}` : 'Sudah Disposisi';
    }

    return status;
};

const getDetailedStatusVariant = (agenda: Agenda): 'success' | 'info' | 'primary' | 'warning' | 'default' => {
    if (agenda.tanggal_agenda) {
        const dateAgenda = new Date(agenda.tanggal_agenda);
        const today = new Date();
        
        // Reset waktu agar komparasi hanya berdasarkan tanggal (Y-m-d)
        dateAgenda.setHours(0, 0, 0, 0);
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (dateAgenda.getTime() < todayDate.getTime()) {
            return 'default';
        } else if (dateAgenda.getTime() === todayDate.getTime()) {
            return 'success';
        } else {
            return 'info';
        }
    }
    return 'primary';
};

const getDetailedStatusLabel = (agenda: Agenda): string => {
    if (agenda.tanggal_agenda) {
        const dateAgenda = new Date(agenda.tanggal_agenda);
        const today = new Date();
        
        // Reset waktu agar komparasi hanya berdasarkan tanggal (Y-m-d)
        dateAgenda.setHours(0, 0, 0, 0);
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (dateAgenda.getTime() < todayDate.getTime()) {
            return 'Sudah Dilaksanakan / Selesai';
        } else {
            return 'Belum Beres / Akan Dilaksanakan';
        }
    }

    const status = getWorkflowStatusLabel(agenda);

    if (status === 'Selesai') {
        return 'Selesai (Kegiatan Telah Dilaksanakan)';
    }

    if (status === 'Jadwal Definitif') {
        return 'Telah Dijadwalkan (Menunggu Pelaksanaan)';
    }

    if (status === 'Masuk Jadwal Tentatif') {
        return 'Masuk Jadwal Tentatif (Menunggu Tindak Lanjut)';
    }

    return status;
};

const DefinitifIndex = ({ sifatOptions }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const initialCalendarDate = useMemo(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const date = new URLSearchParams(window.location.search).get('date');
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return undefined;
        }

        return date;
    }, []);
    const canUseCustomSchedule = auth.user?.role === 'pejabat' && [1, 2, 3].includes(auth.user?.jabatan_level ?? -1);
    const cacheKey = `penjadwalan_definitif_${auth.user.id}`;
    const { read, write } = useMemoryCache<CalendarEvent[]>(cacheKey, CACHE_TTL_MS);
    const cachedEvents = read();

    // State — all events from API (unfiltered)
    const [allEvents, setAllEvents] = useState<CalendarEvent[]>(() => cachedEvents ?? []);
    const [isLoading, setIsLoading] = useState(cachedEvents === null);

    // View state
    const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar');

    // Client-side filter state — instant, no delay, no URL change
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination for list view
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Timeline Modal States
    const [timelineModalOpen, setTimelineModalOpen] = useState(false);
    const [timelineSurat, setTimelineSurat] = useState<SuratMasuk | null>(null);

    const mapAgendaSuratForTimeline = (agenda: Agenda): SuratMasuk | null => {
        if (!agenda.surat_masuk) return null;
        const surat = agenda.surat_masuk;
        return {
            ...surat,
            id: surat.id,
            nomor_agenda: surat.nomor_agenda ?? '',
            tanggal_diterima: surat.tanggal_diterima ?? '',
            tanggal_surat: surat.tanggal_surat ?? '',
            asal_surat: surat.asal_surat ?? '-',
            nomor_surat: surat.nomor_surat ?? '-',
            sifat: surat.sifat ?? '',
            perihal: surat.perihal ?? '',
        } as SuratMasuk;
    };

    // Date range ref
    const dateRangeRef = useRef<{ start?: string; end?: string }>({});
    const hasFetched = useRef(false);

    // Fetch events from API — always fetches ALL definitif data
    const fetchEvents = useCallback(async () => {
        if (!hasFetched.current) {
            setIsLoading(true);
        }
        try {
            const response = await fetch(route('penjadwalan.definitif.calendar-data', undefined, false));
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

    // Initial load - if starting with list view, fetch all. 
    // If starting with calendar, fetch will be triggered by handleDatesSet
    useEffect(() => {
        if (!hasFetched.current) {
            fetchEvents();
        }
    }, [fetchEvents]);

    // Handle date range change — just track the current range, data is always complete
    const handleDatesSet = (dateInfo: { startStr: string; endStr: string }) => {
        dateRangeRef.current = { start: dateInfo.startStr, end: dateInfo.endStr };
        // No need to fetch here if we fetch on mount
    };

    // Client-side filtering — instant, no delay, no URL change
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

        // Sort by date descending for list view
        if (activeView === 'list') {
            return [...events].sort((a, b) => {
                return (b.start as string).localeCompare(a.start as string);
            });
        }

        return events;
    }, [allEvents, search, activeView]);

    // Paginated events for list view
    const paginatedEvents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredEvents.slice(start, start + itemsPerPage);
    }, [filteredEvents, currentPage]);

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

    // Handle event click (Calendar)
    const handleEventClick = (info: unknown) => {
        const eventInfo = info as { event: { extendedProps: Record<string, unknown> } };
        const agenda = eventInfo.event.extendedProps.agenda as Agenda;
        setSelectedAgenda(agenda);
        setShowDetailModal(true);
    };

    // Handle view detail (List Table)
    const handleViewDetail = (agenda: Agenda) => {
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
                
                // Refresh data
                fetchEvents();
            },
        });
    };

    const hasActiveFilters = !!search;

    const handleResetFilters = () => {
        setSearch('');
    };

    const formatAgendaTime = (agenda: Agenda) => {
        const mulai = formatTimeNoSeconds(agenda.waktu_mulai);
        const selesai = formatTimeNoSeconds(agenda.waktu_selesai);

        if (!mulai) {
            return '-';
        }

        if (agenda.sampai_selesai) {
            return `${mulai} WIB - Sampai Dengan Selesai`;
        }

        if (selesai) {
            return `${mulai} WIB - ${selesai} WIB`;
        }

        return `${mulai} WIB - Sampai Dengan Selesai`;
    };

    const sm = selectedAgenda?.surat_masuk;
    const suratMasukId = sm?.id;
    const suratFilePath = sm?.file_path ?? null;
    const suratPreviewUrl = suratMasukId
        ? route('persuratan.surat-masuk.preview', suratMasukId)
        : null;
    const suratDownloadUrl = suratMasukId
        ? route('persuratan.surat-masuk.download', suratMasukId)
        : null;

    // Determine the actual file to preview (Surat vs Custom Jadwal)
    const activeFilePath = selectedAgenda?.file_path ?? suratFilePath;
    const activePreviewUrl = selectedAgenda?.file_url ?? suratPreviewUrl;
    const activeDownloadUrl = selectedAgenda?.file_url ?? suratDownloadUrl;

    const isPdfFile = !!activeFilePath && /\.(pdf)$/i.test(activeFilePath);
    const isImageFile = !!activeFilePath && /\.(jpe?g|png|webp)$/i.test(activeFilePath);

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
                                    <div className="w-3 h-3 rounded-full bg-danger"></div>
                                    <span className="text-sm text-text-secondary">Sekretaris Daerah</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                                    <span className="text-sm text-text-secondary">Diwakilkan</span>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="flex rounded-lg border border-border-default overflow-hidden mr-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveView('calendar')}
                                        className={`px-3 py-1.5 flex items-center gap-1.5 text-sm transition-colors ${activeView === 'calendar' ? 'bg-primary text-text-inverse' : 'bg-surface hover:bg-surface-hover text-text-secondary'}`}
                                        title="Tampilan Kalender"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">Kalender</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveView('list')}
                                        className={`px-3 py-1.5 flex items-center gap-1.5 text-sm transition-colors ${activeView === 'list' ? 'bg-primary text-text-inverse' : 'bg-surface hover:bg-surface-hover text-text-secondary'}`}
                                        title="Tampilan Daftar"
                                    >
                                        <List className="h-4 w-4" />
                                        <span className="hidden sm:inline">Daftar</span>
                                    </button>
                                </div>
                                {canUseCustomSchedule && (
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
                                            {(search ? 1 : 0)}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Expandable Filter Panel */}
                        {showFilters && (
                            <div className="p-4 bg-surface-hover rounded-lg border border-border-default animate-in fade-in slide-in-from-top-2 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Content Container */}
                <div className="p-4 relative">
                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-surface/75 flex items-center justify-center z-10 rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    {activeView === 'calendar' ? (
                        <div className="relative">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                initialDate={initialCalendarDate}
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
                    ) : (
                        <div className="space-y-4">
                            <DefinitifTable
                                data={paginatedEvents.map(e => e.extendedProps?.agenda as Agenda)}
                                onViewDetail={handleViewDetail}
                                onViewTimeline={(agenda) => {
                                    const surat = mapAgendaSuratForTimeline(agenda);
                                    if (!surat) return;
                                    setTimelineSurat(surat);
                                    setTimelineModalOpen(true);
                                }}
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                            />
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border-default pt-4">
                                <p className="text-sm text-text-secondary">
                                    Menampilkan {paginatedEvents.length} dari {filteredEvents.length} jadwal
                                </p>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>
                    )}
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
                                        <p className="font-medium text-text-primary">{formatAgendaTime(selectedAgenda)}</p>
                                    </div>
                                    
                                    <div className="sm:col-span-2 border-t border-border-default/50 pt-3 mt-1"></div>
                                    
                                    <div>
                                        <p className="text-text-secondary">Jenis Lokasi</p>
                                        <p className="font-medium text-text-primary">
                                            {selectedAgenda.lokasi_type === 'dalam_daerah' ? 'Dalam Daerah' : 
                                             selectedAgenda.lokasi_type === 'luar_daerah' ? 'Luar Daerah' : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Provinsi</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.wilayah_details?.provinsi || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Kabupaten/Kota</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.wilayah_details?.kabupaten || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Kecamatan</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.wilayah_details?.kecamatan || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Desa/Kelurahan</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.wilayah_details?.desa || '-'}</p>
                                    </div>

                                    <div className="sm:col-span-2 pt-2">
                                        <p className="text-text-secondary">Tempat / Detail Lokasi</p>
                                        <p className="font-medium text-text-primary">{selectedAgenda.tempat}</p>
                                        <div className="mt-2">
                                            <MapPreview 
                                                lokasi={selectedAgenda.wilayah_text ?? selectedAgenda.tempat} 
                                                koordinat={selectedAgenda.lokasi_koordinat} 
                                            />
                                        </div>
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
                                        <Badge variant={getDetailedStatusVariant(selectedAgenda)}>
                                            {getDetailedStatusLabel(selectedAgenda)}
                                        </Badge>
                                    </div>
                                    {selectedAgenda.dihadiri_oleh && (
                                        <p className="text-sm text-text-primary">
                                            <span className="text-text-secondary">Dihadiri oleh:</span>{' '}
                                            <span className="font-medium">{selectedAgenda.dihadiri_oleh}</span>
                                        </p>
                                    )}
                                    {selectedAgenda.status_kehadiran === 'Diwakilkan' && selectedAgenda.nama_yang_mewakili && (
                                        <p className="text-sm text-text-primary">
                                            <span className="text-text-secondary">Diwakilkan kepada:</span>{' '}
                                            <span className="font-medium">{selectedAgenda.nama_yang_mewakili}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Audit Info */}
                            {sm?.created_by && (
                                <div className="pt-4 border-t border-border-default">
                                    <p className="text-xs text-text-secondary">
                                        Surat diinput oleh <span className="font-medium text-text-primary">{sm.created_by.name}</span>
                                        {sm.created_at && ` pada ${formatDateShort(sm.created_at)}`}
                                    </p>
                                </div>
                            )}

                            {/* Action Button — hanya yang berhak hapus (pemilik jadwal terakhir) */}
                            {selectedAgenda.can_delete && (
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
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-text-primary">
                                    {selectedAgenda?.file_path ? 'Preview File Jadwal' : 'Preview Surat'}
                                </h4>
                                {activePreviewUrl && (
                                    <a
                                        href={activePreviewUrl}
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
                                {!activeFilePath || !activePreviewUrl ? (
                                    <div className="flex items-center justify-center h-[560px]">
                                        <p className="text-text-secondary text-sm">
                                            {selectedAgenda?.sumber_jadwal === 'self' && !selectedAgenda?.surat_masuk
                                                ? 'Tidak ada file lampiran pada jadwal ini'
                                                : 'File surat tidak tersedia'}
                                        </p>
                                    </div>
                                ) : isPdfFile ? (
                                    <iframe
                                        src={activePreviewUrl}
                                        className="w-full h-[640px]"
                                        title="Preview File"
                                        style={{ border: 'none' }}
                                    />
                                ) : isImageFile ? (
                                    <div className="p-4">
                                        <img
                                            src={activePreviewUrl}
                                            alt="Preview File"
                                            className="w-full h-auto max-h-[640px] object-contain rounded border border-border-default bg-surface"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[560px] gap-2 px-4 text-center">
                                        <p className="text-text-secondary text-sm">
                                            Preview tidak tersedia untuk format file ini.
                                        </p>
                                        {activeDownloadUrl && (
                                            <a
                                                href={activeDownloadUrl}
                                                download
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
                        {' '}
                        {selectedAgenda?.surat_masuk
                            ? 'Data akan dikembalikan ke Jadwal Tentatif.'
                            : 'Data akan dihapus permanen.'}
                    </p>
                }
                isLoading={isDeleting}
            />

            <TimelineModal
                isOpen={timelineModalOpen}
                onClose={() => setTimelineModalOpen(false)}
                suratMasuk={timelineSurat}
                sifatOptions={sifatOptions}
            />
        </>
    );
};

DefinitifIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default DefinitifIndex;
