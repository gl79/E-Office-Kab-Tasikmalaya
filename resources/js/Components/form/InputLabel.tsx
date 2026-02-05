import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    required = false,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string; required?: boolean }) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-text-secondary ` +
                className
            }
        >
            {value ? value : children}
            {required && <span className="text-danger ml-1">*</span>}
        </label>
    );
}
