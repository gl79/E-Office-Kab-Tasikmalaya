/**
 * Menu Configuration for E-Office Sidebar
 * 
 * Struktur data menu yang akan dirender di sidebar.
 * Bersifat statis dan tidak bergantung pada role/permission.
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
        children: [
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
                label: 'Unit Kerja',
                href: '/master/unit-kerja',
                icon: 'building',
            },
            {
                label: 'Indeks Surat',
                href: '/master/indeks-surat',
                icon: 'file-text',
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
        label: 'Cuti',
        icon: 'calendar-off',
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
        label: 'Penjadwalan',
        icon: 'calendar',
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
];
