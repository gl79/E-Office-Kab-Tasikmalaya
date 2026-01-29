import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Edit({ mustVerifyEmail, status }: Props) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        username: user.username,
        email: user.email || '',
        nip: user.nip || '',
        jenis_kelamin: user.jenis_kelamin || '',
        jabatan: user.jabatan || '',
        foto: null as File | null,
        _method: 'PATCH',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update'));
    };

    return (
        <AppLayout>
            <Head title="Profile" />
            
            <div className="mb-6">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Profile
                </h2>
            </div>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section className="max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Update your account's profile information and email address.
                                </p>
                            </header>

                            <form onSubmit={submit} className="mt-6 space-y-6" encType="multipart/form-data">
                                <div>
                                    <label htmlFor="name" className="block font-medium text-sm text-gray-700">Name</label>
                                    <input
                                        id="name"
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                    />
                                    {errors.name && <div className="text-red-600 mt-2">{errors.name}</div>}
                                </div>

                                <div>
                                    <label htmlFor="username" className="block font-medium text-sm text-gray-700">Username</label>
                                    <input
                                        id="username"
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        required
                                        autoComplete="username"
                                    />
                                    {errors.username && <div className="text-red-600 mt-2">{errors.username}</div>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block font-medium text-sm text-gray-700">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                    {errors.email && <div className="text-red-600 mt-2">{errors.email}</div>}
                                </div>

                                <div>
                                    <label htmlFor="nip" className="block font-medium text-sm text-gray-700">NIP</label>
                                    <input
                                        id="nip"
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                    />
                                    {errors.nip && <div className="text-red-600 mt-2">{errors.nip}</div>}
                                </div>

                                <div>
                                    <label htmlFor="jabatan" className="block font-medium text-sm text-gray-700">Jabatan</label>
                                    <input
                                        id="jabatan"
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                        value={data.jabatan}
                                        onChange={(e) => setData('jabatan', e.target.value)}
                                    />
                                    {errors.jabatan && <div className="text-red-600 mt-2">{errors.jabatan}</div>}
                                </div>

                                <div>
                                    <label htmlFor="jenis_kelamin" className="block font-medium text-sm text-gray-700">Jenis Kelamin</label>
                                    <select
                                        id="jenis_kelamin"
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                        value={data.jenis_kelamin}
                                        onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                    {errors.jenis_kelamin && <div className="text-red-600 mt-2">{errors.jenis_kelamin}</div>}
                                </div>

                                <div>
                                    <label htmlFor="foto" className="block font-medium text-sm text-gray-700">Foto Profil</label>
                                    <input
                                        id="foto"
                                        type="file"
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100"
                                        onChange={(e) => setData('foto', e.target.files ? e.target.files[0] : null)}
                                    />
                                    {errors.foto && <div className="text-red-600 mt-2">{errors.foto}</div>}
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Save
                                    </button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-gray-600">Saved.</p>
                                    </Transition>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
