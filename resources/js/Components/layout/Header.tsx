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
                bg-white 
                border-b border-gray-200 
                h-16 
                flex items-center justify-between 
                px-4 lg:px-6
                ${className}
            `.trim()}
        >
            {/* Logo Area */}
            <div className="flex items-center">
                {logo ?? (
                    <div className="text-xl font-semibold text-gray-800">
                        E-Office
                    </div>
                )}
            </div>

            {/* Right Side Content Area */}
            <div className="flex items-center space-x-4">{rightContent}</div>
        </header>
    );
}
