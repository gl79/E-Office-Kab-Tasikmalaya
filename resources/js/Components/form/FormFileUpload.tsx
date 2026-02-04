import { ChangeEvent, useRef, useState } from 'react';
import { Upload, X, FileText, File } from 'lucide-react';
import Button from '../ui/Button';

interface FormFileUploadProps {
    onChange: (file: File | null) => void;
    accept?: string;
    maxSize?: number; // in MB
    currentFile?: string | null;
    error?: string;
    disabled?: boolean;
}

export default function FormFileUpload({
    onChange,
    accept = '.pdf,.doc,.docx',
    maxSize = 5,
    currentFile,
    error,
    disabled = false,
}: FormFileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);

        if (!file) {
            setPreview(null);
            setFileName(null);
            onChange(null);
            return;
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            setFileError(`Ukuran file maksimal ${maxSize}MB`);
            e.target.value = '';
            return;
        }

        // Validate file type
        const allowedTypes = accept.split(',').map(t => t.trim().toLowerCase());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            setFileError(`Format file harus ${accept}`);
            e.target.value = '';
            return;
        }

        setFileName(file.name);

        // Create preview URL for PDF
        if (file.type === 'application/pdf') {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }

        onChange(file);
    };

    const handleRemove = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setPreview(null);
        setFileName(null);
        setFileError(null);
        onChange(null);
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const getFileIcon = () => {
        if (fileName?.endsWith('.pdf')) {
            return <FileText className="w-8 h-8 text-danger" />;
        }
        return <File className="w-8 h-8 text-primary" />;
    };

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />

            {!fileName && !currentFile ? (
                <div
                    onClick={handleClick}
                    className={`
                        border-2 border-dashed rounded-lg p-6
                        flex flex-col items-center justify-center
                        cursor-pointer transition-colors
                        ${disabled
                            ? 'border-border-light bg-surface-hover cursor-not-allowed'
                            : 'border-border-default hover:border-primary hover:bg-primary-light'
                        }
                    `}
                >
                    <Upload className="w-10 h-10 text-text-muted mb-2" />
                    <p className="text-sm text-text-secondary">
                        Klik untuk upload atau drag & drop
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                        {accept.replace(/\./g, '').toUpperCase()} (Max. {maxSize}MB)
                    </p>
                </div>
            ) : (
                <div className="border border-border-default rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getFileIcon()}
                            <div>
                                <p className="text-sm font-medium text-text-primary truncate max-w-xs">
                                    {fileName || (currentFile ? currentFile.split('/').pop() : '')}
                                </p>
                                {currentFile && !fileName && (
                                    <p className="text-xs text-text-secondary">File saat ini</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {preview && (
                                <a
                                    href={preview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:text-primary-dark"
                                >
                                    Preview
                                </a>
                            )}
                            {currentFile && !fileName && (
                                <a
                                    href={`/storage/${currentFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:text-primary-dark"
                                >
                                    Lihat
                                </a>
                            )}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="p-1 text-text-muted hover:text-danger transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    {!disabled && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleClick}
                            className="mt-3"
                        >
                            Ganti File
                        </Button>
                    )}
                </div>
            )}

            {(fileError || error) && (
                <p className="text-sm text-danger">{fileError || error}</p>
            )}
        </div>
    );
}
