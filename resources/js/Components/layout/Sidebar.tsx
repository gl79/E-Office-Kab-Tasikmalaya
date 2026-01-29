import { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
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
}

/**
 * Sidebar Component
 * 
 * Sidebar navigasi untuk aplikasi E-Office.
 * Secara default merender menu dari config/menu.ts.
 * Dapat di-override dengan children atau custom items.
 * 
 * @example
 * // Default: render menu dari config
 * <Sidebar />
 * 
 * @example
 * // Custom children
 * <Sidebar>
 *   <CustomNavigation />
 * </Sidebar>
 * 
 * @example
 * // Filtered menu items
 * <Sidebar items={filteredMenuItems} />
 */
export default function Sidebar({ 
    className = '', 
    children,
    width = 'w-64',
    items
}: SidebarProps) {
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
        <aside 
            className={`
                ${width}
                bg-gray-50 
                border-r border-gray-200 
                flex-shrink-0
                overflow-y-auto
                ${className}
            `.trim()}
        >
            {/* Sidebar Content Container */}
            <div className="h-full py-4 px-3">
                {children ?? (
                    <nav className="space-y-1">
                        {menuToRender.map((item, index) => (
                            <SidebarMenuItem
                                key={`${item.label}-${index}`}
                                item={item}
                            />
                        ))}
                    </nav>
                )}
            </div>
        </aside>
    );
}
