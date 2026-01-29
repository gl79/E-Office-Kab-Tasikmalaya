import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Link } from '@inertiajs/react';

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: 'left' | 'right';
    width?: string;
    contentClasses?: string;
}

const Dropdown = ({ trigger, children, align = 'right', width = '48', contentClasses = 'py-1 bg-white' }: DropdownProps) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    let alignmentClasses = 'origin-top';
    if (align === 'left') {
        alignmentClasses = 'origin-top-left left-0';
    } else if (align === 'right') {
        alignmentClasses = 'origin-top-right right-0';
    }

    let widthClasses = '';
    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <div className="relative">
            <div ref={triggerRef} onClick={() => setOpen(!open)} className="cursor-pointer">
                {trigger}
            </div>

            {open && (
                <div
                    ref={dropdownRef}
                    className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
                >
                    <div className={`rounded-md ring-1 ring-black ring-opacity-5 ${contentClasses}`}>
                        {children}
                    </div>
                </div>
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
    const baseClasses = `block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out ${className}`;

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
