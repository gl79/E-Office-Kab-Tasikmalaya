import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Camera, Eye, EyeOff, Lock, User, Mail, Briefcase, Hash, CheckCircle2 } from 'lucide-react';
import { PageProps } from '@/types';

interface ProfileUser {
    id: number;
    name: string;
    username: string;
    email: string | null;
    nip: string | null;
    jabatan: string | null;
    jenis_kelamin: 'L' | 'P' | null;
    foto_url: string | null;
}

interface Props {
    status?: string;
    user: ProfileUser;
}

const ROLE_LABELS: Record<string, string> = {
    superadmin: 'Super Admin',
    tu: 'Tata Usaha',
    pimpinan: 'Pimpinan',
    user: 'User',
};

const Edit = ({ user }: Props) => {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user?.role || '';

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        username: user.username,
        email: user.email || '',
        nip: user.nip || '',
        jenis_kelamin: user.jenis_kelamin || '',
        jabatan: user.jabatan || '',
        foto: null as File | null,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
        _method: 'PATCH',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setData('foto', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: '',
                    foto: null,
                }));
                setPreviewUrl(null);
            },
        });
    };

    const currentPhoto = previewUrl || user.foto_url;
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=128`;

    const fieldBase = "mt-1 block w-full rounded-lg border border-border-default bg-surface px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";
    const fieldWithIcon = `${fieldBase} pl-9`;

    return (
        <>
            <Head title="Profil" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">Profil Saya</h1>
                <p className="text-text-secondary text-sm mt-1">Kelola informasi profil dan keamanan akun Anda</p>
            </div>

            <div className="space-y-6">
                {/* ── Profile Overview Card ── */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-dark p-6 shadow-sm">
                    {/* Dekorasi lingkaran */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-white/5" />

                    <div className="relative flex items-center gap-5">
                        {/* Avatar dengan tombol ganti foto */}
                        <div className="relative flex-shrink-0">
                            <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white/30 shadow-lg">
                                <img
                                    src={currentPhoto || avatarFallback}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <label
                                htmlFor="foto"
                                className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white shadow-md hover:bg-surface-hover transition-colors"
                                title="Ganti foto profil"
                            >
                                <Camera className="h-3.5 w-3.5 text-primary" />
                            </label>
                        </div>

                        {/* Informasi singkat user */}
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-white truncate">{data.name || user.name}</h2>
                            {user.jabatan && (
                                <p className="text-white/80 text-sm mt-0.5">{user.jabatan}</p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                                    @{user.username}
                                </span>
                                {ROLE_LABELS[role] && (
                                    <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                                        {ROLE_LABELS[role]}
                                    </span>
                                )}
                                {user.nip && (
                                    <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                                        NIP {user.nip}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Form ── */}
                <form onSubmit={submit} encType="multipart/form-data">
                    <div className="overflow-hidden rounded-xl border border-border-default bg-surface shadow-sm">

                        {/* ── Seksi 1: Informasi Akun ── */}
                        <div className="p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">Informasi Akun</h3>
                                    <p className="text-xs text-text-secondary">Data diri dan identitas pengguna</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Nama Lengkap */}
                                <div>
                                    <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Nama Lengkap <span className="text-danger">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                                        <input
                                            id="name"
                                            className={fieldWithIcon}
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoComplete="name"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
                                </div>

                                {/* Username */}
                                <div>
                                    <label htmlFor="username" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Username <span className="text-danger">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted">@</span>
                                        <input
                                            id="username"
                                            className={fieldWithIcon}
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            required
                                            autoComplete="username"
                                            placeholder="username"
                                        />
                                    </div>
                                    {errors.username && <p className="mt-1 text-xs text-danger">{errors.username}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                                        <input
                                            id="email"
                                            type="email"
                                            className={fieldWithIcon}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoComplete="email"
                                            placeholder="email@domain.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
                                </div>

                                {/* NIP */}
                                <div>
                                    <label htmlFor="nip" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        NIP
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                                        <input
                                            id="nip"
                                            className={fieldWithIcon}
                                            value={data.nip}
                                            onChange={(e) => setData('nip', e.target.value)}
                                            placeholder="Nomor Induk Pegawai"
                                        />
                                    </div>
                                    {errors.nip && <p className="mt-1 text-xs text-danger">{errors.nip}</p>}
                                </div>

                                {/* Jabatan */}
                                <div>
                                    <label htmlFor="jabatan" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Jabatan
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                                        <input
                                            id="jabatan"
                                            className={fieldWithIcon}
                                            value={data.jabatan}
                                            onChange={(e) => setData('jabatan', e.target.value)}
                                            placeholder="Jabatan atau posisi"
                                        />
                                    </div>
                                    {errors.jabatan && <p className="mt-1 text-xs text-danger">{errors.jabatan}</p>}
                                </div>

                                {/* Jenis Kelamin */}
                                <div>
                                    <label htmlFor="jenis_kelamin" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        id="jenis_kelamin"
                                        className={fieldBase}
                                        value={data.jenis_kelamin}
                                        onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                    >
                                        <option value="">Pilih jenis kelamin</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                    {errors.jenis_kelamin && <p className="mt-1 text-xs text-danger">{errors.jenis_kelamin}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border-default" />

                        {/* ── Seksi 2: Foto Profil ── */}
                        <div className="p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light">
                                    <Camera className="h-4 w-4 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">Foto Profil</h3>
                                    <p className="text-xs text-text-secondary">Foto tampil di sidebar dan halaman profil</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-border-default">
                                    <img
                                        src={currentPhoto || avatarFallback}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        id="foto"
                                        type="file"
                                        accept="image/*"
                                        className="block w-full text-sm text-text-secondary
                                            file:mr-3 file:cursor-pointer file:rounded-lg file:border-0
                                            file:bg-primary-light file:px-4 file:py-2
                                            file:text-sm file:font-medium file:text-primary
                                            file:transition-colors hover:file:bg-primary hover:file:text-text-inverse"
                                        onChange={handleFileChange}
                                    />
                                    <p className="mt-1.5 text-xs text-text-muted">Format JPG atau PNG, maksimal 2MB.</p>
                                    {errors.foto && <p className="mt-1 text-xs text-danger">{errors.foto}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border-default" />

                        {/* ── Seksi 3: Keamanan Akun ── */}
                        <div className="p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-light">
                                    <Lock className="h-4 w-4 text-danger" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">Keamanan Akun</h3>
                                    <p className="text-xs text-text-secondary">Kosongkan semua field jika tidak ingin mengubah password. Min. 8 karakter.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Password Lama */}
                                <div>
                                    <label htmlFor="current_password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Password Lama
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="current_password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            className={`${fieldBase} pr-10`}
                                            value={data.current_password}
                                            onChange={(e) => setData('current_password', e.target.value)}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-secondary"
                                            tabIndex={-1}
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.current_password && <p className="mt-1 text-xs text-danger">{errors.current_password}</p>}
                                </div>

                                {/* Password Baru */}
                                <div>
                                    <label htmlFor="new_password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new_password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            className={`${fieldBase} pr-10`}
                                            value={data.new_password}
                                            onChange={(e) => setData('new_password', e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="Min. 8 karakter"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-secondary"
                                            tabIndex={-1}
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.new_password && <p className="mt-1 text-xs text-danger">{errors.new_password}</p>}
                                </div>

                                {/* Konfirmasi Password */}
                                <div>
                                    <label htmlFor="new_password_confirmation" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Konfirmasi Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new_password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className={`${fieldBase} pr-10`}
                                            value={data.new_password_confirmation}
                                            onChange={(e) => setData('new_password_confirmation', e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="Ulangi password baru"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-secondary"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border-default" />

                        {/* ── Footer: Simpan ── */}
                        <div className="flex items-center justify-between gap-4 bg-surface-hover px-6 py-4">
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-out duration-300"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                <div className="flex items-center gap-1.5 text-sm font-medium text-secondary">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Perubahan berhasil disimpan!
                                </div>
                            </Transition>

                            <div className="ml-auto">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-primary px-6 py-2.5 text-sm font-medium text-text-inverse transition-colors hover:bg-primary-hover focus:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </>
    );
};

Edit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Edit;
