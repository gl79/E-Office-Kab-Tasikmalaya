import { InputHTMLAttributes, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

interface FormDatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean;
}

export default forwardRef(function FormDatePicker(
    {
        className = '',
        isFocused = false,
        ...props
    }: FormDatePickerProps,
    ref
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type="date"
            ref={localRef}
            className={
                'rounded-md border-border-default shadow-sm focus:border-primary focus:ring-primary ' +
                className
            }
        />
    );
});
