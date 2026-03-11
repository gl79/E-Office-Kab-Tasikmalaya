import { InputHTMLAttributes, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface FormDateDmyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
    value?: string | null;
    onChangeValue: (value: string) => void;
}

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const DMY_DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const normalizeIsoDate = (value: string | null | undefined): string => {
    if (!value) return '';

    const trimmed = value.trim();
    if (ISO_DATE_REGEX.test(trimmed)) {
        return trimmed;
    }

    const isoPart = trimmed.split('T')[0];
    if (ISO_DATE_REGEX.test(isoPart)) {
        return isoPart;
    }

    const dmyMatch = trimmed.match(DMY_DATE_REGEX);
    if (!dmyMatch) {
        return '';
    }

    const [, day, month, year] = dmyMatch;
    return isValidDateParts(day, month, year) ? `${year}-${month}-${day}` : '';
};

const isoToDmy = (value: string | null | undefined): string => {
    const iso = normalizeIsoDate(value);
    if (!iso) return '';

    const [, year, month, day] = iso.match(ISO_DATE_REGEX) ?? [];
    return `${day}/${month}/${year}`;
};

const formatDmyInput = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

function isValidDateParts(day: string, month: string, year: string): boolean {
    const dayNum = Number(day);
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (!Number.isInteger(dayNum) || !Number.isInteger(monthNum) || !Number.isInteger(yearNum)) {
        return false;
    }

    if (yearNum < 1900 || yearNum > 9999) {
        return false;
    }

    const date = new Date(yearNum, monthNum - 1, dayNum);
    return (
        date.getFullYear() === yearNum
        && date.getMonth() === monthNum - 1
        && date.getDate() === dayNum
    );
}

const dmyToIso = (displayValue: string): string => {
    const match = displayValue.match(DMY_DATE_REGEX);
    if (!match) return '';

    const [, day, month, year] = match;
    if (!isValidDateParts(day, month, year)) {
        return '';
    }

    return `${year}-${month}-${day}`;
};

export default forwardRef(function FormDateDmyInput(
    {
        className = '',
        isFocused = false,
        value,
        onChangeValue,
        placeholder = 'dd/mm/yyyy',
        ...props
    }: FormDateDmyInputProps & { isFocused?: boolean },
    ref
) {
    const localRef = useRef<HTMLInputElement>(null);
    const [displayValue, setDisplayValue] = useState(() => isoToDmy(value));

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    useEffect(() => {
        setDisplayValue(isoToDmy(value));
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value.trim();

        if (ISO_DATE_REGEX.test(raw)) {
            const normalized = normalizeIsoDate(raw);
            setDisplayValue(isoToDmy(normalized));
            onChangeValue(normalized);
            return;
        }

        const formatted = formatDmyInput(raw);
        setDisplayValue(formatted);

        if (!formatted) {
            onChangeValue('');
            return;
        }

        onChangeValue(dmyToIso(formatted));
    };

    return (
        <input
            {...props}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
            placeholder={placeholder}
            value={displayValue}
            onChange={handleChange}
            ref={localRef}
            className={
                'rounded-md border-border-default shadow-sm focus:border-primary focus:ring-primary ' +
                className
            }
        />
    );
});
