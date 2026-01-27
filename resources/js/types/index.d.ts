export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: 'superadmin' | 'tu' | 'sekpri_bupati' | 'sekpri_wakil_bupati';
    role_label?: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
