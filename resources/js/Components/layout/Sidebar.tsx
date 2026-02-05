// HMR Force Update
import { ReactNode } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { menuItems, MenuItem } from '@/config/menu';
import SidebarMenuItem from './SidebarMenuItem';
import { PageProps } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    /** Collapse sidebar on desktop */
    collapsed?: boolean;
    /** Toggle collapse state */
    onToggleCollapse?: () => void;
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
    onClose,
    collapsed = false,
    onToggleCollapse
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
                    className="fixed inset-0 bg-text-primary/50 z-40 lg:hidden"
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
                    ${collapsed ? 'w-64 lg:w-20' : width}
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${className}
                `.trim()}
            >
                {/* Sidebar Branding / Header */}
                <div
                    className={`
                        h-16 flex items-center border-b border-border-default bg-surface sticky top-0 z-10
                        ${collapsed ? 'px-6 lg:px-2 lg:justify-between' : 'px-6'}
                    `}
                >
                    <Link
                        href={route('dashboard')}
                        className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${collapsed ? 'justify-center' : ''}`}
                        title="Dashboard"
                    >
                        <img src="/images/pemkabtasik.png" alt="Logo Kabupaten Tasikmalaya" className="w-8 h-8 object-contain" />
                        <div className={`text-sm font-bold text-text-primary leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
                            E-Office<br/>
                            <span className="font-semibold text-text-secondary text-xs">Kab. Tasikmalaya</span>
                        </div>
                    </Link>
                    {/* Collapse toggle (desktop) */}
                    <button
                        onClick={onToggleCollapse}
                        className="ml-auto hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                        title={collapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
                        type="button"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
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
                <div className={`flex-1 py-4 overflow-y-auto h-[calc(100vh-4rem)] ${collapsed ? 'px-3 lg:px-2' : 'px-3'}`}>
                    {children ?? (
                        <nav className="space-y-1">
                            {menuToRender.map((item, index) => (
                                <SidebarMenuItem
                                    key={`${item.label}-${index}`}
                                    item={item}
                                    onLogoutClick={onLogoutClick}
                                    collapsed={collapsed}
                                />
                            ))}
                        </nav>
                    )}
                </div>
            </aside>
        </>
    );
}
