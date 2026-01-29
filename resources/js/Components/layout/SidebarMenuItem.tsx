import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { MenuItem } from '@/config/menu';
import { 
    LayoutDashboard, 
    Database, 
    Users, 
    User, 
    Building2, 
    FileText, 
    Archive, 
    Mail, 
    Inbox, 
    Send, 
    CalendarOff, 
    List, 
    Calendar, 
    CalendarCheck, 
    CalendarClock, 
    CalendarCheck2,
    LucideIcon
} from 'lucide-react';

interface SidebarMenuItemProps {
    /** Menu item data */
    item: MenuItem;
    /** Nesting depth level (for indentation) */
    depth?: number;
}

const iconMap: Record<string, LucideIcon> = {
    'dashboard': LayoutDashboard,
    'database': Database,
    'users': Users,
    'user': User,
    'building': Building2,
    'file-text': FileText,
    'archive': Archive,
    'mail': Mail,
    'inbox': Inbox,
    'send': Send,
    'calendar-off': CalendarOff,
    'list': List,
    'calendar': Calendar,
    'calendar-check': CalendarCheck,
    'calendar-clock': CalendarClock,
    'calendar-check-2': CalendarCheck2,
};

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
    const isActive = item.href 
        ? (
            (url === item.href || url.startsWith(item.href + '/')) && 
            (!item.excludePaths || !item.excludePaths.some(path => url.startsWith(path)))
        )
        : false;

    const hasActiveChild = item.children?.some(child => 
        child.href 
            ? (
                (url === child.href || url.startsWith(child.href + '/')) &&
                (!child.excludePaths || !child.excludePaths.some(path => url.startsWith(path)))
                )
            : false
    );

    // Sync isOpen with hasActiveChild when it changes
    const [hasInitialized, setHasInitialized] = useState(false);

    if (hasActiveChild && !hasInitialized) {
        setIsOpen(true);
        setHasInitialized(true);
    }

    // Auto-expand if has active child (only on mount/update)
    // We use a separate effect or state initialization to allow toggling
    
    // Simplified: isExpanded is just isOpen. 
    // We rely on the initialization above to open it by default if active.
    const isExpanded = isOpen;

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

    // Get icon component
    const IconComponent = item.icon ? iconMap[item.icon] : null;

    // Render menu item content
    const renderContent = () => (
        <>
            <span className="flex items-center gap-3">
                {/* Icon */}
                {IconComponent && (
                    <span className={`w-5 h-5 flex items-center justify-center ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                        <IconComponent className="w-4 h-4" />
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
