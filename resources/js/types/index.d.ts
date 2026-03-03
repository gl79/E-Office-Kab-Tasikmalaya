export interface Jabatan {
    id: number;
    nama: string;
    level: number;
    can_dispose: boolean;
    is_system: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    username: string;
    email: string | null;
    role: 'superadmin' | 'pejabat' | 'tu' | 'user';
    role_label?: string;
    email_verified_at?: string;
    foto?: string | null;
    foto_url?: string | null;
    nip?: string | null;
    jabatan_id?: number | null;
    jabatan_nama?: string | null;
    jabatan_level?: number | null;
    can_dispose?: boolean;
    jenis_kelamin?: 'L' | 'P' | null;
    module_access?: string[] | null;
    can_manage_users?: boolean;
    created_by?: number | null;
    creator?: {
        id: number;
        name: string;
        role: string;
        role_label?: string;
    } | null;
    jabatan_relasi?: Jabatan | null;
    password_changed_at?: string | null;
    created_at?: string;
    deleted_at?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        has_conflict?: boolean;
    };
    notifications?: {
        surat_masuk_menunggu_penerimaan: number;
    };
    url?: string;
};

export interface PaginatedLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    links: PaginatedLink[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}
