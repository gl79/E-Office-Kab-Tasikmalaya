import { SelectHTMLAttributes, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    options: Option[];
    placeholder?: string;
    isFocused?: boolean;
}

export default forwardRef(function FormSelect(
    {
        options,
        placeholder = 'Pilih...',
        className = '',
        isFocused = false,
        ...props
    }: FormSelectProps,
    ref
) {
    const localRef = useRef<HTMLSelectElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <select
            {...props}
            ref={localRef}
            className={
                'rounded-md border-border-default shadow-sm focus:border-primary focus:ring-primary ' +
                className
            }
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
});
