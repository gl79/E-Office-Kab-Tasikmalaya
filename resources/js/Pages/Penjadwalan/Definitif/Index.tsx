import { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';
import {
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Clock,
    MapPin,
    User,
    FileText,
    X,
    Filter
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import Badge from '@/Components/ui/Badge';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import TextInput from '@/Components/form/TextInput';
import FormSelect from '@/Components/form/FormSelect';
import type { PageProps } from '@/types';

interface SuratMasuk {
    id: string;
    nomor_surat: string;
    tanggal_surat_formatted: string;
    asal_surat: string;
    perihal: string;
    file_url: string | null;
}

interface Agenda {
    id: string;
    surat_masuk: SuratMasuk;
    nama_kegiatan: string;
    tanggal_agenda: string;
    tanggal_agenda_formatted: string;
    tanggal_format_indonesia: string;
    hari: string;
    waktu_mulai: string;
    waktu_selesai: string | null;
    waktu_lengkap: string;
    lokasi_type: string;
    lokasi_type_label: string;
    tempat: string;
    status: string;
    status_label: string;
    status_disposisi: string;
    status_disposisi_label: string;
    dihadiri_oleh: string | null;
    keterangan: string | null;
}

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay: boolean;
    backgroundColor: string;
    borderColor: string;
    extendedProps: {
        agenda: Agenda;
    };
}

interface Props extends PageProps {
    disposisiOptions: Record<string, string>;
    filters: {
        search?: string;
        status_disposisi?: string;
    };
}

export default function DefinitifIndex({ disposisiOptions, filters }: Props) {
    // State
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status_disposisi || '');
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Calendar ref
    const [calendarRef, setCalendarRef] = useState<FullCalendar | null>(null);

    // Fetch events
    const fetchEvents = useCallback(async (start?: string, end?: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (start) params.append('start', start);
            if (end) params.append('end', end);
            if (search) params.append('search', search);
            if (statusFilter) params.append('status_disposisi', statusFilter);

            const response = await fetch(`${route('penjadwalan.definitif.calendar-data')}?${params.toString()}`);
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter]);

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
        setShowFilters(false);
    };

    // Handle filter clear
    const handleClearFilter = () => {
        setSearch('');
        setStatusFilter('');
        setTimeout(() => fetchEvents(), 0);
        setShowFilters(false);
    };

    // Get disposisi badge
    const getDisposisiBadge = (status: string) => {
        const variants: Record<string, 'default' | 'warning' | 'success' | 'info'> = {
            menunggu: 'warning',
            bupati: 'info',
            wakil_bupati: 'success',
            diwakilkan: 'success',
        };
        const labels: Record<string, string> = {
            menunggu: 'Menunggu',
            bupati: 'Bupati',
            wakil_bupati: 'Wakil Bupati',
            diwakilkan: 'Diwakilkan',
        };
        return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
    };

    const disposisiSelectOptions = [
        { value: '', label: 'Semua Status' },
        ...Object.entries(disposisiOptions).map(([value, label]) => ({
            value,
            label,
        })),
    ];

    return (
        <AppLayout>
            <Head title="Jadwal Definitif" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Jadwal Definitif</h1>
                    <p className="text-text-secondary mt-1">Jadwal yang sudah pasti dan terkonfirmasi</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filter
                        {(search || statusFilter) && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-white">
                                {(search ? 1 : 0) + (statusFilter ? 1 : 0)}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-surface border border-border-default rounded-lg p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <TextInput
                                type="text"
                                placeholder="Cari kegiatan, nomor surat, lokasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <FormSelect
                                options={disposisiSelectOptions}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleApplyFilter}>
                                <Search className="h-4 w-4 mr-1" />
                                Terapkan
                            </Button>
                            <Button variant="secondary" onClick={handleClearFilter}>
                                <X className="h-4 w-4 mr-1" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar */}
            <div className="bg-surface border border-border-default rounded-lg p-4">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-border-default">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-text-secondary">Bupati</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-text-secondary">Wakil Bupati</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm text-text-secondary">Diwakilkan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-sm text-text-secondary">Lainnya</span>
                    </div>
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                <div className="relative">
                    <FullCalendar
                        ref={(el) => setCalendarRef(el)}
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
                                <h4 className="font-medium text-gray-900 mb-3">Informasi Surat</h4>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="text-gray-500">Nomor:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.nomor_surat}</span>
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Tanggal:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.tanggal_surat_formatted}</span>
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Dari:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.asal_surat}</span>
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Perihal:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.surat_masuk?.perihal}</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Detail Jadwal</h4>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="text-gray-500">Kegiatan:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.nama_kegiatan}</span>
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Tanggal:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.tanggal_format_indonesia}</span>
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Waktu:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.waktu_lengkap} WIB</span>
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Lokasi:</span>{' '}
                                        <span className="font-medium">{selectedAgenda.tempat}</span>
                                    </p>
                                    {selectedAgenda.keterangan && (
                                        <p>
                                            <span className="text-gray-500">Keterangan:</span>{' '}
                                            <span className="font-medium">{selectedAgenda.keterangan}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Status Jadwal:</span>
                                        <Badge variant="success">{selectedAgenda.status_label}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Disposisi:</span>
                                        {getDisposisiBadge(selectedAgenda.status_disposisi)}
                                    </div>
                                    {selectedAgenda.dihadiri_oleh && (
                                        <p className="text-sm">
                                            <span className="text-gray-500">Dihadiri:</span>{' '}
                                            <span className="font-medium">{selectedAgenda.dihadiri_oleh}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4 border-t">
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
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4">Preview Surat</h4>
                            {selectedAgenda.surat_masuk?.file_url ? (
                                <iframe
                                    src={selectedAgenda.surat_masuk.file_url}
                                    className="w-full h-[500px] border border-gray-300 rounded"
                                    title="Preview Surat"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded">
                                    <p className="text-gray-500">File surat tidak tersedia</p>
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
        </AppLayout>
    );
}
