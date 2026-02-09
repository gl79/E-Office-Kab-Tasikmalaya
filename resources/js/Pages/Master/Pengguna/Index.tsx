import { useState, useRef, FormEvent, useMemo, useCallback, useEffect } from 'react';
import { Head, router, useForm, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal, Pagination } from '@/Components/ui';
import { InputLabel, TextInput, InputError } from '@/Components/form';
import { User, PageProps } from '@/types';
import { Search, Pencil, Trash2, Plus, Eye } from 'lucide-react';
import TableShimmer from '@/Components/shimmer/TableShimmer';
import { useDeferredDataMutable } from '@/hooks';

interface Props extends PageProps {
    data?: User[];
    filters: {
        search?: string;
        role?: string;
    };
    roles: Record<string, string>;
    modules: Record<string, string>;
}

// Module order matching sidebar
const MODULE_ORDER = [
    'dashboard',
    'master.kepegawaian',
    'master.pengguna',
    'master.unit-kerja',
    'master.indeks-surat',
    'persuratan.surat-masuk',
    'persuratan.surat-keluar',
    'cuti',
    'penjadwalan.jadwal',
    'penjadwalan.tentatif',
    'penjadwalan.definitif',
];

const CACHE_TTL_MS = 60_000;

const Index = ({ data, filters, roles, modules }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const { data: users, isLoading, hasCached } = useDeferredDataMutable<User[]>(
        `master_pengguna_${auth.user.id}`,
        data,
        CACHE_TTL_MS
    );
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<User | null>(null);
    const [deleteItem, setDeleteItem] = useState<User | null>(null);
    const [detailItem, setDetailItem] = useState<User | null>(null);
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Client-side search and filter state for true SPA experience
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Client-side filtered data
    const filteredData = useMemo(() => {
        if (!users) return [];
        let result = users;

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchLower) ||
                item.username.toLowerCase().includes(searchLower) ||
                (item.nip && item.nip.toLowerCase().includes(searchLower)) ||
                (item.jabatan && item.jabatan.toLowerCase().includes(searchLower))
            );
        }

        // Filter by role
        if (roleFilter) {
            result = result.filter(item => item.role === roleFilter);
        }

        return result;
    }, [users, search, roleFilter]);

    // Client-side pagination
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset page on search/filter change
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRoleFilter(e.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const form = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'tu' as string,
        nip: '',
        jenis_kelamin: '' as 'L' | 'P' | '',
        jabatan: '',
        module_access: [] as string[],
        foto: null as File | null,
    });

    // Ordered modules matching sidebar
    const orderedModules = useMemo(() => {
        const ordered: [string, string][] = [];
        MODULE_ORDER.forEach(key => {
            if (modules[key]) {
                ordered.push([key, modules[key]]);
            }
        });
        // Add any remaining modules not in order
        Object.entries(modules).forEach(([key, label]) => {
            if (!MODULE_ORDER.includes(key)) {
                ordered.push([key, label]);
            }
        });
        return ordered;
    }, [modules]);

    const openCreate = useCallback(() => {
        form.reset();
        form.clearErrors();
        setEditItem(null);
        setPreviewFoto(null);
        setShowModal(true);
    }, [form]);

    const openEdit = useCallback((item: User) => {
        form.setData({
            name: item.name,
            username: item.username,
            email: item.email || '',
            password: '',
            role: item.role,
            nip: item.nip || '',
            jenis_kelamin: item.jenis_kelamin || '',
            jabatan: item.jabatan || '',
            module_access: item.module_access || [],
            foto: null,
        });
        form.clearErrors();
        setEditItem(item);
        setPreviewFoto(item.foto_url || null);
        setShowModal(true);
    }, [form]);

    const handleFotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('foto', file);
            setPreviewFoto(URL.createObjectURL(file));
        }
    }, [form]);

    const handleModuleToggle = useCallback((module: string) => {
        const current = form.data.module_access;
        if (current.includes(module)) {
            form.setData('module_access', current.filter(m => m !== module));
        } else {
            form.setData('module_access', [...current, module]);
        }
    }, [form]);

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', form.data.name);
        formData.append('username', form.data.username);
        formData.append('email', form.data.email);
        if (form.data.password) {
            formData.append('password', form.data.password);
        }
        formData.append('role', form.data.role);
        formData.append('nip', form.data.nip);
        formData.append('jenis_kelamin', form.data.jenis_kelamin);
        formData.append('jabatan', form.data.jabatan);
        form.data.module_access.forEach((m, i) => {
            formData.append(`module_access[${i}]`, m);
        });
        if (form.data.foto) {
            formData.append('foto', form.data.foto);
        }

        if (editItem) {
            router.patch(route('master.pengguna.update', editItem.id), formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    setEditItem(null);
                },
            });
        } else {
            router.post(route('master.pengguna.store'), formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                },
            });
        }
    }, [form.data, editItem]);

    const handleDelete = useCallback(() => {
        if (deleteItem) {
            router.delete(route('master.pengguna.destroy', deleteItem.id), {
                preserveScroll: true,
                onSuccess: () => setDeleteItem(null),
            });
        }
    }, [deleteItem]);



    return (
        <>
            <Head title="Pengguna" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Data Pengguna</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola data pengguna sistem</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-surface rounded-lg border border-border-default">
                {/* Toolbar */}
                <div className="p-4 border-b border-border-default">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-3/4">
                            <div className="flex gap-2 w-full sm:w-2/4">
                                <TextInput
                                    type="text"
                                    placeholder="Cari nama, username, NIP..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full px-2"
                                />
                                <Button variant="secondary" disabled>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                            <select
                                value={roleFilter}
                                onChange={handleRoleChange}
                                className="border border-border-default rounded-lg px-3 py-2 focus:border-primary focus:ring-primary"
                            >
                                <option value="">Semua Role</option>
                                {Object.entries(roles).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={openCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Pengguna
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {isLoading && !hasCached ? (
                    <div className="p-4">
                        <TableShimmer columns={7} />
                    </div>
                ) : (
                <table className="min-w-full border-collapse border border-border-default">
                    <thead className="bg-surface-hover">
                        <tr>
                            <th className="px-4 py-3 border border-border-default text-center text-xs font-bold text-text-secondary uppercase w-16">No</th>
                            <th className="px-4 py-3 border border-border-default text-center text-xs font-bold text-text-secondary uppercase">Foto</th>
                            <th className="px-4 py-3 border border-border-default text-left text-xs font-bold text-text-secondary uppercase">Nama</th>
                            <th className="px-4 py-3 border border-border-default text-left text-xs font-bold text-text-secondary uppercase">Jabatan</th>
                            <th className="px-4 py-3 border border-border-default text-left text-xs font-bold text-text-secondary uppercase">Username</th>
                            <th className="px-4 py-3 border border-border-default text-left text-xs font-bold text-text-secondary uppercase">Role</th>
                            <th className="px-4 py-3 border border-border-default text-center text-xs font-bold text-text-secondary uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface">
                        {paginatedData.map((item, index) => (
                            <tr key={item.id} className="hover:bg-surface-hover">
                                <td className="px-4 py-3 border border-border-default text-center text-text-secondary text-sm">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-4 py-3 border border-border-default text-center">
                                    <div className="flex justify-center">
                                        <img
                                            src={item.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6366f1&color=fff`}
                                            alt={item.name}
                                            className="h-10 w-10 rounded-full object-cover border border-border-default"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 border border-border-default font-medium text-text-primary">{item.name}</td>
                                <td className="px-4 py-3 border border-border-default text-text-secondary">{item.jabatan || '-'}</td>
                                <td className="px-4 py-3 border border-border-default text-text-primary">{item.username}</td>
                                <td className="px-4 py-3 border border-border-default">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
                                        {item.role_label || item.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 border border-border-default text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setDetailItem(item)} title="Lihat Detail">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => openEdit(item)} title="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        {item.id !== auth.user.id && (
                                            <Button size="sm" variant="danger" onClick={() => setDeleteItem(item)} title="Hapus">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 border border-border-default text-center text-text-secondary">
                                    {search || roleFilter ? 'Tidak ada data yang cocok dengan filter' : 'Tidak ada data pengguna'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-border-default">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-text-secondary">
                            Menampilkan {paginatedData.length} dari {filteredData.length} data
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal - Fixed stable layout */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editItem ? 'Edit Pengguna' : 'Tambah Pengguna'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Foto Upload */}
                            <div className="md:col-span-2 flex items-center gap-4 min-h-[88px]">
                                <div className="shrink-0">
                                    <img
                                        src={previewFoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.data.name || 'User')}&background=6366f1&color=fff`}
                                        alt="Preview"
                                        className="h-20 w-20 rounded-full object-cover border-2 border-border-default"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFotoChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Pilih Foto
                                    </Button>
                                    <p className="text-xs text-text-secondary mt-1">JPG, PNG. Max 2MB</p>
                                </div>
                            </div>

                            {/* Nama */}
                            <div className="min-h-[76px] ml-2">
                                <InputLabel htmlFor="name" value="Nama Lengkap *" />
                                <TextInput
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="mt-1 w-full px-2"
                                    required
                                />
                                <InputError message={form.errors.name} className="mt-1" />
                            </div>

                            {/* Username */}
                            <div className="min-h-[76px]">
                                <InputLabel htmlFor="username" value="Username *" />
                                <TextInput
                                    id="username"
                                    value={form.data.username}
                                    onChange={(e) => form.setData('username', e.target.value)}
                                    className="mt-1 w-full px-2"
                                    required
                                />
                                <InputError message={form.errors.username} className="mt-1" />
                            </div>

                            {/* NIP */}
                            <div className="min-h-[76px] ml-2">
                                <InputLabel htmlFor="nip" value="NIP" />
                                <TextInput
                                    id="nip"
                                    value={form.data.nip}
                                    onChange={(e) => form.setData('nip', e.target.value)}
                                    className="mt-1 w-full px-2"
                                    placeholder="199001012020011001"
                                />
                                <InputError message={form.errors.nip} className="mt-1" />
                            </div>

                            {/* Jabatan */}
                            <div className="min-h-[76px]">
                                <InputLabel htmlFor="jabatan" value="Jabatan" />
                                <TextInput
                                    id="jabatan"
                                    value={form.data.jabatan}
                                    onChange={(e) => form.setData('jabatan', e.target.value)}
                                    className="mt-1 w-full px-2"
                                />
                                <InputError message={form.errors.jabatan} className="mt-1" />
                            </div>

                            {/* Jenis Kelamin */}
                            <div className="min-h-[76px] ml-2">
                                <InputLabel value="Jenis Kelamin" />
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="jenis_kelamin"
                                            value="L"
                                            checked={form.data.jenis_kelamin === 'L'}
                                            onChange={() => form.setData('jenis_kelamin', 'L')}
                                            className="mr-2"
                                        />
                                        <span>Laki-laki</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="jenis_kelamin"
                                            value="P"
                                            checked={form.data.jenis_kelamin === 'P'}
                                            onChange={() => form.setData('jenis_kelamin', 'P')}
                                            className="mr-2"
                                        />
                                        <span>Perempuan</span>
                                    </label>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="min-h-[76px]">
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="mt-1 w-full px-2"
                                />
                                <InputError message={form.errors.email} className="mt-1" />
                            </div>

                            {/* Password */}
                            <div className="min-h-[76px] ml-2">
                                <InputLabel htmlFor="password" value={editItem ? 'Password (kosongkan jika tidak diubah)' : 'Password *'} />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    className="mt-1 w-full px-2"
                                    required={!editItem}
                                />
                                <InputError message={form.errors.password} className="mt-1" />
                            </div>

                            {/* Role */}
                            <div className="min-h-[76px]">
                                <InputLabel htmlFor="role" value="Role *" />
                                <select
                                    id="role"
                                    value={form.data.role}
                                    onChange={(e) => form.setData('role', e.target.value)}
                                    className="mt-1 w-full border border-border-default rounded-lg px-3 py-2 focus:border-primary focus:ring-primary"
                                    required
                                >
                                    {Object.entries(roles).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                <InputError message={form.errors.role} className="mt-1" />
                            </div>

                            {/* Module Access - UI only, not applied yet */}
                            <div className="md:col-span-2">
                                <InputLabel value="Akses Modul" />
                                <p className="text-xs text-text-secondary mb-2">
                                    Pilih modul yang dapat diakses oleh pengguna ini
                                    <span className="text-accent-dark ml-1">(Fitur dalam pengembangan)</span>
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-surface-hover rounded-lg">
                                    {orderedModules.map(([key, label]) => (
                                        <label key={key} className="flex items-center text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.data.module_access.includes(key)}
                                                onChange={() => handleModuleToggle(key)}
                                                className="mr-2 rounded border-border-default text-primary focus:ring-primary"
                                            />
                                            <span className="truncate">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer buttons - sticky */}
                    <div className="mt-6 pt-4 border-t border-border-default flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={!!detailItem}
                onClose={() => setDetailItem(null)}
                title="Detail Pengguna"
                size="lg"
            >
                {detailItem && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={detailItem.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailItem.name)}&background=6366f1&color=fff`}
                                alt={detailItem.name}
                                className="h-20 w-20 rounded-full object-cover border-2 border-border-default"
                            />
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">{detailItem.name}</h3>
                                <p className="text-sm text-text-secondary">{detailItem.jabatan || '-'}</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark mt-1">
                                    {detailItem.role_label || detailItem.role}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-default">
                            <div>
                                <p className="text-xs text-text-secondary">Username</p>
                                <p className="text-sm font-medium text-text-primary">{detailItem.username}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Email</p>
                                <p className="text-sm font-medium text-text-primary">{detailItem.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">NIP</p>
                                <p className="text-sm font-medium text-text-primary">{detailItem.nip || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Jenis Kelamin</p>
                                <p className="text-sm font-medium text-text-primary">
                                    {detailItem.jenis_kelamin === 'L' ? 'Laki-laki' : detailItem.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                                </p>
                            </div>
                        </div>
                        {detailItem.module_access && detailItem.module_access.length > 0 && (
                            <div className="pt-2 border-t border-border-default">
                                <p className="text-xs text-text-secondary mb-2">Akses Modul</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {MODULE_ORDER.filter(m => detailItem.module_access?.includes(m)).map(m => (
                                        <span key={m} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-light text-primary-dark">
                                            {modules[m] || m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end mt-4">
                            <Button variant="secondary" onClick={() => setDetailItem(null)}>Tutup</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                title="Hapus Pengguna"
                size="sm"
            >
                <p className="text-text-secondary">
                    Apakah Anda yakin ingin menghapus pengguna <strong>{deleteItem?.name}</strong>?
                    Data akan dipindahkan ke Archive dan akun tidak dapat digunakan untuk login.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setDeleteItem(null)}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Ya, Hapus
                    </Button>
                </div>
            </Modal>
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Index;
