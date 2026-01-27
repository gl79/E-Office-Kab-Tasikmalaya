import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Button, Modal } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';

export default function Login({
    status,
}: {
    status?: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false as boolean,
    });

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Watch for errors and show modal
    useEffect(() => {
        if (errors.username) {
            setErrorMessage(errors.username);
            setShowErrorModal(true);
        }
    }, [errors.username]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                    E-Office
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                    Kabupaten Tasikmalaya
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-secondary">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="username" value="Username" />

                    <TextInput
                        id="username"
                        type="text"
                        name="username"
                        value={data.username}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('username', e.target.value)}
                    />

                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-text-secondary">
                            Ingat saya
                        </span>
                    </label>
                </div>

                <div className="mt-6">
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={processing}
                        className="w-full justify-center"
                    >
                        {processing ? 'Memproses...' : 'Masuk'}
                    </Button>
                </div>
            </form>

            {/* Error Modal */}
            <Modal
                isOpen={showErrorModal}
                title="Login Gagal"
                onClose={() => setShowErrorModal(false)}
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="text-danger mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-text-primary mb-4">
                        {errorMessage || 'Username atau password salah'}
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => setShowErrorModal(false)}
                    >
                        Tutup
                    </Button>
                </div>
            </Modal>
        </GuestLayout>
    );
}
