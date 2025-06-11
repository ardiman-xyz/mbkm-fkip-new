import { Head, useForm } from '@inertiajs/react';
import { BookOpen, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 opacity-10">
                        <BookOpen className="h-16 w-16 animate-pulse text-green-500" />
                    </div>
                    <div className="absolute top-32 right-20 opacity-10">
                        <BookOpen className="h-12 w-12 animate-pulse text-blue-500" style={{ animationDelay: '1s' }} />
                    </div>
                    <div className="absolute bottom-20 left-32 opacity-10">
                        <BookOpen className="h-20 w-20 animate-pulse text-purple-500" style={{ animationDelay: '2s' }} />
                    </div>
                    <div className="absolute right-16 bottom-32 opacity-10">
                        <BookOpen className="h-14 w-14 animate-pulse text-green-500" style={{ animationDelay: '0.5s' }} />
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="overflow-hidden rounded-md border-0 bg-white/80 shadow-2xl backdrop-blur-sm">
                        <div className="space-y-4 p-8 pb-6 text-center">
                            {/* Logo */}
                            <div className="flex justify-center">
                                <img src="/images/logo.png" className="w-[100px] text-white" />
                            </div>

                            <div className="space-y-2">
                                <p className="text-gray-600">Masukkan akun anda</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6 px-8 pb-8">
                            {/* Status Message */}
                            {status && (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <p className="text-sm font-medium text-green-600">{status}</p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="focus:ring-opacity-20 w-full rounded-lg border border-gray-200 py-3 pr-4 pl-10 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            placeholder="Masukkan email Anda"
                                            autoComplete="username"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="focus:ring-opacity-20 w-full rounded-lg border border-gray-200 py-3 pr-12 pl-10 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            placeholder="Masukkan password Anda"
                                            autoComplete="current-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-base font-medium text-white transition-all duration-300 hover:from-green-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
                                >
                                    {processing ? (
                                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <Shield className="mr-2 h-5 w-5" />
                                    )}
                                    {processing ? 'Memproses...' : 'Masuk'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
