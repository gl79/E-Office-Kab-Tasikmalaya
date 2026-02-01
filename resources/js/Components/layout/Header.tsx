import { ReactNode } from "react";

interface HeaderProps {
    /** Additional CSS classes for customization */
    className?: string;
    /** Optional logo element to display */
    logo?: ReactNode;
    /** Optional right-side content (e.g., user menu placeholder) */
    rightContent?: ReactNode;
}

/**
 * Header Component
 *
 * Komponen header minimal untuk aplikasi E-Office.
 * Bersifat presentational dan tidak mengandung logic bisnis.
 *
 * @example
 * <Header logo={<img src="/logo.png" alt="Logo" />} />
 */
export default function Header({
    className = "",
    logo,
    rightContent,
}: HeaderProps) {
    return (
        <header
            className={`
                bg-surface 
                border-b border-border-default 
                h-16 
                flex items-center justify-between 
                px-4 lg:px-6
                ${className}
            `.trim()}
        >
            {/* Logo Area */}
            <div className="flex items-center gap-3">
                {logo ?? (
                    <>
                        <img src="/images/pemkabtasik.png" alt="Logo Kabupaten Tasikmalaya" className="w-10 h-10 object-contain" />
                        <div className="text-lg font-semibold text-text-primary">
                            E-Office Kabupaten Tasikmalaya
                        </div>
                    </>
                )}
            </div>

            {/* Right Side Content Area */}
            <div className="flex items-center space-x-4">{rightContent}</div>
        </header>
    );
}
