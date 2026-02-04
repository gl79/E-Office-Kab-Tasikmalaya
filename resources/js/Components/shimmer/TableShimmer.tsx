import React from 'react';

interface TableShimmerProps {
    columns?: number;
    rows?: number;
}

const TableShimmer = ({ columns = 5, rows = 10 }: TableShimmerProps) => {
    return (
        <div className="w-full bg-surface rounded-xl border border-border-default overflow-hidden animate-pulse">
            {/* Header */}
            <div className="bg-surface-hover px-6 py-4 border-b border-border-default flex items-center justify-between">
                <div className="h-6 w-32 bg-border-light rounded"></div>
                <div className="flex gap-2">
                    <div className="h-9 w-64 bg-border-light rounded-lg"></div>
                    <div className="h-9 w-24 bg-border-light rounded-lg"></div>
                </div>
            </div>

            {/* Table Header */}
            <div className="border-b border-border-default bg-surface-hover">
                <div className="grid grid-cols-12 px-6 py-3 gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <div 
                            key={`th-${i}`} 
                            className={`h-4 bg-border-light rounded ${i === 0 ? 'col-span-1' : 'col-span-2'}`}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Table Body */}
            <div>
                {Array.from({ length: rows }).map((_, rowIdx) => (
                    <div 
                        key={`row-${rowIdx}`}
                        className="grid grid-cols-12 px-6 py-4 gap-4 border-b border-border-light last:border-0"
                    >
                        {Array.from({ length: columns }).map((_, colIdx) => (
                            <div 
                                key={`cell-${rowIdx}-${colIdx}`} 
                                className={`h-4 bg-border-light rounded ${colIdx === 0 ? 'col-span-1' : 'col-span-2'}`}
                            ></div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="bg-surface-hover px-6 py-4 border-t border-border-default flex items-center justify-between">
                <div className="h-4 w-48 bg-border-light rounded"></div>
                <div className="flex gap-1">
                    <div className="h-8 w-8 bg-border-light rounded"></div>
                    <div className="h-8 w-8 bg-border-light rounded"></div>
                    <div className="h-8 w-8 bg-border-light rounded"></div>
                </div>
            </div>
        </div>
    );
};

export default TableShimmer;
