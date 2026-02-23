import { useState, useMemo, useCallback } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks';
import { PageProps } from '@/types';
import {
    Activity, Monitor, Globe, Clock, Eye, Filter, X, RotateCcw,
    LogIn, LogOut, AlertTriangle, Plus, Pencil, Trash2, KeyRound, RefreshCw,
} from 'lucide-react';

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
    properties: Record<string, unknown> | null;
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

// Konfigurasi tampilan per jenis aksi
const ACTION_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    login:           { color: 'bg-success-light text-success',           icon: <LogIn className="h-3 w-3" /> },
    logout:          { color: 'bg-surface-hover text-text-secondary border border-border-default', icon: <LogOut className="h-3 w-3" /> },
    login_failed:    { color: 'bg-danger-light text-danger',             icon: <AlertTriangle className="h-3 w-3" /> },
    create:          { color: 'bg-primary-light text-primary',           icon: <Plus className="h-3 w-3" /> },
    update:          { color: 'bg-warning-light text-warning',           icon: <Pencil className="h-3 w-3" /> },
    delete:          { color: 'bg-danger-light text-danger',             icon: <Trash2 className="h-3 w-3" /> },
    force_delete:    { color: 'bg-danger-light text-danger',             icon: <Trash2 className="h-3 w-3" /> },
    restore:         { color: 'bg-secondary-light text-secondary',       icon: <RefreshCw className="h-3 w-3" /> },
    password_change: { color: 'bg-accent-light text-accent',             icon: <KeyRound className="h-3 w-3" /> },
};

const DEFAULT_ACTION = { color: 'bg-surface-hover text-text-secondary', icon: <Activity className="h-3 w-3" /> };

const Index = ({ logs, users, actionTypes }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const { data: cachedData, isLoading, hasCached } = useDeferredDataMutable<{
        logs?: ActivityLogItem[];
        users?: { id: string; name: string; username: string }[];
    }>(
        `pengaturan_activity_logs_${auth.user.id}`,
        logs !== undefined || users !== undefined ? { logs, users } : undefined,
        CACHE_TTL_MS
    );

    const activeLogs = cachedData?.logs;
    const activeUsers = cachedData?.users;

    const [search, setSearch]               = useState('');
    const [userFilter, setUserFilter]       = useState('');
    const [actionFilter, setActionFilter]   = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter]   = useState('');
    const [showFilters, setShowFilters]     = useState(false);
    const [currentPage, setCurrentPage]     = useState(1);
    const [detailItem, setDetailItem]       = useState<ActivityLogItem | null>(null);
    const itemsPerPage = 15;

    const logsData  = activeLogs  || [];
    const usersData = activeUsers || [];

    const filteredData = useMemo(() => {
        let result = logsData;
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(item =>
                item.description.toLowerCase().includes(s) ||
                item.ip_address?.toLowerCase().includes(s) ||
                item.user?.name.toLowerCase().includes(s) ||
                item.user?.username.toLowerCase().includes(s) ||
                item.action_label.toLowerCase().includes(s)
            );
        }
        if (userFilter)     result = result.filter(item => item.user_id === userFilter);
        if (actionFilter)   result = result.filter(item => item.action === actionFilter);
        if (dateFromFilter) result = result.filter(item => item.created_at >= dateFromFilter);
        if (dateToFilter)   result = result.filter(item => item.created_at.substring(0, 10) <= dateToFilter);
        return result;
    }, [logsData, search, userFilter, actionFilter, dateFromFilter, dateToFilter]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);

    const clearFilters = useCallback(() => {
        setSearch('');
        setUserFilter('');
        setActionFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        setCurrentPage(1);
    }, []);

    const hasFilters = !!(search || userFilter || actionFilter || dateFromFilter || dateToFilter);

    const getActionConfig = (action: string) => ACTION_CONFIG[action] ?? DEFAULT_ACTION;

    // Ringkasan statistik aksi
    const actionSummary = useMemo(() => {
        const counts: Record<string, number> = {};
        logsData.forEach(item => { counts[item.action] = (counts[item.action] || 0) + 1; });
        return counts;
    }, [logsData]);

    return (
        <>
            <Head title="Activity Logs" />

            {/* ── Page Header ── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold text-text-primary">
                        <Activity className="h-6 w-6 text-primary" />
                        Activity Logs
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Riwayat aktivitas seluruh pengguna dalam sistem
                    </p>
                </div>

                {/* Statistik ringkas */}
                {logsData.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {actionSummary['login'] !== undefined && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-success-light px-3 py-1.5 text-xs font-medium text-success">
                                <LogIn className="h-3.5 w-3.5" />
                                Login: {actionSummary['login']}
                            </span>
                        )}
                        {actionSummary['login_failed'] !== undefined && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-danger-light px-3 py-1.5 text-xs font-medium text-danger">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Gagal: {actionSummary['login_failed']}
                            </span>
                        )}
                        {(actionSummary['create'] || actionSummary['update'] || actionSummary['delete']) && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-light px-3 py-1.5 text-xs font-medium text-primary">
                                <Activity className="h-3.5 w-3.5" />
                                Aktivitas Data: {(actionSummary['create'] || 0) + (actionSummary['update'] || 0) + (actionSummary['delete'] || 0)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Main Card ── */}
            <div className="rounded-xl border border-border-default bg-surface shadow-sm">

                {/* ── Toolbar ── */}
                <div className="border-b border-border-default p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <TextInput
                            type="text"
                            placeholder="Cari deskripsi, IP, nama pengguna..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full px-2 sm:max-w-xs"
                        />
                        <div className="flex gap-2 sm:ml-auto">
                            <Button
                                variant="secondary"
                                onClick={() => setShowFilters(!showFilters)}
                                className="gap-2"
                            >
                                <Filter className={`h-4 w-4 ${(showFilters || (hasFilters && !search)) ? 'text-primary' : ''}`} />
                                Filter
                                {hasFilters && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                        {[userFilter, actionFilter, dateFromFilter, dateToFilter].filter(Boolean).length}
                                    </span>
                                )}
                            </Button>
                            {hasFilters && (
                                <Button variant="secondary" onClick={clearFilters} className="gap-1.5">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Panel filter */}
                    {showFilters && (
                        <div className="mt-3 rounded-lg border border-border-default bg-surface-hover p-4 animate-in fade-in slide-in-from-top-2">
                            <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${auth.user.role === 'superadmin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                                {auth.user.role === 'superadmin' && (
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-text-secondary">Pengguna</label>
                                        <select
                                            value={userFilter}
                                            onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
                                            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Semua Pengguna</option>
                                            {usersData.map((user) => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">Jenis Aksi</label>
                                    <select
                                        value={actionFilter}
                                        onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                                        className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">Semua Aksi</option>
                                        {actionTypes.map((type) => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={dateFromFilter}
                                        onChange={(e) => { setDateFromFilter(e.target.value); setCurrentPage(1); }}
                                        className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={dateToFilter}
                                        onChange={(e) => { setDateToFilter(e.target.value); setCurrentPage(1); }}
                                        className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Subheader: jumlah hasil */}
                <div className="flex items-center justify-between border-b border-border-default px-4 py-2.5">
                    <p className="text-xs text-text-secondary">
                        Menampilkan <span className="font-semibold text-text-primary">{filteredData.length}</span> dari{' '}
                        <span className="font-semibold text-text-primary">{logsData.length}</span> log aktivitas
                    </p>
                </div>

                {/* ── Tabel ── */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={7} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border-default">
                            <thead className="bg-surface-hover">
                                <tr>
                                    <th className="w-12 px-4 py-3 text-center text-xs font-semibold uppercase text-text-secondary">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Waktu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Pengguna</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Aksi</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Deskripsi</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">IP / Perangkat</th>
                                    <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase text-text-secondary">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default bg-surface">
                                {paginatedData.map((item, index) => {
                                    const cfg = getActionConfig(item.action);
                                    return (
                                        <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                                            {/* No */}
                                            <td className="px-4 py-3 text-center text-sm text-text-muted">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>

                                            {/* Waktu */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                                                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" />
                                                    <span title={item.created_at}>{item.created_at_human}</span>
                                                </div>
                                            </td>

                                            {/* Pengguna */}
                                            <td className="px-4 py-3">
                                                {item.user ? (
                                                    <div className="flex items-center gap-2.5">
                                                        <img
                                                            src={item.user.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.name)}&background=2563eb&color=fff&size=64`}
                                                            alt={item.user.name}
                                                            className="h-8 w-8 flex-shrink-0 rounded-full object-cover ring-2 ring-border-default"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="truncate text-sm font-medium text-text-primary">{item.user.name}</div>
                                                            <div className="text-xs text-text-muted">@{item.user.username}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm italic text-text-muted">Guest</span>
                                                )}
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                                                    {cfg.icon}
                                                    {item.action_label}
                                                </span>
                                            </td>

                                            {/* Deskripsi */}
                                            <td className="px-4 py-3">
                                                <div className="max-w-xs truncate text-sm text-text-primary" title={item.description}>
                                                    {item.description}
                                                </div>
                                                {item.model_name && (
                                                    <div className="mt-0.5 text-xs text-text-muted">
                                                        {item.model_name}
                                                        {item.model_id && <span className="ml-1 font-mono">#{item.model_id.substring(0, 8)}</span>}
                                                    </div>
                                                )}
                                            </td>

                                            {/* IP / Perangkat */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                                                    <Globe className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" />
                                                    <span className="font-mono text-xs">{item.ip_address || '-'}</span>
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-1.5">
                                                    <Monitor className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" />
                                                    <span className="text-xs text-text-muted truncate max-w-[160px]">
                                                        {item.user_agent.browser} / {item.user_agent.platform}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Detail */}
                                            <td className="px-4 py-3 text-center">
                                                {item.properties && (
                                                    <button
                                                        onClick={() => setDetailItem(item)}
                                                        className="inline-flex items-center justify-center rounded-lg border border-border-default bg-surface p-1.5 text-text-secondary transition-colors hover:bg-primary-light hover:text-primary hover:border-primary"
                                                        title="Lihat detail"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <Activity className="mx-auto mb-3 h-12 w-12 text-text-muted" />
                                            <p className="text-base font-medium text-text-primary">Tidak ada activity log</p>
                                            <p className="mt-1 text-sm text-text-secondary">
                                                {hasFilters ? 'Tidak ada data yang cocok dengan filter yang dipilih.' : 'Belum ada aktivitas yang tercatat dalam sistem.'}
                                            </p>
                                            {hasFilters && (
                                                <button onClick={clearFilters} className="mt-3 text-sm font-medium text-primary hover:underline">
                                                    Reset filter
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {activeLogs && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border-default px-4 py-3">
                        <p className="text-sm text-text-secondary">
                            Halaman {currentPage} dari {totalPages}
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* ── Modal Detail ── */}
            <Modal
                isOpen={!!detailItem}
                onClose={() => setDetailItem(null)}
                title="Detail Aktivitas"
                size="lg"
            >
                {detailItem && (
                    <div className="space-y-4">
                        {/* Info ringkas */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-surface-hover p-3">
                                <p className="text-xs font-medium text-text-secondary">Pengguna</p>
                                <p className="mt-0.5 text-sm font-semibold text-text-primary">{detailItem.user?.name || 'Guest'}</p>
                            </div>
                            <div className="rounded-lg bg-surface-hover p-3">
                                <p className="text-xs font-medium text-text-secondary">Aksi</p>
                                <span className={`mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getActionConfig(detailItem.action).color}`}>
                                    {getActionConfig(detailItem.action).icon}
                                    {detailItem.action_label}
                                </span>
                            </div>
                            <div className="rounded-lg bg-surface-hover p-3">
                                <p className="text-xs font-medium text-text-secondary">Waktu</p>
                                <p className="mt-0.5 text-sm text-text-primary font-mono">{detailItem.created_at}</p>
                            </div>
                            <div className="rounded-lg bg-surface-hover p-3">
                                <p className="text-xs font-medium text-text-secondary">IP Address</p>
                                <p className="mt-0.5 text-sm font-mono text-text-primary">{detailItem.ip_address || '-'}</p>
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="rounded-lg border border-border-default p-3">
                            <p className="text-xs font-medium text-text-secondary mb-1">Deskripsi</p>
                            <p className="text-sm text-text-primary">{detailItem.description}</p>
                        </div>

                        {/* Properties */}
                        {detailItem.properties && (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Data Properties</p>
                                <pre className="overflow-x-auto rounded-lg border border-border-default bg-surface-hover p-4 text-xs text-text-primary">
                                    {JSON.stringify(detailItem.properties, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button variant="secondary" onClick={() => setDetailItem(null)}>
                                <X className="mr-1.5 h-4 w-4" />
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
