/**
 * Menu Configuration for E-Office Sidebar
 *
 * Struktur data menu yang akan dirender di sidebar.
 */

export interface MenuItem {
    /** Display label for the menu item */
    label: string;
    /** Route path for navigation (optional if has children) */
    href?: string;
    /** Icon identifier - placeholder for future icon implementation */
    icon?: string;
    /** Nested submenu items */
    children?: MenuItem[];
    /** Paths to exclude from active state matching */
    excludePaths?: string[];
    /** Roles allowed to view this menu item */
    roles?: string[];
    /** Shared prop key for menu badge counter */
    badgeKey?: 'surat_masuk_menunggu_penerimaan' | 'disposisi_belum_diproses' | 'jadwal_tentatif_pending';
    /** Whether this is a logout action (requires special handling) */
    isLogout?: boolean;
}

/**
 * Main menu configuration
 */
export const menuItems: MenuItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'dashboard',
    },
    {
        label: 'Data Master',
        icon: 'database',
        roles: ['superadmin', 'tu'],
        children: [
            {
                label: 'Wilayah',
                icon: 'map',
                children: [
                    { label: 'Provinsi', href: '/master/wilayah/provinsi', icon: 'map-pin' },
                    { label: 'Kabupaten', href: '/master/wilayah/kabupaten', icon: 'building-2' },
                    { label: 'Kecamatan', href: '/master/wilayah/kecamatan', icon: 'home' },
                    { label: 'Desa', href: '/master/wilayah/desa', icon: 'tent' },
                ],
            },
            {
                label: 'Pengguna',
                href: '/master/pengguna',
                icon: 'user',
            },
            {
                label: 'Jabatan',
                href: '/master/jabatans',
                icon: 'briefcase',
                roles: ['superadmin', 'tu'],
            },
            {
                label: 'Indeks Surat',
                href: '/master/indeks-surat',
                icon: 'file-text',
            },
            {
                label: 'Jenis Surat',
                href: '/master/jenis-surat',
                icon: 'tag',
            },
            {
                label: 'Sifat Surat',
                href: '/master/sifat-surat',
                icon: 'shield',
            },
            {
                label: 'Unit Kerja',
                href: '/master/unit-kerja',
                icon: 'building',
            },
        ],
    },
    {
        label: 'Persuratan',
        icon: 'mail',
        roles: ['superadmin', 'tu', 'pejabat', 'user'],
        children: [
            {
                label: 'Surat Masuk',
                href: '/persuratan/surat-masuk',
                icon: 'inbox',
                badgeKey: 'surat_masuk_menunggu_penerimaan',
            },
            {
                label: 'Surat Keluar',
                href: '/persuratan/surat-keluar',
                icon: 'send',
                roles: ['superadmin', 'tu'],
            },
        ],
    },
    {
        label: 'Penjadwalan',
        icon: 'calendar',
        roles: ['superadmin', 'tu', 'pejabat'],
        children: [
            {
                label: 'Jadwal Tentatif',
                href: '/penjadwalan/tentatif',
                icon: 'calendar-clock',
                badgeKey: 'jadwal_tentatif_pending',
            },
            {
                label: 'Jadwal Definitif',
                href: '/penjadwalan/definitif',
                icon: 'calendar-check-2',
            },
            {
                label: 'History Penjadwalan',
                href: '/penjadwalan/history',
                icon: 'history',
            },
        ],
    },
    {
        label: 'Activity Logs',
        href: '/pengaturan/activity-logs',
        icon: 'activity',
        roles: ['superadmin'],
    },
];
