import { useState, useRef, useEffect, useMemo } from 'react';
import { X, ChevronDown, Plus, Search } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface FormMultiSelectProps {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    allowCustom?: boolean;
    customPlaceholder?: string;
    disabled?: boolean;
    error?: string;
}

export default function FormMultiSelect({
    options,
    value,
    onChange,
    placeholder = 'Pilih...',
    allowCustom = true,
    customPlaceholder = 'Tambah lainnya...',
    disabled = false,
    error,
}: FormMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [customInput, setCustomInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
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

    // Filter options berdasarkan search query
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const query = searchQuery.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [options, searchQuery]);

    const handleToggle = (optionValue: string) => {
        if (disabled) return;

        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const handleRemove = (optionValue: string) => {
        if (disabled) return;
        onChange(value.filter(v => v !== optionValue));
    };

    const handleAddCustom = () => {
        if (customInput.trim() && !value.includes(customInput.trim())) {
            onChange([...value, customInput.trim()]);
            setCustomInput('');
            setShowCustomInput(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustom();
        }
    };

    const getLabel = (val: string) => {
        const option = options.find(o => o.value === val);
        return option ? option.label : val;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected Tags */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    min-h-[42px] p-2 py-1.5 rounded-md border shadow-sm
                    flex flex-wrap gap-2 items-center cursor-pointer
                    ${disabled
                        ? 'bg-surface-hover border-border-light cursor-not-allowed'
                        : 'bg-surface border-border-default hover:border-border-dark'
                    }
                    ${error ? 'border-danger' : ''}
                `}
            >
                {value.length === 0 ? (
                    <span className="text-text-muted text-sm">{placeholder}</span>
                ) : (
                    value.map((item) => (
                        <span
                            key={item}
                            className="
                                inline-flex items-center gap-1
                                px-2 py-1 rounded-md
                                bg-primary-light text-primary-dark text-sm
                            "
                        >
                            {getLabel(item)}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(item);
                                    }}
                                    className="hover:text-primary"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                    ))
                )}
                <ChevronDown className={`w-4 h-4 text-text-muted ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

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

                    {/* Predefined Options */}
                    <div className="max-h-48 overflow-auto">
                    {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleToggle(option.value)}
                            className={`
                                px-3 py-1.5 cursor-pointer text-sm
                                hover:bg-surface-hover
                                ${value.includes(option.value) ? 'bg-primary-light text-primary-dark' : ''}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={value.includes(option.value)}
                                    onChange={() => { }}
                                    className="rounded border-border-default text-primary focus:ring-primary"
                                />
                                {option.label}
                            </div>
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
                                        onKeyDown={handleKeyDown}
                                        placeholder="Masukkan tujuan lain..."
                                        className="
                                            flex-1 px-2 py-1.5 text-sm
                                            border border-border-default rounded-md
                                            focus:outline-none focus:ring-1 focus:ring-primary
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
                                    {customPlaceholder}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="mt-1 text-sm text-danger">{error}</p>
            )}
        </div>
    );
}
