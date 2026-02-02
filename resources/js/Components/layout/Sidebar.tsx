// HMR Force Update
import { ReactNode } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { menuItems, MenuItem } from '@/config/menu';
import SidebarMenuItem from './SidebarMenuItem';
import { PageProps } from '@/types';

interface SidebarProps {
    /** Additional CSS classes for customization */
    className?: string;
    /** 
     * Custom sidebar content. 
     * If provided, will override the default menu rendering.
     */
    children?: ReactNode;
    /** Width of the sidebar */
    width?: string;
    /** 
     * Custom menu items to render instead of default config.
     * Allows filtering or customizing menu without changing config.
     */
    items?: MenuItem[];
    /** Callback when logout is clicked */
    onLogoutClick?: () => void;
}

/**
 * Sidebar Component
 * 
 * Sidebar navigasi untuk aplikasi E-Office.
 * Secara default merender menu dari config/menu.ts.
 * Dapat di-override dengan children atau custom items.
 */
export default function Sidebar({ 
    className = '', 
    children,
    width = 'w-64',
    items,
    onLogoutClick,
    isOpen = false,
    onClose
}: SidebarProps & { isOpen?: boolean; onClose?: () => void }) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user?.role;

    // Use provided items, or default menuItems from config
    const sourceItems = items ?? menuItems;

    // Filter items based on role
    const menuToRender = sourceItems.filter(item => {
        // If no roles defined, show to everyone
        if (!item.roles || item.roles.length === 0) {
            return true;
        }
        
        // If user has no role but item requires one, hide it
        if (!userRole) {
            return false;
        }

        // Check if user's role is in the allowed roles
        return item.roles.includes(userRole);
    });

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Element */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    bg-surface border-r border-border-default
                    transition-transform duration-300 ease-in-out
                    lg:static lg:translate-x-0
                    ${width}
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${className}
                `.trim()}
            >
                {/* Sidebar Branding / Header */}
                <div className="h-16 flex items-center px-6 border-b border-border-default bg-surface sticky top-0 z-10">
                    <Link href={route('dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/images/pemkabtasik.png" alt="Logo Kabupaten Tasikmalaya" className="w-8 h-8 object-contain" />
                        <div className="text-sm font-bold text-text-primary leading-tight">
                            E-Office<br/>
                            <span className="font-semibold text-text-secondary text-xs">Kab. Tasikmalaya</span>
                        </div>
                    </Link>
                    {/* Close button for mobile */}
                    <button 
                        onClick={onClose}
                        className="ml-auto lg:hidden text-text-secondary hover:text-text-primary"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Content Container */}
                <div className="flex-1 py-4 px-3 overflow-y-auto h-[calc(100vh-4rem)]">
                    {children ?? (
                        <nav className="space-y-1">
                            {menuToRender.map((item, index) => (
                                <SidebarMenuItem
                                    key={`${item.label}-${index}`}
                                    item={item}
                                    onLogoutClick={onLogoutClick}
                                />
                            ))}
                        </nav>
                    )}
                </div>
            </aside>
        </>
    );
}
