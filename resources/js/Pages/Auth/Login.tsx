import { InputError, InputLabel, TextInput, Checkbox } from '@/Components/form';
import { Button, Modal } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
    const [showPassword, setShowPassword] = useState(false);

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

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-primary">
                    Selamat Datang
                </h2>
                <p className="text-text-secondary text-sm mt-2">
                    Silahkan masuk ke akun Anda
                </p>
            </div>

            {status && (
                <div className="mb-4 p-3 bg-success-light border border-success/20 rounded-lg text-sm text-success">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Username Field */}
                <div>
                    <InputLabel htmlFor="username" value="Username" className="text-text-primary font-medium" />
                    <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-text-muted" />
                        </div>
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="block w-full pl-10 pr-4 py-2.5 border border-border-default rounded-xl focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                            placeholder="Masukkan username"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('username', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.username} className="mt-2" />
                </div>

                {/* Password Field */}
                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-text-primary font-medium" />
                    <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-text-muted" />
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pl-10 pr-12 py-2.5 border border-border-default rounded-xl focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                            placeholder="Masukkan password"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                            className="rounded border-border-dark text-primary focus:ring-primary"
                        />
                        <span className="ms-2 text-sm text-text-secondary">
                            Ingat saya
                        </span>
                    </label>
                </div>

                {/* Submit Button */}
                <Button
                    variant="primary"
                    type="submit"
                    disabled={processing}
                    className="w-full justify-center py-3 bg-primary hover:bg-primary-hover text-text-inverse font-semibold rounded-xl transition-colors"
                >
                    {processing ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Memproses...
                        </span>
                    ) : 'Masuk'}
                </Button>
            </form>

            {/* Error Modal */}
            <Modal
                isOpen={showErrorModal}
                title="Login Gagal"
                onClose={() => setShowErrorModal(false)}
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="mx-auto flex items-center justify-center w-16 h-16 bg-danger-light rounded-full mb-4">
                        <AlertCircle className="w-8 h-8 text-danger" />
                    </div>
                    <p className="text-text-primary mb-6">
                        {errorMessage || 'Username atau password salah'}
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => setShowErrorModal(false)}
                        className="w-full justify-center py-2.5 bg-primary hover:bg-primary-hover rounded-xl"
                    >
                        Tutup
                    </Button>
                </div>
            </Modal>
        </GuestLayout>
    );
}

