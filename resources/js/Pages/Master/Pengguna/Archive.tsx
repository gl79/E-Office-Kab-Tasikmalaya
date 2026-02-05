import { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import { User, PageProps } from '@/types';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks';

interface Props extends PageProps {
    data?: {
        data: User[];
        links: any;
        from: number;
    };
    filters: {
        search?: string;
    };
}

const CACHE_TTL_MS = 60_000;

export default function Archive({ data, filters }: Props) {
    const { auth } = usePage<PageProps>().props;
    const { data: activeData, isLoading, hasCached } = useDeferredDataMutable<Props['data']>(
        `master_pengguna_archive_${auth.user.id}`,
        data,
        CACHE_TTL_MS
    );
    const [restoreItem, setRestoreItem] = useState<User | null>(null);
    const [forceDeleteItem, setForceDeleteItem] = useState<User | null>(null);

    // Client-side search for true SPA
    const [localSearch, setLocalSearch] = useState('');
    const dataRows = activeData?.data ?? [];
    const links = activeData?.links ?? [];

    // Client-side filtered data
    const filteredData = useMemo(() => {
        if (!localSearch) return dataRows;
        const searchLower = localSearch.toLowerCase();
        return dataRows.filter(item => 
            item.name.toLowerCase().includes(searchLower) ||
            item.username.toLowerCase().includes(searchLower)
        );
    }, [dataRows, localSearch]);

    const handleRestore = () => {
        if (restoreItem) {
            router.post(route('master.pengguna.restore', restoreItem.id), {}, {
                preserveScroll: true,
                onSuccess: () => setRestoreItem(null),
            });
        }
    };

    const handleForceDelete = () => {
        if (forceDeleteItem) {
            router.delete(route('master.pengguna.force-delete', forceDeleteItem.id), {
                preserveScroll: true,
                onSuccess: () => setForceDeleteItem(null),
            });
        }
    };



    return (
        <AppLayout>
            <Head title="Archive Pengguna" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Archive Pengguna</h1>
                    <p className="text-text-secondary text-sm mt-1">Data pengguna yang sudah dihapus</p>
                </div>
                <Link href={route('master.pengguna.index')}>
                    <Button variant="secondary">Kembali</Button>
                </Link>
            </div>

            {/* Search */}
            <div className="mb-4 flex gap-4">
                <div className="flex-1 max-w-xs">
                    <TextInput
                        type="text"
                        placeholder="Cari nama, username..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full px-3"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={7} />
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-border-default">
                        <thead className="bg-surface-hover">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-16">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Foto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nama</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Dihapus</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border-default">
                            {filteredData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-surface-hover">
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                        <img
                                            src={item.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6366f1&color=fff`}
                                            alt={item.name}
                                            className="h-10 w-10 rounded-full object-cover border border-border-default opacity-75"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-text-primary">{item.name}</div>
                                        <div className="text-xs text-text-secondary">{item.jabatan || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-text-primary">{item.username}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-hover text-text-secondary">
                                            {item.role_label || item.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {item.deleted_at ? new Date(item.deleted_at).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => setRestoreItem(item)}>
                                                Restore
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => setForceDeleteItem(item)}>
                                                Hapus Permanen
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                                        {localSearch ? 'Tidak ada data yang cocok dengan filter' : 'Tidak ada data archive'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!localSearch && links.length > 0 && (
                <div className="mt-4 flex justify-center gap-1">
                    {links.map((link: any, index: number) => (
                        <button
                            key={index}
                            type="button"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                            className={`px-3 py-1.5 text-sm rounded-lg border ${
                                link.active 
                                    ? 'bg-primary text-text-inverse border-primary' 
                                    : 'bg-surface text-text-secondary border-border-default hover:bg-surface-hover'
                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Restore Modal */}
            <Modal
                isOpen={!!restoreItem}
                onClose={() => setRestoreItem(null)}
                title="Restore Pengguna"
                size="sm"
            >
                <p className="text-text-secondary">
                    Apakah Anda yakin ingin memulihkan pengguna <strong>{restoreItem?.name}</strong>?
                    Akun akan dapat digunakan kembali untuk login.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setRestoreItem(null)}>
                        Batal
                    </Button>
                    <Button onClick={handleRestore}>
                        Ya, Restore
                    </Button>
                </div>
            </Modal>

            {/* Force Delete Modal */}
            <Modal
                isOpen={!!forceDeleteItem}
                onClose={() => setForceDeleteItem(null)}
                title="Hapus Permanen"
                size="sm"
            >
                <p className="text-text-secondary">
                    Apakah Anda yakin ingin menghapus permanen pengguna <strong>{forceDeleteItem?.name}</strong>?
                    <span className="block mt-2 text-danger font-medium">Tindakan ini tidak dapat dibatalkan!</span>
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setForceDeleteItem(null)}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={handleForceDelete}>
                        Ya, Hapus Permanen
                    </Button>
                </div>
            </Modal>
        </AppLayout>
    );
}
