export interface User {
    id: number;
    name: string;
    username: string;
    email: string | null;
    role: 'superadmin' | 'tu' | 'sekpri_bupati' | 'sekpri_wakil_bupati';
    role_label?: string;
    email_verified_at?: string;
    foto?: string | null;
    foto_url?: string | null;
    nip?: string | null;
    jabatan?: string | null;
    jenis_kelamin?: 'L' | 'P' | null;
    module_access?: string[] | null;
    can_manage_users?: boolean;
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
};
