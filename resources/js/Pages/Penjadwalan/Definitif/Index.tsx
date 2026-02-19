import { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';
import { Search, Trash2, X, Filter } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Badge, ConfirmDialog } from '@/Components/ui';
import { TextInput, FormSelect } from '@/Components/form';
import { useMemoryCache } from '@/hooks/useMemoryCache';
import { getDisposisiVariant, getDisposisiLabel } from '@/utils/badgeVariants';
import type { PageProps } from '@/types';
import type { Agenda, CalendarEvent } from '@/types/penjadwalan';

interface Props extends PageProps {
    disposisiOptions: Record<string, string>;
    filters: {
        search?: string;
        status_disposisi?: string;
    };
}

const CACHE_TTL_MS = 60_000;

const DefinitifIndex = ({ disposisiOptions, filters }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const cacheKey = `penjadwalan_definitif_${auth.user.id}`;
    const { read, write } = useMemoryCache<CalendarEvent[]>(cacheKey, CACHE_TTL_MS);
    const cachedEvents = read();

    // State
    const [events, setEvents] = useState<CalendarEvent[]>(() => cachedEvents ?? []);
    const [isLoading, setIsLoading] = useState(events.length === 0);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status_disposisi || '');
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);


    // Fetch events
    const fetchEvents = useCallback(async (start?: string, end?: string) => {
        const shouldShowLoading = events.length === 0;
        if (shouldShowLoading) {
            setIsLoading(true);
        }
        try {
            const params = new URLSearchParams();
            if (start) params.append('start', start);
            if (end) params.append('end', end);
            if (search) params.append('search', search);
            if (statusFilter) params.append('status_disposisi', statusFilter);

            const response = await fetch(`${route('penjadwalan.definitif.calendar-data')}?${params.toString()}`);
            const data = await response.json();
            setEvents(data);
            write(data);
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter, events.length, cacheKey]);

    // Initial load
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Handle date range change
    const handleDatesSet = (dateInfo: { startStr: string; endStr: string }) => {
        fetchEvents(dateInfo.startStr, dateInfo.endStr);
    };

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
                fetchEvents();
            },
        });
    };

    // Handle filter apply
    const handleApplyFilter = () => {
        fetchEvents();
    };

    // Handle filter clear - useEffect will trigger refetch when both are empty
    const handleClearFilter = () => {
        setSearch('');
        setStatusFilter('');
    };

    // Refetch when filters are cleared
    useEffect(() => {
        if (search === '' && statusFilter === '') {
            fetchEvents();
        }
    }, [search, statusFilter, fetchEvents]);

    // Get disposisi badge using shared utility
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
                             <Button
                                variant="secondary"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 whitespace-nowrap"
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {(search || statusFilter) && (
                                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-text-inverse">
                                        {(search ? 1 : 0) + (statusFilter ? 1 : 0)}
                                    </span>
                                )}
                            </Button>
                         </div>
                    </div>

                    {/* Expandable Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-border-default grid grid-cols-1 md:grid-cols-3 gap-4">
                            <TextInput
                                type="text"
                                placeholder="Cari kegiatan, nomor surat, lokasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3"
                            />
                            <FormSelect
                                options={disposisiSelectOptions}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3"
                            />
                             <div className="flex gap-2">
                                <Button onClick={handleApplyFilter} className="flex-1">
                                    <Search className="h-4 w-4 mr-1" />
                                    Terapkan
                                </Button>
                                <Button variant="secondary" onClick={handleClearFilter}>
                                    <X className="h-4 w-4 mr-1" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Calendar Container */}
                <div className="p-4">
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
                            events={events as EventInput[]}
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

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Jadwal Definitif"
                size="lg"
            >
                {selectedAgenda && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Kolom Kiri - Informasi */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-text-primary mb-3">Informasi Surat</h4>
                                <div className="space-y-2 text-sm text-text-primary">
                                    <p>
                                        <span className="text-text-secondary">Nomor:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.nomor_surat}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Tanggal:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.tanggal_surat_formatted}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Dari:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.asal_surat}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Perihal:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.perihal}</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-text-primary mb-3">Detail Jadwal</h4>
                                <div className="space-y-2 text-sm text-text-primary">
                                    <p>
                                        <span className="text-text-secondary">Kegiatan:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.nama_kegiatan}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Tanggal:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.tanggal_format_indonesia}</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Waktu:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.waktu_lengkap} WIB</span>
                                    </p>
                                    <p>
                                        <span className="text-text-secondary">Lokasi:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.tempat}</span>
                                    </p>
                                    {selectedAgenda.keterangan && (
                                        <p>
                                            <span className="text-text-secondary">Keterangan:</span>{' '}
                                            <span className="font-medium">{selectedAgenda.keterangan}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-text-primary mb-3">Status</h4>
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
                        <div className="bg-surface-hover rounded-lg p-4 border border-border-default">
                            <h4 className="font-medium text-text-primary mb-4">Preview Surat</h4>
                            {selectedAgenda.surat_masuk?.file_url ? (
                                <iframe
                                    src={selectedAgenda.surat_masuk.file_url}
                                    className="w-full h-[500px] border border-border-default rounded"
                                    title="Preview Surat"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-[500px] bg-surface rounded">
                                    <p className="text-text-secondary">File surat tidak tersedia</p>
                                </div>
                            )}
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
