export interface User {
    id: number;
    name: string;
    username: string;
    email: string | null;
    role: 'superadmin' | 'pimpinan' | 'tu' | 'user';
    role_label?: string;
    email_verified_at?: string;
    foto?: string | null;
    foto_url?: string | null;
    nip?: string | null;
    jabatan?: string | null;
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
