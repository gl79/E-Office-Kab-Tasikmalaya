import { ReactNode } from 'react';

export interface TableHeader<T = Record<string, unknown>> {
    /** Key to access data from row object */
    key: string;
    /** Display label for header */
    label: string;
    /** Additional CSS classes for column */
    className?: string;
    /** Custom render function for cell content */
    render?: (value: unknown, item: T, index: number) => ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
    /** Table headers configuration */
    headers: TableHeader<T>[];
    /** Data array to display */
    data: T[];
    /** Function to extract unique key from each row */
    keyExtractor?: (item: T, index: number) => string | number;
    /** Message to display when data is empty */
    emptyMessage?: string;
    /** Additional CSS classes for table */
    className?: string;
}

/**
 * Table Component
 * 
 * Basic data table untuk menampilkan data tabular.
 * Supports custom cell rendering dan empty state.
 * 
 * @example
 * <Table
 *     headers={[
 *         { key: 'name', label: 'Nama' },
 *         { key: 'email', label: 'Email' },
 *         { 
 *             key: 'actions', 
 *             label: 'Aksi',
 *             render: (_, item) => <Button onClick={() => edit(item)}>Edit</Button>
 *         },
 *     ]}
 *     data={users}
 *     keyExtractor={(user) => user.id}
 * />
 */
export default function Table<T extends Record<string, unknown>>({
    headers,
    data,
    keyExtractor,
    emptyMessage = 'Tidak ada data',
    className = '',
}: TableProps<T>) {
    // Get cell value from row
    const getCellValue = (item: T, key: string): unknown => {
        // Support nested keys like 'user.name'
        const keys = key.split('.');
        let value: unknown = item;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    };

    // Generate row key
    const getRowKey = (item: T, index: number): string | number => {
        if (keyExtractor) {
            return keyExtractor(item, index);
        }
        // Try common id fields
        if ('id' in item) return item.id as string | number;
        if ('_id' in item) return item._id as string | number;
        return index;
    };

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full border-collapse">
                {/* Header */}
                <thead>
                    <tr className="bg-surface-hover border-b border-border-default">
                        {headers.map((header) => (
                            <th 
                                key={header.key}
                                className={`
                                    px-4 py-3
                                    text-left text-sm font-semibold text-text-primary
                                    ${header.className || ''}
                                `}
                            >
                                {header.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body */}
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td 
                                colSpan={headers.length}
                                className="px-4 py-8 text-center text-text-secondary"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr 
                                key={getRowKey(item, index)}
                                className="
                                    border-b border-border-light
                                    hover:bg-surface-hover
                                    transition-colors
                                "
                            >
                                {headers.map((header) => {
                                    const value = getCellValue(item, header.key);
                                    
                                    return (
                                        <td 
                                            key={header.key}
                                            className={`
                                                px-4 py-3
                                                text-sm text-text-primary
                                                ${header.className || ''}
                                            `}
                                        >
                                            {header.render 
                                                ? header.render(value, item, index)
                                                : String(value ?? '')}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
