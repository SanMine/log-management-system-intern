import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    ShieldCheck,
    TrendingUp,
    Users
} from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

export function LandingPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantName, setTenantName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const fillDemoCredentials = () => {
        setEmail('superadmin@gmail.com');
        setPassword('super12345');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, tenantName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/dashboard');
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleForm = () => {
        setIsSignup(!isSignup);
        setError('');
        setEmail('');
        setPassword('');
        setTenantName('');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            <div className="min-h-screen flex flex-col lg:flex-row relative">

                {/* Background Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[100px]" />
                    <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-slate-300/20 rounded-full blur-[80px]" />
                </div>

                {/* LEFT COLUMN: The Pitch */}
                <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 lg:py-0">
                    <div className="max-w-xl mx-auto lg:mx-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            v2.0 is live
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] mb-6">
                            Security log management <br />
                            <span className="text-blue-600">simplified.</span>
                        </h1>

                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Centralize security logs from multiple sources, detect threats in real-time, and automate compliance reporting with the most intuitive SIEM platform.
                        </p>

                        {/* Simple CTA */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mb-12">
                            <p className="text-sm font-semibold text-blue-600 mb-2">Getting Started</p>
                            <p className="text-slate-700 mb-4">
                                Login with your credentials to access the dashboard, view logs, and monitor security events.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span>Secure authentication • Role-based access • Multi-tenant support</span>
                            </div>
                        </div>

                        {/* Native Integrations */}
                        <div className="border-t border-slate-200 pt-8">
                            <p className="text-sm font-medium text-slate-400 mb-4">NATIVE INTEGRATIONS</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-xs font-semibold">AWS CloudTrail</span>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-semibold">Microsoft 365</span>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-semibold">Active Directory</span>
                                <span className="px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold">Syslog</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: The Form Card with Flip Animation */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:bg-slate-50/50">
                    <div className="w-full max-w-md">

                        {/* Flip Container */}
                        <div className="relative" style={{ perspective: '1000px' }}>
                            <div
                                className="relative transition-all duration-700"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: isSignup ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                {/* Login Form (Front) */}
                                <LoginForm
                                    email={email}
                                    password={password}
                                    error={error}
                                    isLoading={isLoading}
                                    onEmailChange={setEmail}
                                    onPasswordChange={setPassword}
                                    onSubmit={handleLogin}
                                    onToggleForm={toggleForm}
                                    onFillDemo={fillDemoCredentials}
                                />

                                {/* Signup Form (Back) */}
                                <SignupForm
                                    email={email}
                                    password={password}
                                    tenantName={tenantName}
                                    error={error}
                                    isLoading={isLoading}
                                    onEmailChange={setEmail}
                                    onPasswordChange={setPassword}
                                    onTenantNameChange={setTenantName}
                                    onSubmit={handleSignup}
                                    onToggleForm={toggleForm}
                                />
                            </div>
                        </div>

                        {/* Footer below card */}
                        <div className="text-center mt-8">
                            <p className="text-xs text-slate-400 mb-4">
                                &copy; 2024 Nexlog Inc. <a href="#" className="underline hover:text-slate-500">Privacy</a> &bull; <a href="#" className="underline hover:text-slate-500">Terms</a>
                            </p>
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">DEVELOPED BY</p>
                                <p className="text-sm font-bold text-slate-700">SAI SAN MINE</p>
                                <a href="mailto:saisanmine.nov@gmail.com" className="text-xs text-blue-500 hover:text-blue-600 font-medium">saisanmine.nov@gmail.com</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Section (Below the fold) */}
            <div id="features" className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Security Teams Choose Nexlog</h2>
                        <p className="text-lg text-slate-600">We've built the most comprehensive toolset for modern security operations and compliance.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
                            title="Real-time Threat Detection"
                            desc="Monitor security events and detect anomalies with live dashboards and intelligent alerts that notify you instantly."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
                            title="Multi-Source Ingestion"
                            desc="Collect logs from firewalls, cloud platforms, endpoints, and applications in one centralized platform."
                        />
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-blue-600" />}
                            title="Multi-Tenant RBAC"
                            desc="Assign roles, manage permissions, and ensure data isolation across multiple tenants and teams."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Component for Features
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
        </div>
    );
}
