import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Plus, Search, X } from 'lucide-react';

interface FormSearchableSelectProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    /** Callback ketika user menginput custom value (tidak dari data master) */
    onCustomChange?: (customValue: string) => void;
    /** Custom value saat ini (untuk mode edit) */
    customValue?: string;
    placeholder?: string;
    allowCustom?: boolean;
    customPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    error?: string;
}

export default function FormSearchableSelect({
    options,
    value,
    onChange,
    onCustomChange,
    customValue = '',
    placeholder = 'Pilih atau ketik untuk mencari...',
    allowCustom = false,
    customPlaceholder = 'Ketik custom...',
    disabled = false,
    className = '',
    id,
    error,
}: FormSearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customInput, setCustomInput] = useState(customValue);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Sync customInput with customValue prop
    useEffect(() => {
        setCustomInput(customValue);
    }, [customValue]);

    // Filter options berdasarkan search query
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const query = searchQuery.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [options, searchQuery]);

    // Check apakah value saat ini adalah custom value (tidak ada di options)
    const isCustomValue = customValue && !value;

    // Close dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
                setShowCustomInput(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input saat dropdown dibuka
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setCustomInput('');
        setIsOpen(false);
        setSearchQuery('');
        setShowCustomInput(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        if (onCustomChange) {
            onCustomChange('');
        }
        setCustomInput('');
    };

    const handleAddCustom = () => {
        if (customInput.trim() && onCustomChange) {
            onChange('');
            onCustomChange(customInput.trim());
            setIsOpen(false);
            setSearchQuery('');
            setShowCustomInput(false);
        }
    };

    const handleCustomKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustom();
        }
    };

    const getDisplayLabel = () => {
        if (isCustomValue) {
            return customValue;
        }
        if (!value) return placeholder;
        const option = options.find((opt) => opt.value === value);
        return option ? option.label : value;
    };

    const hasValue = value || isCustomValue;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Display Button */}
            <button
                type="button"
                id={id}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full min-h-[42px] px-3 py-2 rounded-md border shadow-sm
                    flex items-center justify-between
                    text-left text-sm
                    ${disabled
                        ? 'bg-surface-hover border-border-light cursor-not-allowed text-text-muted'
                        : 'bg-surface border-border-default hover:border-border-dark'
                    }
                    ${error ? 'border-danger' : ''}
                    ${!hasValue ? 'text-text-muted' : 'text-text-primary'}
                `}
            >
                <span className={`truncate ${isCustomValue ? 'text-primary font-medium' : ''}`}>
                    {getDisplayLabel()}
                </span>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                    {hasValue && !disabled && (
                        <X
                            className="w-4 h-4 text-text-muted hover:text-danger cursor-pointer"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="
                    absolute z-50 w-full mt-1
                    bg-surface border border-border-default rounded-md shadow-lg
                ">
                    {/* Search Input */}
                    <div className="p-2 border-b border-border-light">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari..."
                                className="
                                    w-full pl-8 pr-3 py-1.5 text-sm
                                    border border-border-default rounded-md
                                    focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
                                    bg-surface text-text-primary
                                "
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-48 overflow-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        px-3 py-2 cursor-pointer text-sm
                                        hover:bg-surface-hover
                                        ${value === option.value ? 'bg-primary-light text-primary-dark font-medium' : 'text-text-primary'}
                                    `}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-3 text-sm text-text-muted text-center">
                                Tidak ada data ditemukan
                            </div>
                        )}
                    </div>

                    {/* Custom Input */}
                    {allowCustom && (
                        <div className="border-t border-border-light">
                            {showCustomInput ? (
                                <div className="p-2 flex gap-2">
                                    <input
                                        type="text"
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        onKeyDown={handleCustomKeyDown}
                                        placeholder={customPlaceholder}
                                        className="
                                            flex-1 px-2 py-1.5 text-sm
                                            border border-border-default rounded-md
                                            focus:outline-none focus:ring-1 focus:ring-primary
                                            bg-surface text-text-primary
                                        "
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCustom}
                                        className="
                                            px-3 py-1.5 text-sm
                                            bg-primary text-text-inverse rounded-md
                                            hover:bg-primary-hover
                                        "
                                    >
                                        Tambah
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => setShowCustomInput(true)}
                                    className="
                                        px-3 py-2 cursor-pointer text-sm
                                        text-primary hover:bg-primary-light
                                        flex items-center gap-2
                                    "
                                >
                                    <Plus className="w-4 h-4" />
                                    Input manual (tidak dari data master)
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-danger mt-1">{error}</p>
            )}
        </div>
    );
}
