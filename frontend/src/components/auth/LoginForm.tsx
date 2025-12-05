import React from 'react';
import { Mail, Lock } from 'lucide-react';
import logo from '@/images/logo.png';

interface LoginFormProps {
    email: string;
    password: string;
    error: string;
    isLoading: boolean;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onToggleForm: () => void;
    onFillDemo: () => void;
}

export function LoginForm({
    email,
    password,
    error,
    isLoading,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    onToggleForm,
    onFillDemo
}: LoginFormProps) {
    return (
        <div
            className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100"
            style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
            }}
        >
            <div className="px-8 pt-8 pb-6 text-center">
                <div className="mx-auto h-20 w-auto flex items-center justify-center mb-4">
                    <img src={logo} alt="Nexlog Logo" className="h-full object-contain" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                <p className="text-slate-500 mt-2 text-sm">Enter your credentials to access your dashboard</p>
            </div>

            <div className="px-8 pb-8">
                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => onEmailChange(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => onPasswordChange(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                    <span className="text-slate-400">|</span>
                    <button onClick={onToggleForm} className="font-medium text-slate-600 hover:text-slate-800">Create an account</button>
                </div>
            </div>

            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                    <span className="block font-semibold text-slate-700">Demo Credentials:</span>
                    superadmin@gmail.com
                </div>
                <button
                    onClick={onFillDemo}
                    className="text-xs bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-md transition-colors font-medium shadow-sm"
                >
                    Auto-fill
                </button>
            </div>
        </div>
    );
}
