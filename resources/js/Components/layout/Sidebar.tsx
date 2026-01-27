import { ReactNode } from 'react';

interface SidebarProps {
    /** Additional CSS classes for customization */
    className?: string;
    /** Sidebar content (menu items will be passed here) */
    children?: ReactNode;
    /** Width of the sidebar */
    width?: string;
}

/**
 * Sidebar Component
 * 
 * Container sidebar untuk aplikasi E-Office.
 * Berfungsi sebagai placeholder yang akan diisi menu di tahap selanjutnya.
 * Tidak mengandung menu hardcoded atau logic bisnis.
 * 
 * @example
 * <Sidebar>
 *   <nav>Menu items here</nav>
 * </Sidebar>
 */
export default function Sidebar({ 
    className = '', 
    children,
    width = 'w-64'
}: SidebarProps) {
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
            <div className="h-full p-4">
                {children ?? (
                    <div className="text-sm text-gray-400">
                        {/* Placeholder - menu akan ditambahkan di sini */}
                    </div>
                )}
            </div>
        </aside>
    );
}
