import { ReactNode } from 'react';

export interface TableHeader<T = object> {
    /** Key to access data from row object */
    key: string;
    /** Display label for header */
    label: string;
    /** Additional CSS classes for column */
    className?: string;
    /** Custom render function for cell content */
    render?: (value: unknown, item: T, index: number) => ReactNode;
}

interface TableProps<T extends object> {
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
    /** Enable bordered table style */
    bordered?: boolean;
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
export default function Table<T extends object>({
    headers,
    data,
    keyExtractor,
    emptyMessage = 'Tidak ada data',
    className = '',
    bordered = false,
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
        <div className={`bg-surface rounded-xl shadow-sm overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className={`w-full text-sm text-left ${bordered ? 'border-collapse border border-border-default' : ''}`}>
                    <thead className={`bg-surface-hover text-xs text-text-secondary uppercase tracking-wider ${bordered ? '' : 'border-b border-border-light'}`}>
                        <tr>
                            {headers.map((header) => (
                                <th
                                    key={header.key}
                                    scope="col"
                                    className={`
                                        px-6 py-3 font-bold
                                        ${bordered ? 'border border-border-default' : ''}
                                        ${header.className || ''}
                                    `}
                                >
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={bordered ? '' : 'divide-y divide-border-light/60'}>
                        {data.length === 0 ? (
                            <tr>
                                <td 
                                    colSpan={headers.length}
                                    className="px-6 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center text-text-muted">
                                        <svg className="w-12 h-12 mb-3 text-border-dark/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-base font-medium">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr 
                                    key={getRowKey(item, index)}
                                    className="
                                        transition-colors duration-150
                                        hover:bg-surface-hover
                                        even:bg-surface-hover
                                        group
                                    "
                                >
                                    {headers.map((header) => {
                                        const value = getCellValue(item, header.key);
                                        
                                        return (
                                            <td
                                                key={header.key}
                                                className={`
                                                    px-6 py-4
                                                    text-text-primary
                                                    ${bordered ? 'border border-border-default' : 'group-last:border-0'}
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
        </div>
    );
}
