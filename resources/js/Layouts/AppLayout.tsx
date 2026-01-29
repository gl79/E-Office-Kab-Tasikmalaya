import { ReactNode, useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Header, Sidebar, Footer } from '@/Components/layout';
import { MenuItem } from '@/config/menu';
import { PageProps } from '@/types';
import { Button, Modal, ToastProvider, useToast, Dropdown } from '@/Components/ui';

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
    }, [flash?.success]);

    useEffect(() => {
        if (flash?.error) {
            showToast('error', flash.error);
        }
    }, [flash?.error]);

    // Logout handler
    const handleLogout = () => {
        setShowLogoutModal(false);
        router.post(route('logout'));
    };

    // Live Clock
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = currentTime.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }) + ' - ' + currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).replace(/\./g, ':');

    // User menu untuk header
    const userMenu = (
        <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden md:block text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
                {formattedTime}
            </div>

            <Dropdown
                align="right"
                width="48"
                trigger={
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff`} 
                            alt={user?.name} 
                            className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="hidden sm:block text-left">
                            <div className="text-sm font-medium text-text-primary">
                                {user?.name}
                            </div>
                            <div className="text-xs text-text-secondary">
                                {user?.role_label || user?.role}
                            </div>
                        </div>
                        <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                }
            >
                <div className="block px-4 py-2 text-xs text-gray-400">
                    Manage Account
                </div>
                
                <div className="border-t border-gray-100"></div>

                <Dropdown.Link as="button" onClick={() => setShowLogoutModal(true)}>
                    Keluar
                </Dropdown.Link>
            </Dropdown>
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
 */
export default function AppLayout(props: AppLayoutProps) {
    return <AppLayoutInner {...props} />;
}
