import { InputError, InputLabel, TextInput } from '@/Components/form';
import { Button } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForcePasswordChange() {
    const { data, setData, put, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.force_update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Ubah Password" />

            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                    Ubah Password
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                    Demi keamanan, Anda harus mengubah password sebelum melanjutkan.
                </p>
            </div>

            <div className="mb-4 p-3 bg-warning/10 border border-warning rounded-md">
                <p className="text-sm text-warning">
                    Ini adalah login pertama Anda. Silakan buat password baru untuk melanjutkan.
                </p>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="password" value="Password Baru" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-6">
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={processing}
                        className="w-full justify-center"
                    >
                        {processing ? 'Memproses...' : 'Simpan Password Baru'}
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
