import { ReactNode } from 'react';
import Header from '@/Components/layout/Header';
import Sidebar from '@/Components/layout/Sidebar';
import Footer from '@/Components/layout/Footer';
import { MenuItem } from '@/config/menu';

interface AppLayoutProps {
    /** Main content of the page */
    children: ReactNode;
    /** Show/hide sidebar (default: true) */
    showSidebar?: boolean;
    /** Show/hide footer (default: true) */
    showFooter?: boolean;
    /** Custom logo for header */
    headerLogo?: ReactNode;
    /** Custom right content for header (e.g., user dropdown) */
    headerRightContent?: ReactNode;
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
 * Menggabungkan Header, Sidebar dengan menu, Main Content, dan Footer.
 * Kompatibel dengan Inertia.js dan tidak menyebabkan full page reload.
 * 
 * Struktur:
 * ┌───────────────────────────────────────────────┐
 * │                   Header                       │
 * ├──────────────┬────────────────────────────────┤
 * │   Sidebar    │        Main Content            │
 * │   (menu)     │         (children)             │
 * ├──────────────┴────────────────────────────────┤
 * │                   Footer                       │
 * └───────────────────────────────────────────────┘
 * 
 * @example
 * // Basic usage - renders default menu
 * <AppLayout>
 *   <h1>Page Content</h1>
 * </AppLayout>
 * 
 * @example
 * // Without sidebar
 * <AppLayout showSidebar={false}>
 *   <h1>Full Width Content</h1>
 * </AppLayout>
 * 
 * @example
 * // With filtered menu items (future: role-based)
 * <AppLayout sidebarMenuItems={filteredMenuItems}>
 *   <h1>Page Content</h1>
 * </AppLayout>
 */
export default function AppLayout({
    children,
    showSidebar = true,
    showFooter = true,
    headerLogo,
    headerRightContent,
    sidebarContent,
    sidebarMenuItems,
    footerContent,
}: AppLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <Header 
                logo={headerLogo} 
                rightContent={headerRightContent} 
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
