import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, User, Loader2, UserPlus } from 'lucide-react';
import clsx from 'clsx';

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'register' && password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        if (password.length < 4) {
            setError('Şifre en az 4 karakter olmalıdır.');
            return;
        }

        setLoading(true);

        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            const response = await api.post(endpoint, {
                username,
                password,
            });
            login(response.data.access_token);
            navigate('/');
        } catch (err: any) {
            if (mode === 'register') {
                setError(err.response?.data?.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
            } else {
                setError(err.response?.data?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
            }
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: 'login' | 'register') => {
        setMode(newMode);
        setError('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div>
                    <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {mode === 'login' ? (
                            <Lock className="h-6 w-6 text-blue-600" />
                        ) : (
                            <UserPlus className="h-6 w-6 text-blue-600" />
                        )}
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        AsTakip Yönetim Paneli
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {mode === 'login'
                            ? 'Hesabınızla giriş yapın'
                            : 'Yeni bir hesap oluşturun'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className={clsx(
                            "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                            mode === 'login'
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Giriş Yap
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className={clsx(
                            "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                            mode === 'register'
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Kayıt Ol
                    </button>
                </div>

                <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className={clsx(
                                    "appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm",
                                    mode === 'login' && !confirmPassword && ""
                                )}
                                placeholder="Kullanıcı Adı"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={clsx(
                                    "appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm",
                                    mode === 'login' ? "rounded-b-md" : ""
                                )}
                                placeholder="Şifre"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {mode === 'register' && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Şifre Tekrar"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={clsx(
                                "group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50",
                                mode === 'login'
                                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : mode === 'login' ? (
                                'Giriş Yap'
                            ) : (
                                'Kayıt Ol'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
