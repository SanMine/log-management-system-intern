import React from 'react';
import { Mail, Lock, Building } from 'lucide-react';
import logo from '@/images/logo.png';

interface SignupFormProps {
    email: string;
    password: string;
    tenantName: string;
    error: string;
    isLoading: boolean;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onTenantNameChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onToggleForm: () => void;
}

export function SignupForm({
    email,
    password,
    tenantName,
    error,
    isLoading,
    onEmailChange,
    onPasswordChange,
    onTenantNameChange,
    onSubmit,
    onToggleForm
}: SignupFormProps) {
    return (
        <div
            className="absolute top-0 left-0 w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100"
            style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
            }}
        >
            <div className="px-8 pt-8 pb-6 text-center">
                <div className="mx-auto h-20 w-auto flex items-center justify-center mb-4">
                    <img src={logo} alt="Nexlog Logo" className="h-full object-contain" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                <p className="text-slate-500 mt-2 text-sm">Sign up to access your organization's log management</p>
            </div>

            <div className="px-8 pb-8">
                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Organization Name</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={tenantName}
                                onChange={(e) => onTenantNameChange(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                                placeholder="acme.com"
                                required
                            />
                        </div>
                    </div>

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
                                placeholder="you@acme.com"
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
                                placeholder="Create a strong password"
                                required
                                minLength={6}
                            />
                        </div>
                        <p className="text-xs text-slate-500 ml-1">At least 6 characters</p>
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
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-center text-sm">
                    <span className="text-slate-600">Already have an account?</span>
                    <button onClick={onToggleForm} className="ml-2 font-medium text-blue-600 hover:text-blue-500">Sign in</button>
                </div>
            </div>
        </div>
    );
}
