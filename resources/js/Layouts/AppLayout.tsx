import { ReactNode, useState, useEffect } from 'react';
import { usePage, router, useForm } from '@inertiajs/react';
import { Header, Sidebar, Footer } from '@/Components/layout';
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
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Password Change Form
    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
        password: '',
        password_confirmation: '',
    });

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

    return (
        <>
            <div className="min-h-screen flex flex-col bg-background">
                {/* Header - Clean with only logo */}
                <Header 
                    logo={headerLogo} 
                />

                {/* Main Container (Sidebar + Content) */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    {showSidebar && (
                        <Sidebar 
                            items={sidebarMenuItems}
                            onLogoutClick={() => setShowLogoutModal(true)}
                        >
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

            {/* Force Password Change Modal */}
            <Modal
                isOpen={showPasswordModal}
                title="Wajib Ganti Password"
                onClose={() => {}} // Prevent closing
                size="md"
            >
                <div className="p-4">
                    <div className="mb-4 bg-primary-light border-l-4 border-primary p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-primary-dark">
                                    Untuk keamanan akun, Anda wajib mengganti password default sebelum melanjutkan.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary">Password Baru</label>
                            <input
                                type="password"
                                className="mt-1 block w-full rounded-md border-border-default shadow-sm focus:border-primary focus:ring-primary text-sm"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData('password', e.target.value)}
                                required
                            />
                            {passwordErrors.password && <p className="mt-1 text-sm text-danger">{passwordErrors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                className="mt-1 block w-full rounded-md border-border-default shadow-sm focus:border-primary focus:ring-primary text-sm"
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
