import { ReactElement } from 'react';
import Badge from '@/Components/ui/Badge';

const SIFAT_BADGE_VARIANTS: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
    biasa: 'info',
    terbatas: 'info',
    rahasia: 'warning',
    sangat_rahasia: 'danger',
};

/**
 * Renders a sifat (classification) badge.
 * @param sifatValue - the raw sifat value (e.g. 'biasa', 'rahasia')
 * @param options - label map from value to display string
 */
export function getSifatBadge(
    sifatValue: string,
    options: Record<string, string>
): ReactElement {
    return (
        <Badge
            variant={SIFAT_BADGE_VARIANTS[sifatValue] ?? 'info'}
            className="justify-center min-w-[80px] whitespace-nowrap"
        >
            {options[sifatValue] ?? sifatValue}
        </Badge>
    );
}
