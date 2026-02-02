interface PaginationProps {
    /** Current active page (1-indexed) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
    /** Show first/last page buttons */
    showFirstLast?: boolean;
    /** Maximum number of page buttons to show */
    maxVisiblePages?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Pagination Component
 * 
 * Page navigation dengan previous/next dan page numbers.
 * Supports ellipsis untuk banyak halaman.
 * 
 * @example
 * <Pagination
 *     currentPage={page}
 *     totalPages={10}
 *     onPageChange={(newPage) => setPage(newPage)}
 * />
 */
export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = true,
    maxVisiblePages = 5,
    className = '',
}: PaginationProps) {
    // Don't render if only one page or less
    if (totalPages <= 1) {
        return null;
    }

    // Calculate visible page numbers
    const getVisiblePages = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = [];
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Calculate range around current page
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let start = Math.max(1, currentPage - halfVisible);
            let end = Math.min(totalPages, currentPage + halfVisible);

            // Adjust if at boundaries
            if (currentPage <= halfVisible) {
                end = maxVisiblePages;
            } else if (currentPage > totalPages - halfVisible) {
                start = totalPages - maxVisiblePages + 1;
            }

            // Add first page and ellipsis
            if (start > 1) {
                pages.push(1);
                if (start > 2) {
                    pages.push('ellipsis');
                }
            }

            // Add visible pages
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipsis and last page
            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push('ellipsis');
                }
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const visiblePages = getVisiblePages();

    // Button base styles
    const buttonBase = `
        inline-flex items-center justify-center
        min-w-[36px] h-9 px-3
        text-sm font-medium rounded-lg
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const buttonNormal = `
        ${buttonBase}
        text-text-primary bg-surface
        border border-border-default
        hover:bg-surface-hover
    `;

    const buttonActive = `
        ${buttonBase}
        text-text-inverse bg-primary
        border border-primary
    `;

    return (
        <nav 
            className={`flex items-center gap-1 flex-wrap ${className}`}
            aria-label="Pagination"
        >
            {/* First Page */}
            {showFirstLast && (
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={buttonNormal}
                    aria-label="First page"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Previous Page */}
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={buttonNormal}
                aria-label="Previous page"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Page Numbers */}
            {visiblePages.map((page, index) => {
                if (page === 'ellipsis') {
                    return (
                        <span 
                            key={`ellipsis-${index}`}
                            className="px-2 text-text-secondary"
                        >
                            ...
                        </span>
                    );
                }

                const isActive = page === currentPage;
                
                return (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={isActive ? buttonActive : buttonNormal}
                        aria-label={`Page ${page}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Next Page */}
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={buttonNormal}
                aria-label="Next page"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Last Page */}
            {showFirstLast && (
                <button
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={buttonNormal}
                    aria-label="Last page"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
            )}
        </nav>
    );
}
