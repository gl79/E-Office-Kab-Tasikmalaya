import { ReactNode, useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import Header from '@/Components/layout/Header';
import Sidebar from '@/Components/layout/Sidebar';
import Footer from '@/Components/layout/Footer';
import { MenuItem } from '@/config/menu';
import { PageProps } from '@/types';
import { Button, Modal, ToastProvider, useToast } from '@/Components/ui';

interface AppLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    showFooter?: boolean;
    headerLogo?: ReactNode;
    sidebarContent?: ReactNode;
    sidebarMenuItems?: MenuItem[];
    footerContent?: ReactNode;
}

/**
 * Inner component yang menggunakan Toast context
 */
function AppLayoutInner({
    children,
    showSidebar = true,
    showFooter = true,
    headerLogo,
    sidebarContent,
    sidebarMenuItems,
    footerContent,
}: AppLayoutProps) {
    const { auth, flash } = usePage<PageProps & { flash: { success?: string; error?: string } }>().props;
    const user = auth.user;
    const { showToast } = useToast();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Show flash messages as toast
    useEffect(() => {
        if (flash?.success) {
            showToast('success', flash.success);
        }
        if (flash?.error) {
            showToast('error', flash.error);
        }
    }, [flash]);

    // Logout handler
    const handleLogout = () => {
        setShowLogoutModal(false);
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
                onClick={() => setShowLogoutModal(true)}
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
        <>
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

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutModal}
                title="Konfirmasi Keluar"
                onClose={() => setShowLogoutModal(false)}
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="text-text-muted mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <p className="text-text-primary text-lg mb-6">
                        Apakah Anda yakin ingin keluar?
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowLogoutModal(false)}
                        >
                            Batal
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={handleLogout}
                        >
                            Ya, Keluar
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

/**
 * AppLayout Component
 * 
 * Layout utama (App Shell) untuk aplikasi E-Office.
 * Wrapped dengan ToastProvider untuk notifikasi.
 */
export default function AppLayout(props: AppLayoutProps) {
    return (
        <ToastProvider>
            <AppLayoutInner {...props} />
        </ToastProvider>
    );
}
