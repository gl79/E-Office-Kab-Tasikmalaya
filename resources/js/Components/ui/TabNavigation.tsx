import { ReactNode } from 'react';

export interface Tab {
    /** Unique key for the tab */
    key: string;
    /** Display label */
    label: string;
    /** Optional badge count */
    count?: number;
    /** Badge variant for count */
    countVariant?: 'default' | 'primary' | 'warning' | 'success' | 'danger';
    /** Optional icon */
    icon?: ReactNode;
}

interface TabNavigationProps {
    /** Array of tab configurations */
    tabs: Tab[];
    /** Currently active tab key */
    activeTab: string;
    /** Callback when tab is changed */
    onTabChange: (key: string) => void;
    /** Additional CSS classes for container */
    className?: string;
}

/**
 * TabNavigation Component
 *
 * Reusable tab navigation with optional badge counts.
 * Follows the design tokens from app.css.
 *
 * @example
 * <TabNavigation
 *     tabs={[
 *         { key: 'belum', label: 'Belum Dijadwalkan' },
 *         { key: 'sudah', label: 'Sudah Dijadwalkan', count: 5, countVariant: 'success' },
 *     ]}
 *     activeTab={activeTab}
 *     onTabChange={setActiveTab}
 * />
 */
export default function TabNavigation({
    tabs,
    activeTab,
    onTabChange,
    className = '',
}: TabNavigationProps) {
    const countVariantStyles: Record<string, string> = {
        default: 'bg-surface-hover text-text-secondary',
        primary: 'bg-primary-light text-primary',
        warning: 'bg-warning-light text-warning',
        success: 'bg-success-light text-success',
        danger: 'bg-danger-light text-danger',
    };

    return (
        <div className={`border-b border-border-default ${className}`}>
            <nav className="flex -mb-px">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onTabChange(tab.key)}
                            className={`
                                px-6 py-4 text-sm font-medium border-b-2 transition-colors
                                flex items-center gap-2
                                ${isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-dark'
                                }
                            `}
                        >
                            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span
                                    className={`
                                        ml-1 px-2 py-0.5 text-xs rounded-full
                                        ${countVariantStyles[tab.countVariant || 'default']}
                                    `}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
