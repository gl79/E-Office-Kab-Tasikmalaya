import { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks';
import { PageProps } from '@/types';
import { Activity, User, Monitor, Globe, Clock, Eye, Filter, X } from 'lucide-react';

interface ActivityUser {
    id: string;
    name: string;
    username: string;
    foto_url: string | null;
}

interface ActivityLogItem {
    id: string;
    user_id: string | null;
    user: ActivityUser | null;
    action: string;
    action_label: string;
    model_type: string | null;
    model_name: string | null;
    model_id: string | null;
    description: string;
    ip_address: string | null;
    user_agent: { browser: string; platform: string };
    properties: Record<string, any> | null;
    created_at: string;
    created_at_human: string;
}

interface ActionType {
    value: string;
    label: string;
}

interface Props extends PageProps {
    logs?: ActivityLogItem[];
    users?: { id: string; name: string; username: string }[];
    actionTypes: ActionType[];
    filters: {
        search?: string;
        user_id?: string;
        action?: string;
        date_from?: string;
        date_to?: string;
    };
}

const CACHE_TTL_MS = 60_000;

const Index = ({ logs, users, actionTypes }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const { data: cachedData, isLoading, hasCached } = useDeferredDataMutable<{ logs?: ActivityLogItem[]; users?: { id: string; name: string; username: string }[] }>(
        `pengaturan_activity_logs_${auth.user.id}`,
        logs !== undefined || users !== undefined ? { logs, users } : undefined,
        CACHE_TTL_MS
    );
    const activeLogs = cachedData?.logs;
    const activeUsers = cachedData?.users;
    
    // Client-side filtering for SPA experience
    const [search, setSearch] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [detailItem, setDetailItem] = useState<ActivityLogItem | null>(null);
    const itemsPerPage = 15;
    
    // Extract data
    const logsData = activeLogs || [];
    const usersData = activeUsers || [];

    // Filtered data
    const filteredData = useMemo(() => {
        let result = logsData;

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(item =>
                item.description.toLowerCase().includes(searchLower) ||
                item.ip_address?.toLowerCase().includes(searchLower) ||
                item.user?.name.toLowerCase().includes(searchLower) ||
                item.user?.username.toLowerCase().includes(searchLower) ||
                item.action_label.toLowerCase().includes(searchLower)
            );
        }

        // User filter
        if (userFilter) {
            result = result.filter(item => item.user_id === userFilter);
        }

        // Action filter
        if (actionFilter) {
            result = result.filter(item => item.action === actionFilter);
        }

        // Date from filter
        if (dateFromFilter) {
            result = result.filter(item => item.created_at >= dateFromFilter);
        }

        // Date to filter
        if (dateToFilter) {
            result = result.filter(item => item.created_at.substring(0, 10) <= dateToFilter);
        }

        return result;
    }, [logsData, search, userFilter, actionFilter, dateFromFilter, dateToFilter]);

    // Paginated data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Handlers
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const clearFilters = useCallback(() => {
        setSearch('');
        setUserFilter('');
        setActionFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        setCurrentPage(1);
    }, []);

    const hasFilters = search || userFilter || actionFilter || dateFromFilter || dateToFilter;

    // Action color mapping
    const getActionColor = (action: string) => {
        switch (action) {
            case 'login':
                return 'bg-success-light text-success';
            case 'logout':
                return 'bg-surface-hover text-text-secondary';
            case 'login_failed':
                return 'bg-danger-light text-danger';
            case 'create':
                return 'bg-primary-light text-primary';
            case 'update':
                return 'bg-warning-light text-warning';
            case 'delete':
            case 'force_delete':
                return 'bg-danger-light text-danger';
            case 'restore':
                return 'bg-secondary-light text-secondary';
            case 'password_change':
                return 'bg-accent-light text-accent';
            default:
                return 'bg-surface-hover text-text-secondary';
        }
    };

    return (
        <>
            <Head title="Activity Logs" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary" />
                        Activity Logs
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Riwayat aktivitas pengguna dalam sistem ({filteredData.length} log)
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface border border-border-default rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">Filter</span>
                    {hasFilters && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={clearFilters}
                            className="ml-auto"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Reset Filter
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <TextInput
                        type="text"
                        placeholder="Cari deskripsi, IP, user..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full"
                    />
                    <select
                        value={userFilter}
                        onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
                        className="border border-border-default rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Semua Pengguna</option>
                        {usersData.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                        className="border border-border-default rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Semua Aksi</option>
                        {actionTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                    <TextInput
                        type="date"
                        placeholder="Dari Tanggal"
                        value={dateFromFilter}
                        onChange={(e) => { setDateFromFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full"
                    />
                    <TextInput
                        type="date"
                        placeholder="Sampai Tanggal"
                        value={dateToFilter}
                        onChange={(e) => { setDateToFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={8} />
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-default">
                        <thead className="bg-surface-hover">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-12">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Waktu</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Pengguna</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Aksi</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Deskripsi</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">IP Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Device</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border-default">
                            {paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-surface-hover">
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span title={item.created_at}>{item.created_at_human}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.user ? (
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={item.user.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.name)}&background=6366f1&color=fff`}
                                                    alt={item.user.name}
                                                    className="h-7 w-7 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-text-primary">{item.user.name}</div>
                                                    <div className="text-xs text-text-secondary">@{item.user.username}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-text-secondary text-sm italic">Guest</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                                            {item.action_label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-text-primary max-w-xs truncate" title={item.description}>
                                            {item.description}
                                        </div>
                                        {item.model_name && (
                                            <div className="text-xs text-text-secondary">
                                                Model: {item.model_name} #{item.model_id}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                                            <Globe className="h-3.5 w-3.5" />
                                            <span>{item.ip_address || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                                            <Monitor className="h-3.5 w-3.5" />
                                            <span>{item.user_agent.browser} / {item.user_agent.platform}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.properties && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setDetailItem(item)}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                                        <Activity className="h-12 w-12 mx-auto mb-3 text-text-muted" />
                                        <p className="text-lg font-medium">Tidak ada activity log</p>
                                        <p className="text-sm">
                                            {hasFilters ? 'Tidak ada data yang cocok dengan filter' : 'Belum ada aktivitas tercatat'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}
            </div>

            {/* Pagination */}
            {activeLogs && totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Detail Modal */}
            <Modal
                isOpen={!!detailItem}
                onClose={() => setDetailItem(null)}
                title="Detail Perubahan"
                size="lg"
            >
                {detailItem?.properties && (
                        <div className="space-y-4">
                            <div className="bg-surface-hover rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-text-secondary">Waktu:</span>
                                    <p className="font-medium">{detailItem.created_at}</p>
                                </div>
                                <div>
                                    <span className="text-text-secondary">IP Address:</span>
                                    <p className="font-medium">{detailItem.ip_address || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-text-secondary">Pengguna:</span>
                                    <p className="font-medium">{detailItem.user?.name || 'Guest'}</p>
                                </div>
                                <div>
                                    <span className="text-text-secondary">Aksi:</span>
                                    <p className="font-medium">{detailItem.action_label}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-text-secondary mb-2">Data Properties:</h4>
                            <pre className="bg-surface-hover text-text-primary p-4 rounded-lg overflow-x-auto text-xs border border-border-default">
                                {JSON.stringify(detailItem.properties, null, 2)}
                            </pre>
                        </div>

                        <div className="flex justify-end">
                            <Button variant="secondary" onClick={() => setDetailItem(null)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Index;
