import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';

interface FormMultiSelectProps {
    options: string[];
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
    const [customInput, setCustomInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowCustomInput(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (option: string) => {
        if (disabled) return;

        if (value.includes(option)) {
            onChange(value.filter(v => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    const handleRemove = (option: string) => {
        if (disabled) return;
        onChange(value.filter(v => v !== option));
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

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected Tags */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    min-h-[42px] p-2 rounded-md border shadow-sm
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
                            {item}
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
                    absolute z-10 w-full mt-1
                    bg-surface border border-border-default rounded-md shadow-lg
                    max-h-60 overflow-auto
                ">
                    {/* Predefined Options */}
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => handleToggle(option)}
                            className={`
                                px-3 py-2 cursor-pointer text-sm
                                hover:bg-surface-hover
                                ${value.includes(option) ? 'bg-primary-light text-primary-dark' : ''}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={value.includes(option)}
                                    onChange={() => {}}
                                    className="rounded border-border-default text-primary focus:ring-primary"
                                />
                                {option}
                            </div>
                        </div>
                    ))}

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
