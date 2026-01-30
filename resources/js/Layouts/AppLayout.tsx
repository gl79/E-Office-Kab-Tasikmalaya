import { ReactNode, useState, useEffect } from 'react';
import { usePage, router, useForm } from '@inertiajs/react';
import { Header, Sidebar, Footer } from '@/Components/layout';
import { MenuItem } from '@/config/menu';
import { PageProps } from '@/types';
import { Button, Modal, ToastProvider, useToast, Dropdown, LiveClock } from '@/Components/ui';

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
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Password Change Form
    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
        password: '',
        password_confirmation: '',
    });

    // Auto Logout Logic (3 minutes = 180000 ms)
    useEffect(() => {
        const handleActivity = () => setLastActivity(Date.now());
        
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('scroll', handleActivity);

        const interval = setInterval(() => {
            if (Date.now() - lastActivity > 180000) { // 3 minutes
                if (!showTimeoutModal) {
                    setShowTimeoutModal(true);
                    setTimeout(() => {
                        router.post(route('logout'));
                    }, 3000); // Give 3 seconds to see the modal before actual logout
                }
            }
        }, 1000);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            clearInterval(interval);
        };
    }, [lastActivity, showTimeoutModal]);

    // Force Password Change Logic
    useEffect(() => {
        if (user && !user.password_changed_at && user.role !== 'superadmin') {
            setShowPasswordModal(true);
        }
    }, [user]);

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        putPassword(route('password.force_update'), {
            onSuccess: () => {
                setShowPasswordModal(false);
                resetPassword();
                showToast('success', 'Password berhasil diubah.');
            },
        });
    };

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

    // User menu untuk header
    const userMenu = (
        <div className="flex items-center gap-4">
            {/* Live Clock - Isolated component to prevent parent re-renders */}
            <LiveClock className="hidden md:block text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200" />

            <Dropdown
                align="right"
                width="48"
                trigger={
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                        <img 
                            src={user?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`} 
                            alt={user?.name} 
                            className="h-8 w-8 rounded-full object-cover border border-gray-200"
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
                
                <Dropdown.Link href={route('profile.edit')}>
                    Profile
                </Dropdown.Link>
                
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

            {/* Timeout Modal */}
            <Modal
                isOpen={showTimeoutModal}
                title="Session Timeout"
                onClose={() => {}} // Prevent closing
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="text-yellow-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Session Timeout</h3>
                    <p className="text-gray-500">
                        Tidak ada aktivitas selama 3 menit. Anda akan logout otomatis.
                    </p>
                </div>
            </Modal>

            {/* Force Password Change Modal */}
            <Modal
                isOpen={showPasswordModal}
                title="Wajib Ganti Password"
                onClose={() => {}} // Prevent closing
                size="md"
            >
                <div className="p-4">
                    <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    Untuk keamanan akun, Anda wajib mengganti password default sebelum melanjutkan.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                            <input
                                type="password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData('password', e.target.value)}
                                required
                            />
                            {passwordErrors.password && <p className="mt-1 text-sm text-red-600">{passwordErrors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={passwordData.password_confirmation}
                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>

                        <div className="mt-5 sm:mt-6">
                            <Button
                                type="submit"
                                className="w-full justify-center"
                                disabled={passwordProcessing}
                            >
                                {passwordProcessing ? 'Menyimpan...' : 'Simpan Password Baru'}
                            </Button>
                        </div>
                    </form>
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
