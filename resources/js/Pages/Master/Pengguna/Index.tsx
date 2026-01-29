import { useState, useRef, FormEvent, useMemo } from 'react';
import { Head, router, useForm, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Modal } from '@/Components/ui';
import { InputLabel, TextInput, InputError } from '@/Components/form';
import { User, PageProps } from '@/types';

interface Props extends PageProps {
    data: {
        data: User[];
        links: any;
        current_page: number;
        from: number;
    };
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

export default function Index({ data, filters, roles, modules }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<User | null>(null);
    const [deleteItem, setDeleteItem] = useState<User | null>(null);
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Client-side search for true SPA experience
    const [localSearch, setLocalSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');

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

    // Client-side filtered data - true SPA without reload
    const filteredData = useMemo(() => {
        let result = data.data;
        
        // Filter by local search (case insensitive)
        if (localSearch) {
            const searchLower = localSearch.toLowerCase();
            result = result.filter(item => 
                item.name.toLowerCase().includes(searchLower) ||
                item.username.toLowerCase().includes(searchLower) ||
                (item.nip && item.nip.toLowerCase().includes(searchLower))
            );
        }
        
        // Filter by role
        if (roleFilter) {
            result = result.filter(item => item.role === roleFilter);
        }
        
        return result;
    }, [data.data, localSearch, roleFilter]);

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

    const openCreate = () => {
        form.reset();
        form.clearErrors();
        setEditItem(null);
        setPreviewFoto(null);
        setShowModal(true);
    };

    const openEdit = (item: User) => {
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
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('foto', file);
            setPreviewFoto(URL.createObjectURL(file));
        }
    };

    const handleModuleToggle = (module: string) => {
        const current = form.data.module_access;
        if (current.includes(module)) {
            form.setData('module_access', current.filter(m => m !== module));
        } else {
            form.setData('module_access', [...current, module]);
        }
    };

    const handleSubmit = (e: FormEvent) => {
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
            router.post(route('master.pengguna.update', editItem.id), formData, {
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
    };

    const handleDelete = () => {
        if (deleteItem) {
            router.delete(route('master.pengguna.destroy', deleteItem.id), {
                preserveScroll: true,
                onSuccess: () => setDeleteItem(null),
            });
        }
    };

    // Check if current user can manage users
    if (!auth.user.can_manage_users) {
        return (
            <AppLayout>
                <Head title="Pengguna" />
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-xl font-semibold text-text-primary mb-2">Akses Ditolak</h2>
                    <p className="text-text-secondary">Anda tidak memiliki akses untuk mengelola pengguna.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Pengguna" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Pengguna</h1>
                    <p className="text-text-secondary text-sm mt-1">Kelola data pengguna sistem</p>
                </div>
                <div className="flex gap-2">
                    <Link href={route('master.pengguna.archive')}>
                        <Button variant="secondary">Archive</Button>
                    </Link>
                    <Button onClick={openCreate}>Tambah Pengguna</Button>
                </div>
            </div>

            {/* Filters - Client side, no reload */}
            <div className="mb-4 flex gap-4">
                <div className="flex-1 max-w-xs">
                    <TextInput
                        type="text"
                        placeholder="Cari nama, username, NIP..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border border-border-default rounded-lg px-3 py-2"
                >
                    <option value="">Semua Role</option>
                    {Object.entries(roles).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border-default">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-16">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Foto</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Nama</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Username</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">NIP</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border-default">
                        {filteredData.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-text-secondary text-sm">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3">
                                    <img
                                        src={item.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6366f1&color=fff`}
                                        alt={item.name}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-text-primary">{item.name}</div>
                                    <div className="text-xs text-text-secondary">{item.jabatan || '-'}</div>
                                </td>
                                <td className="px-4 py-3 text-text-primary">{item.username}</td>
                                <td className="px-4 py-3 text-text-secondary">{item.nip || '-'}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
                                        {item.role_label || item.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                                            Edit
                                        </Button>
                                        {item.id !== auth.user.id && (
                                            <Button size="sm" variant="danger" onClick={() => setDeleteItem(item)}>
                                                Hapus
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                                    {localSearch || roleFilter ? 'Tidak ada data yang cocok dengan filter' : 'Tidak ada data pengguna'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination - only show if no local filter */}
            {!localSearch && !roleFilter && data.links && (
                <div className="mt-4 flex justify-center gap-1">
                    {data.links.map((link: any, index: number) => (
                        <button
                            key={index}
                            type="button"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                            className={`px-3 py-1.5 text-sm rounded-lg border ${
                                link.active 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

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
                                <div className="flex-shrink-0">
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
                            <div className="min-h-[76px]">
                                <InputLabel htmlFor="name" value="Nama Lengkap *" />
                                <TextInput
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="mt-1 w-full"
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
                                    className="mt-1 w-full"
                                    required
                                />
                                <InputError message={form.errors.username} className="mt-1" />
                            </div>

                            {/* NIP */}
                            <div className="min-h-[76px]">
                                <InputLabel htmlFor="nip" value="NIP" />
                                <TextInput
                                    id="nip"
                                    value={form.data.nip}
                                    onChange={(e) => form.setData('nip', e.target.value)}
                                    className="mt-1 w-full"
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
                                    className="mt-1 w-full"
                                />
                                <InputError message={form.errors.jabatan} className="mt-1" />
                            </div>

                            {/* Jenis Kelamin */}
                            <div className="min-h-[76px]">
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
                                    className="mt-1 w-full"
                                />
                                <InputError message={form.errors.email} className="mt-1" />
                            </div>

                            {/* Password */}
                            <div className="min-h-[76px]">
                                <InputLabel htmlFor="password" value={editItem ? 'Password (kosongkan jika tidak diubah)' : 'Password *'} />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    className="mt-1 w-full"
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
                                    className="mt-1 w-full border border-border-default rounded-lg px-3 py-2"
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
                                    <span className="text-amber-600 ml-1">(Fitur dalam pengembangan)</span>
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                                    {orderedModules.map(([key, label]) => (
                                        <label key={key} className="flex items-center text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.data.module_access.includes(key)}
                                                onChange={() => handleModuleToggle(key)}
                                                className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
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
        </AppLayout>
    );
}
