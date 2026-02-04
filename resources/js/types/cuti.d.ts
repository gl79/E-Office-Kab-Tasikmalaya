export type CutiStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface CutiUserSnapshot {
    id?: number;
    name: string;
    nip?: string | null;
    jabatan?: string | null;
}

export interface CutiItem {
    id: string;
    pegawai: CutiUserSnapshot;
    atasan?: CutiUserSnapshot | null;
    jenis_cuti: string;
    alasan_cuti: string;
    lama_cuti: number;
    tanggal_mulai: string;
    tanggal_mulai_formatted: string;
    tanggal_selesai: string;
    tanggal_selesai_formatted: string;
    tanggal_range_formatted: string;
    alamat_cuti: string;
    status: CutiStatus;
    status_label: string;
    created_at?: string;
    created_at_formatted?: string;
    updated_at?: string;
    deleted_at?: string;
    deleted_at_formatted?: string;
    can_update?: boolean;
    can_cancel?: boolean;
    can_approve?: boolean;
    can_reject?: boolean;
    is_pending?: boolean;
}

export interface CutiArchivedItem {
    id: string;
    pegawai: CutiUserSnapshot;
    atasan?: CutiUserSnapshot | null;
    jenis_cuti: string;
    lama_cuti: number;
    tanggal_range_formatted: string;
    status: CutiStatus;
    status_label: string;
    deleted_at?: string;
    deleted_at_formatted?: string;
}
