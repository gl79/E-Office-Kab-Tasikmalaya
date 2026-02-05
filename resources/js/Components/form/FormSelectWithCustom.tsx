import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface FormSelectWithCustomProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string } }) => void;
    placeholder?: string;
    allowCustom?: boolean;
    customPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export default function FormSelectWithCustom({
    options,
    value,
    onChange,
    placeholder = 'Pilih...',
    allowCustom = true,
    customPlaceholder = 'Ketik custom...',
    disabled = false,
    className = '',
    id,
}: FormSelectWithCustomProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check if current value is a custom value (not in options)
    const isCustomValue = value && !options.some(opt => opt.value === value);

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

    const handleSelect = (selectedValue: string) => {
        onChange({ target: { value: selectedValue } } as React.ChangeEvent<HTMLSelectElement>);
        setIsOpen(false);
    };

    const handleAddCustom = () => {
        if (customInput.trim()) {
            onChange({ target: { value: customInput.trim() } } as React.ChangeEvent<HTMLSelectElement>);
            setCustomInput('');
            setShowCustomInput(false);
            setIsOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustom();
        }
    };

    const getDisplayLabel = () => {
        if (!value) return placeholder;
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Display Button */}
            <button
                type="button"
                id={id}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full px-3 py-2 rounded-md border shadow-sm
                    flex items-center justify-between
                    text-left text-sm
                    ${disabled
                        ? 'bg-surface-hover border-border-light cursor-not-allowed text-text-muted'
                        : 'bg-surface border-border-default hover:border-border-dark'
                    }
                    ${!value ? 'text-text-muted' : 'text-text-primary'}
                `}
            >
                <span className={isCustomValue ? 'text-primary font-medium' : ''}>
                    {getDisplayLabel()}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

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
                                        placeholder="Masukkan nilai custom..."
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
        </div>
    );
}
