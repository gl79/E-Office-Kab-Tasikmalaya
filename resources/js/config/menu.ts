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
                label: 'Kepegawaian',
                href: '/master/kepegawaian',
                icon: 'users',
            },
            {
                label: 'Pengguna',
                href: '/master/pengguna',
                icon: 'user',
            },
            {
                label: 'Indeks Surat',
                href: '/master/indeks-surat',
                icon: 'file-text',
            },
            {
                label: 'Unit Kerja',
                href: '/master/unit-kerja',
                icon: 'building',
            },
            {
                label: 'Archive',
                href: '/master/archive',
                icon: 'archive',
            },

        ],
    },
    {
        label: 'Persuratan',
        icon: 'mail',
        roles: ['superadmin', 'tu', 'sekpri', 'user'],
        children: [
            {
                label: 'Surat Masuk',
                href: '/persuratan/surat-masuk',
                icon: 'inbox',
            },
            {
                label: 'Surat Keluar',
                href: '/persuratan/surat-keluar',
                icon: 'send',
            },
            {
                label: 'Archive',
                href: '/persuratan/archive',
                icon: 'archive',
            },
        ],
    },
    {
        label: 'Penjadwalan',
        icon: 'calendar',
        roles: ['superadmin', 'tu', 'sekpri', 'pimpinan'],
        children: [
            {
                label: 'Jadwal',
                href: '/penjadwalan/jadwal',
                icon: 'calendar-check',
            },
            {
                label: 'Jadwal Tentatif',
                href: '/penjadwalan/tentatif',
                icon: 'calendar-clock',
            },
            {
                label: 'Jadwal Definitif',
                href: '/penjadwalan/definitif',
                icon: 'calendar-check-2',
            },
            {
                label: 'Archive',
                href: '/penjadwalan/archive',
                icon: 'archive',
            },
        ],
    },
    {
        label: 'Cuti',
        icon: 'calendar-off',
        roles: ['superadmin', 'tu'],
        children: [
            {
                label: 'Data Cuti',
                href: '/cuti',
                icon: 'list',
                excludePaths: ['/cuti/archive'],
            },
            {
                label: 'Archive',
                href: '/cuti/archive',
                icon: 'archive',
            },
        ],
    },
    {
        label: 'Pengaturan & Logs',
        icon: 'settings',
        children: [
            {
                label: 'Profil',
                href: '/profile',
                icon: 'user',
            },
            {
                label: 'Activity Logs',
                href: '/pengaturan/activity-logs',
                icon: 'activity',
                roles: ['superadmin'],
            },
        ],
    },
    {
        label: 'Keluar',
        icon: 'log-out',
        isLogout: true,
    },
];
