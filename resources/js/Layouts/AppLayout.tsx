import { ReactNode } from 'react';
import { usePage, router } from '@inertiajs/react';
import Header from '@/Components/layout/Header';
import Sidebar from '@/Components/layout/Sidebar';
import Footer from '@/Components/layout/Footer';
import { MenuItem } from '@/config/menu';
import { PageProps } from '@/types';

interface AppLayoutProps {
    /** Main content of the page */
    children: ReactNode;
    /** Show/hide sidebar (default: true) */
    showSidebar?: boolean;
    /** Show/hide footer (default: true) */
    showFooter?: boolean;
    /** Custom logo for header */
    headerLogo?: ReactNode;
    /** 
     * Custom sidebar content. 
     * If provided, completely overrides the menu rendering.
     */
    sidebarContent?: ReactNode;
    /**
     * Custom menu items for sidebar.
     * Use this to filter or customize menu without replacing the whole sidebar.
     */
    sidebarMenuItems?: MenuItem[];
    /** Custom footer content */
    footerContent?: ReactNode;
}

/**
 * AppLayout Component
 * 
 * Layout utama (App Shell) untuk aplikasi E-Office.
 */
export default function AppLayout({
    children,
    showSidebar = true,
    showFooter = true,
    headerLogo,
    sidebarContent,
    sidebarMenuItems,
    footerContent,
}: AppLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    // Logout handler
    const handleLogout = () => {
        router.post(route('logout'));
    };

    // User menu untuk header
    const userMenu = (
        <div className="flex items-center gap-3">
            {/* User Info */}
            <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-text-primary">
                    {user?.name}
                </div>
                <div className="text-xs text-text-secondary">
                    {user?.role_label || user?.role}
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="
                    inline-flex items-center gap-2
                    px-3 py-2 rounded-lg
                    text-sm font-medium
                    text-text-secondary hover:text-danger
                    hover:bg-danger-light
                    transition-colors
                "
                title="Keluar"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Keluar</span>
            </button>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <Header 
                logo={headerLogo} 
                rightContent={userMenu} 
            />

            {/* Main Container (Sidebar + Content) */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                {showSidebar && (
                    <Sidebar items={sidebarMenuItems}>
                        {sidebarContent}
                    </Sidebar>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

            {/* Footer */}
            {showFooter && (
                <Footer>
                    {footerContent}
                </Footer>
            )}
        </div>
    );
}
