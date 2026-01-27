import { ReactNode } from 'react';
import { menuItems, MenuItem } from '@/config/menu';
import SidebarMenuItem from './SidebarMenuItem';

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
    // Use provided items, or default menuItems from config
    const menuToRender = items ?? menuItems;

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
