import Badge from '@/Components/ui/Badge';
import { getCutiStatusLabel, getCutiStatusVariant } from '@/utils/badgeVariants';

interface CutiStatusBadgeProps {
    status: string;
    className?: string;
}

export default function CutiStatusBadge({ status, className = '' }: CutiStatusBadgeProps) {
    return (
        <Badge
            variant={getCutiStatusVariant(status)}
            className={`justify-center min-w-[90px] ${className}`}
        >
            {getCutiStatusLabel(status)}
        </Badge>
    );
}
