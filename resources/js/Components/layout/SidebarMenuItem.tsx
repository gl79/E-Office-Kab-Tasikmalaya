// HMR Force Update
import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { MenuItem } from '@/config/menu';
import { PageProps } from '@/types';
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
    Map,
    MapPin,
    Home,
    Tent,
    Settings,
    LogOut,
    Activity,
    LucideIcon,
    ChevronDown
} from 'lucide-react';

interface SidebarMenuItemProps {
    /** Menu item data */
    item: MenuItem;
    /** Nesting depth level (for indentation) */
    depth?: number;
    /** Callback for logout action */
    onLogoutClick?: () => void;
    /** Collapse sidebar */
    collapsed?: boolean;
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
    'building-2': Building2,
    'map': Map,
    'map-pin': MapPin,
    'home': Home,
    'tent': Tent,
    'settings': Settings,
    'log-out': LogOut,
    'activity': Activity,
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
    depth = 0,
    onLogoutClick,
    collapsed = false
}: SidebarMenuItemProps) {
    const { url, props } = usePage<PageProps>();
    const userRole = props.auth.user?.role;

    // Filter children based on role
    const filteredChildren = item.children?.filter(child => {
        // If no roles defined, show to everyone
        if (!child.roles || child.roles.length === 0) {
            return true;
        }

        // If user has no role but item requires one, hide it
        if (!userRole) {
            return false;
        }

        // Check if user's role is in the allowed roles
        return child.roles.includes(userRole);
    });

    const hasChildren = filteredChildren && filteredChildren.length > 0;

    // Recursive function to check if any descendant is active
    const checkIsActive = (menuItem: MenuItem): boolean => {
        // Check if current item matches
        if (menuItem.href) {
            return (url === menuItem.href || url.startsWith(menuItem.href + '/') || url.startsWith(menuItem.href + '?')) &&
                   (!menuItem.excludePaths || !menuItem.excludePaths.some(path => url.startsWith(path)));
        }

        // Check children recursively
        if (menuItem.children) {
            return menuItem.children.some(child => checkIsActive(child));
        }

        return false;
    };

    // Check if any direct child is active (or has active descendants)
    const hasActiveChild = filteredChildren?.some(child => checkIsActive(child));

    const [isOpen, setIsOpen] = useState(!!hasActiveChild);

    // Check if current route matches this item or any of its children
    const isActive = (item.href 
        ? (
            (url === item.href || url.startsWith(item.href + '/') || url.startsWith(item.href + '?')) && 
            (!item.excludePaths || !item.excludePaths.some(path => url.startsWith(path)))
        )
        : false) || hasActiveChild;

    // Sync isOpen with hasActiveChild when it changes
    // This ensures that if we navigate to a child, the parent opens
    useEffect(() => {
        if (hasActiveChild) {
            setIsOpen(true);
        }
    }, [hasActiveChild]);

    // Auto-expand if has active child (only on mount/update)
    // We use a separate effect or state initialization to allow toggling
    
    // Simplified: isExpanded is just isOpen. 
    // We rely on the initialization above to open it by default if active.
    const isExpanded = isOpen;

    // Base styles
    const baseClasses = `
        flex items-center
        w-full py-2.5 rounded-lg
        text-sm font-medium
        transition-colors duration-150
        hover:bg-surface-hover
    `;

    const layoutClasses = collapsed
        ? 'justify-between px-3 lg:justify-center lg:px-2'
        : 'justify-between px-3';

    // Active state styles
    const activeClasses = isActive 
        ? 'bg-primary-light text-primary hover:bg-primary-light' 
        : 'text-text-secondary';

    // Indentation based on depth
    const paddingLeft = !collapsed && depth > 0 ? `${depth * 12 + 12}px` : undefined;

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
            <span className={`flex items-center ${collapsed ? 'gap-3 lg:gap-0' : 'gap-3'}`}>
                {/* Icon */}
                {IconComponent && (
                    <span className={`w-5 h-5 flex items-center justify-center ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                        <IconComponent className="w-4 h-4" />
                    </span>
                )}
                <span className={collapsed ? 'lg:sr-only' : ''}>{item.label}</span>
            </span>

            {/* Expand/Collapse indicator */}
            {hasChildren && (
                <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 ${collapsed ? 'lg:hidden' : ''} ${
                        isExpanded ? 'rotate-180' : ''
                    }`}
                />
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
                    className={`${baseClasses} ${layoutClasses} ${activeClasses}`}
                    style={paddingLeft ? { paddingLeft } : undefined}
                    title={collapsed ? item.label : undefined}
                    aria-label={collapsed ? item.label : undefined}
                >
                    {renderContent()}
                </button>
            ) : item.isLogout ? (
                // Logout button - special styling
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onLogoutClick?.();
                    }}
                    className={`${baseClasses} ${layoutClasses} text-danger hover:bg-danger-light`}
                    style={paddingLeft ? { paddingLeft } : undefined}
                    title={collapsed ? item.label : undefined}
                    aria-label={collapsed ? item.label : undefined}
                >
                    <span className="flex items-center gap-3">
                        {IconComponent && (
                            <span className="w-5 h-5 flex items-center justify-center text-danger">
                                <IconComponent className="w-4 h-4" />
                            </span>
                        )}
                        <span className={collapsed ? 'sr-only' : ''}>{item.label}</span>
                    </span>
                </button>
            ) : item.href ? (
                // Leaf item with href - Inertia Link
                <Link
                    href={item.href}

                    preserveState
                    preserveScroll
                    className={`${baseClasses} ${layoutClasses} ${activeClasses}`}
                    style={paddingLeft ? { paddingLeft } : undefined}
                    title={collapsed ? item.label : undefined}
                    aria-label={collapsed ? item.label : undefined}
                >
                    {renderContent()}
                </Link>
            ) : (
                // No href, no children - static text
                <span
                    className={`${baseClasses} ${layoutClasses} ${activeClasses} cursor-default`}
                    style={paddingLeft ? { paddingLeft } : undefined}
                    title={collapsed ? item.label : undefined}
                    aria-label={collapsed ? item.label : undefined}
                >
                    {renderContent()}
                </span>
            )}

            {/* Submenu */}
            {hasChildren && isExpanded && (
                <div className={`${collapsed ? 'mt-1' : 'mt-1 ml-2 border-l border-border-default pl-2'}`}>
                    {filteredChildren!.map((child, index) => (
                        <SidebarMenuItem
                            key={`${child.label}-${index}`}
                            item={child}
                            depth={depth + 1}
                            onLogoutClick={onLogoutClick}
                            collapsed={collapsed}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
