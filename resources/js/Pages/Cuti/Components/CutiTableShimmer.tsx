import TableShimmer from '@/Components/shimmer/TableShimmer';

interface CutiTableShimmerProps {
    columns?: number;
}

export default function CutiTableShimmer({ columns = 6 }: CutiTableShimmerProps) {
    return (
        <div className="p-4">
            <TableShimmer columns={columns} />
        </div>
    );
}
