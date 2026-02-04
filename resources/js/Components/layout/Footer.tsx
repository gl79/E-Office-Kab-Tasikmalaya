interface FooterProps {
    /** Additional CSS classes for customization */
    className?: string;
    /** Custom content to replace default footer text */
    children?: React.ReactNode;
}

/**
 * Footer Component
 * 
 * Footer sederhana untuk aplikasi E-Office.
 * Bersifat opsional dan dapat dikustomisasi.
 * 
 * @example
 * <Footer />
 * // or with custom content
 * <Footer>Custom footer content</Footer>
 */
export default function Footer({ 
    className = '',
    children 
}: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer 
            className={`
                bg-surface 
                border-t border-border-default 
                py-4 px-6
                ${className}
            `.trim()}
        >
            <div className="text-center text-sm text-text-secondary">
                {children ?? (
                    <>
                        &copy; {currentYear} E-Office Kabupaten Tasikmalaya. All rights reserved.
                    </>
                )}
            </div>
        </footer>
    );
}
