export interface Agenda {
    id: string;
    nama_kegiatan: string;
    tanggal_agenda: string;
    tanggal_agenda_formatted: string;
    waktu_lengkap: string;
    tempat: string;
    status: string;
    status_label: string;
    status_disposisi: string;
    status_disposisi_label: string;
}

export interface SuratMasuk {
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
    agenda?: Agenda | null;
    [key: string]: unknown;
}
