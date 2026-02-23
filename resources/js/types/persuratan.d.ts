/**
 * Shared TypeScript types for Persuratan module
 */

export interface SuratMasukTujuan {
    id: string;
    tujuan_id?: number | null;
    tujuan: string;
    status_penerimaan?: string;
    diterima_at?: string | null;
}

export interface SuratMasuk {
    id: string;
    nomor_agenda: string;
    tanggal_diterima: string;
    tanggal_surat: string;
    asal_surat: string;
    nomor_surat: string;
    sifat: string;
    perihal: string;
    isi_ringkas: string | null;
    lampiran: number | null;
    file_path: string | null;
    tanggal_diteruskan: string | null;
    catatan_tambahan: string | null;
    tujuans: SuratMasukTujuan[];
    jenis_surat?: { id: string; nama: string } | null;
    indeks_berkas?: { kode: string; nama: string } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    staff_pengolah?: { name: string; nip: string } | null;
    created_by?: { name: string } | null;
    created_at: string;
    penerimaan_status?: string;
    penerimaan_diterima_at?: string | null;
    can_accept?: boolean;
    can_disposisi?: boolean;
    can_disposisi_disabled?: boolean;
    can_schedule?: boolean;
    can_finalize_schedule?: boolean;
    can_view_schedule?: boolean;
    penjadwalan_status?: string;
    penjadwalan_status_label?: string;
    penjadwalan_status_variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    penjadwalan?: {
        id: string;
        status: string;
        dihadiri_oleh_user_id?: number | null;
    } | null;
}

export interface SuratKeluar {
    id: string;
    tanggal_surat: string;
    no_urut: string;
    nomor_surat: string;
    kepada: string;
    perihal: string;
    isi_ringkas: string;
    sifat_1: string;
    lampiran: number | null;
    catatan: string | null;
    kode_pengolah: string | null;
    file_path: string | null;
    jenis_surat?: { id: string; nama: string } | null;
    indeks?: { kode: string; nama: string } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    unit_kerja?: { nama: string; singkatan: string | null } | null;
    created_by?: { name: string } | null;
    created_at: string;
}


export type SifatBadgeVariant = 'default' | 'info' | 'warning' | 'danger';
