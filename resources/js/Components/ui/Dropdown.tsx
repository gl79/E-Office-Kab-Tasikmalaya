import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@inertiajs/react';

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: 'left' | 'right';
    width?: string;
    contentClasses?: string;
}

const Dropdown = ({ trigger, children, align = 'right', width = '48', contentClasses = 'py-1 bg-surface' }: DropdownProps) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || !dropdownRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const spaceBelow = viewportHeight - triggerRect.bottom;
        const openUpward = spaceBelow < dropdownRect.height && triggerRect.top > dropdownRect.height;

        let top = openUpward
            ? triggerRect.top - dropdownRect.height - 4
            : triggerRect.bottom + 4;

        let left = align === 'right'
            ? triggerRect.right - dropdownRect.width
            : triggerRect.left;

        // Clamp within viewport
        if (left < 8) left = 8;
        if (left + dropdownRect.width > viewportWidth - 8) left = viewportWidth - dropdownRect.width - 8;
        if (top < 8) top = 8;

        setPosition({ top, left });
    }, [align]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Recalculate position when open or on scroll/resize
    useEffect(() => {
        if (!open) {
            setPosition(null);
            return;
        }

        // Initial calculation after portal renders
        requestAnimationFrame(calculatePosition);

        const handleScrollOrResize = () => {
            if (open) calculatePosition();
        };

        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);
        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [open, calculatePosition]);

    let widthClasses = '';
    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <div className="relative">
            <div ref={triggerRef} onClick={() => setOpen(!open)} className="cursor-pointer">
                {trigger}
            </div>

            {open && createPortal(
                <div
                    ref={dropdownRef}
                    className={`fixed z-[9999] rounded-md shadow-lg ${widthClasses}`}
                    style={position ? { top: position.top, left: position.left } : { visibility: 'hidden', top: 0, left: 0 }}
                >
                    <div className={`rounded-md ring-1 ring-border-dark/30 ${contentClasses}`}>
                        {children}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

interface DropdownLinkProps {
    href?: string;
    children: ReactNode;
    onClick?: () => void;
    as?: 'a' | 'button';
    className?: string;
}

const DropdownLink = ({ href, children, onClick, as = 'a', className = '' }: DropdownLinkProps) => {
    const baseClasses = `block w-full px-4 py-2 text-left text-sm leading-5 text-text-primary hover:bg-surface-hover focus:outline-none focus:bg-surface-hover transition duration-150 ease-in-out ${className}`;

    if (as === 'button') {
        return (
            <button type="button" className={baseClasses} onClick={onClick}>
                {children}
            </button>
        );
    }

    return (
        <Link href={href || '#'} className={baseClasses} onClick={onClick}>
            {children}
        </Link>
    );
};

Dropdown.Link = DropdownLink;

export default Dropdown;
