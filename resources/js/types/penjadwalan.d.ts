/**
 * Penjadwalan & Persuratan Type Definitions
 * Single source of truth for type interfaces
 */

import type { SuratMasukTujuan } from './persuratan';

// ============================================
// SURAT MASUK TYPES
// ============================================

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
    // Extended fields (available when loaded with sub-relations)
    isi_ringkas?: string | null;
    lampiran?: number | null;
    tanggal_diteruskan?: string | null;
    catatan_tambahan?: string | null;
    tujuans?: SuratMasukTujuan[];
    jenis_surat?: { id: string; nama: string } | null;
    indeks_berkas?: { kode: string; nama: string } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    staff_pengolah?: { name: string; jabatan_nama: string } | null;
    created_by?: { name: string } | null;
    created_at?: string;
    status_tindak_lanjut?: string;
    status_tindak_lanjut_label?: string;
    status_tindak_lanjut_disposisi_ke?: string | null;
}

export interface SuratMasuk extends SuratMasukBase {
    agenda?: Agenda | null;
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
    status_tindak_lanjut?: string;
    status_tindak_lanjut_label?: string;
    status_tindak_lanjut_disposisi_ke?: string | null;
    sumber_jadwal?: SumberJadwal;
    sumber_jadwal_label?: string;
    status_kehadiran_column_label?: string;
    file_path?: string | null;
    file_url?: string | null;
}

export interface Agenda extends AgendaBase {
    surat_masuk?: SuratMasukBase;
    tanggal_format_indonesia?: string;
    hari?: string;
    waktu_mulai?: string;
    waktu_selesai?: string | null;
    sampai_selesai?: boolean;
    lokasi_type?: string;
    lokasi_type_label?: string;
    kode_wilayah?: string | null;
    wilayah_text?: string | null;
    wilayah_details?: {
        provinsi: string | null;
        kabupaten: string | null;
        kecamatan: string | null;
        desa: string | null;
    } | null;
    lokasi_koordinat?: {
        lat: number | null;
        lng: number | null;
    } | null;
    dihadiri_oleh?: string | null;
    dihadiri_oleh_user_id?: number | null;
    status_kehadiran?: string | null;
    nama_yang_mewakili?: string | null;
    has_disposisi_chain?: boolean;
    keterangan?: string | null;
    can_tindak_lanjut?: boolean;
    can_disposisi?: boolean;
    can_delete?: boolean;
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

export type DisposisiStatus = 'menunggu' | 'bupati' | 'wakil_bupati' | 'sekretaris_daerah' | 'diwakilkan';
export type PenjadwalanStatus = 'tentatif' | 'definitif';
export type SumberJadwal = 'self' | 'disposisi' | 'sekretaris';
export type PenjadwalanStatusFormal =
    | 'terjadwal'
    | 'dalam_proses'
    | 'didisposisikan'
    | 'selesai'
    | 'ditunda'
    | 'dibatalkan';
export type SifatSurat = 'biasa' | 'penting' | 'segera' | 'amat_segera';
