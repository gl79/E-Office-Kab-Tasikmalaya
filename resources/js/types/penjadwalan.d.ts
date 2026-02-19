/**
 * Penjadwalan & Persuratan Type Definitions
 * Single source of truth for type interfaces
 */

// ============================================
// SURAT MASUK TYPES
// ============================================

export interface SuratMasukTujuan {
    id: string;
    tujuan: string;
}

export interface SuratMasukBase {
    id: string;
    nomor_agenda: string;
    nomor_surat: string;
    tanggal_surat: string;
    tanggal_surat_formatted: string;
    tanggal_diterima: string;
    tanggal_diterima_formatted: string;
    asal_surat: string;
    perihal: string;
    sifat: string;
    sifat_label: string;
    file_path: string | null;
    file_url: string | null;
    tujuan_list: string[];
}

export interface SuratMasuk extends SuratMasukBase {
    agenda?: Agenda | null;
    isi_ringkas?: string | null;
    lampiran?: number | null;
    tujuans?: SuratMasukTujuan[];
    indeks_berkas?: { kode: string; nama: string } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    staff_pengolah?: { name: string; nip: string } | null;
}

// ============================================
// AGENDA/PENJADWALAN TYPES
// ============================================

export interface AgendaCreator {
    id: number;
    name: string;
}

export interface AgendaBase {
    id: string;
    nama_kegiatan: string;
    tanggal_agenda: string;
    tanggal_agenda_formatted: string;
    waktu_lengkap: string;
    tempat: string;
    status: string;
    status_label: string;
    status_formal?: string;
    status_formal_label?: string;
    status_disposisi: string;
    status_disposisi_label: string;
}

export interface Agenda extends AgendaBase {
    surat_masuk?: SuratMasukBase;
    tanggal_format_indonesia?: string;
    hari?: string;
    waktu_mulai?: string;
    waktu_selesai?: string | null;
    lokasi_type?: string;
    lokasi_type_label?: string;
    kode_wilayah?: string | null; // Added code_wilayah
    dihadiri_oleh?: string | null;
    keterangan?: string | null;
    can_edit_kehadiran?: boolean;
    created_by?: AgendaCreator | null;
}

// ============================================
// CALENDAR EVENT TYPE (FullCalendar)
// ============================================

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string | null;
    allDay: boolean;
    classNames?: string[];
    extendedProps: {
        agenda: Agenda;
        status_disposisi: string;
    };
}

// ============================================
// DISPOSISI TYPES
// ============================================

export type DisposisiStatus = 'menunggu' | 'bupati' | 'wakil_bupati' | 'diwakilkan';
export type PenjadwalanStatus = 'tentatif' | 'definitif';
export type PenjadwalanStatusFormal =
    | 'terjadwal'
    | 'dalam_proses'
    | 'didisposisikan'
    | 'selesai'
    | 'ditunda'
    | 'dibatalkan';
export type SifatSurat = 'biasa' | 'penting' | 'segera' | 'amat_segera';

export const DISPOSISI_LABELS: Record<DisposisiStatus, string> = {
    menunggu: 'Menunggu',
    bupati: 'Bupati',
    wakil_bupati: 'Wakil Bupati',
    diwakilkan: 'Diwakilkan',
};

export const SIFAT_LABELS: Record<SifatSurat, string> = {
    biasa: 'Biasa',
    penting: 'Penting',
    segera: 'Segera',
    amat_segera: 'Amat Segera',
};
