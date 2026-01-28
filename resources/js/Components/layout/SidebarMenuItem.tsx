import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { MenuItem } from '@/config/menu';

interface SidebarMenuItemProps {
    /** Menu item data */
    item: MenuItem;
    /** Nesting depth level (for indentation) */
    depth?: number;
}

/**
 * SidebarMenuItem Component
 * 
 * Komponen rekursif untuk merender menu item di sidebar.
 * Mendukung nested submenu dengan collapse/expand.
 * Menggunakan Inertia Link untuk navigasi tanpa full page reload.
 * 
 * @example
 * <SidebarMenuItem item={menuItem} depth={0} />
 */
export default function SidebarMenuItem({ 
    item, 
    depth = 0 
}: SidebarMenuItemProps) {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    
    const hasChildren = item.children && item.children.length > 0;
    
    // Check if current route matches this item or any of its children
    const isActive = item.href ? url.startsWith(item.href) : false;
    const hasActiveChild = item.children?.some(child => 
        child.href ? url.startsWith(child.href) : false
    );

    // Auto-expand if has active child
    const isExpanded = isOpen || hasActiveChild;

    // Base styles
    const baseClasses = `
        flex items-center justify-between
        w-full px-3 py-2.5 rounded-lg
        text-sm font-medium
        transition-colors duration-150
        hover:bg-gray-200/70
    `;

    // Active state styles
    const activeClasses = isActive 
        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
        : 'text-gray-700';

    // Indentation based on depth
    const paddingLeft = depth > 0 ? `${depth * 12 + 12}px` : '12px';

    // Toggle submenu
    const handleToggle = () => {
        if (hasChildren) {
            setIsOpen(!isOpen);
        }
    };

    // Render menu item content
    const renderContent = () => (
        <>
            <span className="flex items-center gap-3">
                {/* Icon placeholder */}
                {item.icon && (
                    <span className="w-5 h-5 flex items-center justify-center text-gray-400">
                        {/* Icon akan diimplementasikan nanti */}
                        <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                    </span>
                )}
                <span>{item.label}</span>
            </span>

            {/* Expand/Collapse indicator */}
            {hasChildren && (
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M19 9l-7 7-7-7" 
                    />
                </svg>
            )}
        </>
    );

    return (
        <div className="mb-1">
            {/* Menu Item */}
            {hasChildren ? (
                // Parent with children - button for toggle
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`${baseClasses} ${activeClasses}`}
                    style={{ paddingLeft }}
                >
                    {renderContent()}
                </button>
            ) : item.href ? (
                // Leaf item with href - Inertia Link with prefetch
                <Link
                    href={item.href}
                    prefetch="hover"
                    className={`${baseClasses} ${activeClasses}`}
                    style={{ paddingLeft }}
                >
                    {renderContent()}
                </Link>
            ) : (
                // No href, no children - static text
                <span
                    className={`${baseClasses} ${activeClasses} cursor-default`}
                    style={{ paddingLeft }}
                >
                    {renderContent()}
                </span>
            )}

            {/* Submenu */}
            {hasChildren && isExpanded && (
                <div className="mt-1 ml-2 border-l border-gray-200 pl-2">
                    {item.children!.map((child, index) => (
                        <SidebarMenuItem
                            key={`${child.label}-${index}`}
                            item={child}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
