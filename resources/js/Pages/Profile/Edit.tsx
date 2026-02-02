import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Camera, Eye, EyeOff, Lock } from 'lucide-react';

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

const Edit = ({ status, user }: Props) => {
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
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
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
                // Reset password fields after successful save
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

    const inputClasses = "border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm mt-1 block w-full";

    return (
        <>
            <Head title="Profil" />
            
            <div className="mb-6">
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    Profil Saya
                </h2>
                <p className="text-text-secondary text-sm mt-1">Kelola informasi profil dan keamanan akun Anda</p>
            </div>

            <div className="py-4">
                <div className="max-w-4xl space-y-6">
                    {/* Profile Photo Section */}
                    <div className="p-6 bg-surface shadow-sm rounded-lg border border-border-default">
                        <h3 className="text-lg font-medium text-text-primary mb-4">Foto Profil</h3>
                        
                        <div className="flex items-center gap-6">
                            {/* Photo Preview */}
                            <div className="relative">
                                <div className={`w-24 h-24 rounded-full overflow-hidden ${
                                    (previewUrl || user.foto_url) 
                                        ? 'ring-4 ring-primary ring-offset-2' 
                                        : 'bg-surface-hover border-2 border-dashed border-border-default'
                                }`}>
                                    {(previewUrl || user.foto_url) ? (
                                        <img 
                                            src={previewUrl || user.foto_url || ''} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-text-muted" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1">
                                <input
                                    id="foto"
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm text-text-secondary
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-lg file:border-0
                                        file:text-sm file:font-medium
                                        file:bg-primary-light file:text-primary
                                        hover:file:bg-primary hover:file:text-white
                                        file:transition-colors file:cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <p className="text-text-muted text-xs mt-2">Format: JPG, PNG. Maksimal 2MB.</p>
                                {errors.foto && <div className="text-danger text-sm mt-1">{errors.foto}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Profile Information Section */}
                    <div className="p-6 bg-surface shadow-sm rounded-lg border border-border-default">
                        <h3 className="text-lg font-medium text-text-primary mb-4">Informasi Profil</h3>
                        
                        <form onSubmit={submit} className="space-y-5" encType="multipart/form-data">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="name" className="block font-medium text-sm text-text-primary">Nama Lengkap</label>
                                    <input
                                        id="name"
                                        className={inputClasses}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                    />
                                    {errors.name && <div className="text-danger text-sm mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <label htmlFor="username" className="block font-medium text-sm text-text-primary">Username</label>
                                    <input
                                        id="username"
                                        className={inputClasses}
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        required
                                        autoComplete="username"
                                    />
                                    {errors.username && <div className="text-danger text-sm mt-1">{errors.username}</div>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block font-medium text-sm text-text-primary">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        className={inputClasses}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                    {errors.email && <div className="text-danger text-sm mt-1">{errors.email}</div>}
                                </div>

                                <div>
                                    <label htmlFor="nip" className="block font-medium text-sm text-text-primary">NIP</label>
                                    <input
                                        id="nip"
                                        className={inputClasses}
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                    />
                                    {errors.nip && <div className="text-danger text-sm mt-1">{errors.nip}</div>}
                                </div>

                                <div>
                                    <label htmlFor="jabatan" className="block font-medium text-sm text-text-primary">Jabatan</label>
                                    <input
                                        id="jabatan"
                                        className={inputClasses}
                                        value={data.jabatan}
                                        onChange={(e) => setData('jabatan', e.target.value)}
                                    />
                                    {errors.jabatan && <div className="text-danger text-sm mt-1">{errors.jabatan}</div>}
                                </div>

                                <div>
                                    <label htmlFor="jenis_kelamin" className="block font-medium text-sm text-text-primary">Jenis Kelamin</label>
                                    <select
                                        id="jenis_kelamin"
                                        className={inputClasses}
                                        value={data.jenis_kelamin}
                                        onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                    {errors.jenis_kelamin && <div className="text-danger text-sm mt-1">{errors.jenis_kelamin}</div>}
                                </div>
                            </div>

                            {/* Password Change Section */}
                            <div className="border-t border-border-default pt-5 mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lock className="w-5 h-5 text-text-secondary" />
                                    <h4 className="font-medium text-text-primary">Ubah Password</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="relative">
                                        <label htmlFor="current_password" className="block font-medium text-sm text-text-primary">Password Lama</label>
                                        <div className="relative">
                                            <input
                                                id="current_password"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                className={`${inputClasses} pr-10`}
                                                value={data.current_password}
                                                onChange={(e) => setData('current_password', e.target.value)}
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary mt-1"
                                                tabIndex={-1}
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.current_password && <div className="text-danger text-sm mt-1">{errors.current_password}</div>}
                                    </div>

                                    <div className="relative">
                                        <label htmlFor="new_password" className="block font-medium text-sm text-text-primary">Password Baru</label>
                                        <div className="relative">
                                            <input
                                                id="new_password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                className={`${inputClasses} pr-10`}
                                                value={data.new_password}
                                                onChange={(e) => setData('new_password', e.target.value)}
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary mt-1"
                                                tabIndex={-1}
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.new_password && <div className="text-danger text-sm mt-1">{errors.new_password}</div>}
                                    </div>

                                    <div className="relative">
                                        <label htmlFor="new_password_confirmation" className="block font-medium text-sm text-text-primary">Konfirmasi Password</label>
                                        <div className="relative">
                                            <input
                                                id="new_password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className={`${inputClasses} pr-10`}
                                                value={data.new_password_confirmation}
                                                onChange={(e) => setData('new_password_confirmation', e.target.value)}
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary mt-1"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-text-muted text-xs mt-3">
                                    * Kosongkan jika tidak ingin mengubah password. Password minimal 8 karakter.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-5 py-2.5 bg-primary border border-transparent rounded-lg font-medium text-sm text-white hover:bg-primary-hover focus:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-secondary">Tersimpan.</p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

Edit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Edit;
