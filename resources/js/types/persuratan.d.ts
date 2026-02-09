/**
 * Shared TypeScript types for Persuratan module
 */

export interface SuratMasukTujuan {
    id: string;
    tujuan: string;
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
    indeks_berkas?: { kode: string; nama: string; jenis_surat: string | null } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    staff_pengolah?: { name: string; nip: string } | null;
    created_by?: { name: string } | null;
    created_at: string;
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
    indeks?: { kode: string; nama: string; jenis_surat: string | null } | null;
    kode_klasifikasi?: { kode: string; nama: string } | null;
    unit_kerja?: { nama: string; singkatan: string | null } | null;
    created_by?: { name: string } | null;
    created_at: string;
}

export interface ArchiveItem {
    id: string;
    type: 'masuk' | 'keluar';
    jenis: string;
    nomor_agenda: string;
    tanggal_surat: string;
    nomor_surat: string;
    sifat: string;
    asal_surat: string;
    perihal: string;
    deleted_at: string;
    deleted_by?: { name: string } | null;
}

export type SifatBadgeVariant = 'default' | 'info' | 'warning' | 'danger';
