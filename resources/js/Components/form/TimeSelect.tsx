import { useMemo } from 'react';

interface TimeSelectProps {
    id?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
}

/**
 * Time select component with 30-minute intervals (00:00, 00:30, 01:00, ..., 23:30)
 */
export default function TimeSelect({
    id,
    value,
    onChange,
    className = '',
    disabled = false,
    placeholder = 'Pilih Waktu',
}: TimeSelectProps) {
    // Generate time options in 30-minute intervals
    const timeOptions = useMemo(() => {
        const options: { value: string; label: string }[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const hourStr = hour.toString().padStart(2, '0');
                const minuteStr = minute.toString().padStart(2, '0');
                const timeValue = `${hourStr}:${minuteStr}`;
                options.push({
                    value: timeValue,
                    label: `${timeValue} WIB`,
                });
            }
        }
        return options;
    }, []);

    return (
        <select
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm disabled:bg-gray-100 ${className}`}
        >
            <option value="">{placeholder}</option>
            {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
