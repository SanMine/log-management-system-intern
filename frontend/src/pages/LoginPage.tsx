import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail } from 'lucide-react';

import logo from '@/images/logo.png';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Card className="glass-strong shadow-2xl shadow-mono-500/20 border-mono-200 overflow-hidden">
                { }
                <div className="h-2 bg-gradient-to-r from-mono-500 to-mono-600" />

                <CardHeader className="space-y-4 text-center pb-6 pt-8">
                    <div className="mx-auto h-20 w-auto flex items-center justify-center animate-scale-in">
                        <img src={logo} alt="Nexlog Logo" className="h-full object-contain" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-mono-600 to-mono-500 bg-clip-text text-transparent">
                        Admin Login
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Enter your credentials to access Nexlog
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8 pt-0">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-mono-600 transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 border-mono-300 focus:border-mono-500 focus:ring-mono-500 focus:ring-2 transition-all bg-white/80 hover:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-mono-600 transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 border-mono-300 focus:border-mono-500 focus:ring-mono-500 focus:ring-2 transition-all bg-white/80 hover:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full gradient-primary text-white shadow-lg shadow-mono-400/50 hover:shadow-xl hover:shadow-mono-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <p className="text-sm text-center text-slate-600 mt-4">
                            Don't have an account?{' '}
                            <a href="/signup" className="text-mono-600 hover:text-mono-700 font-semibold hover:underline">
                                Sign up
                            </a>
                        </p>

                        <p className="text-sm text-center text-slate-600 mt-2">
                            <strong>Super Admin:</strong> superadmin@gmail.com / super12345
                        </p>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
