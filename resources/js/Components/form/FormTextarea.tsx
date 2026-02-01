import { TextareaHTMLAttributes, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    isFocused?: boolean;
}

export default forwardRef(function FormTextarea(
    {
        className = '',
        isFocused = false,
        rows = 3,
        ...props
    }: FormTextareaProps,
    ref
) {
    const localRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <textarea
            {...props}
            rows={rows}
            ref={localRef}
            className={
                'rounded-md border-border-default shadow-sm focus:border-primary focus:ring-primary ' +
                className
            }
        />
    );
});
