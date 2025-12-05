import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, Building } from 'lucide-react';

export function SignupPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantName, setTenantName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Call signup API
            const response = await fetch('http://localhost:5004/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, tenantName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Store token and user
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Navigate to dashboard
            navigate('/dashboard');
            window.location.reload(); // Reload to update auth context
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Card className="glass-strong shadow-2xl shadow-mono-500/20 border-mono-200 overflow-hidden">
                {/* Gradient header */}
                <div className="h-2 bg-gradient-to-r from-mono-500 to-mono-600" />

                <CardHeader className="space-y-4 text-center pb-6 pt-8">
                    <div className="mx-auto h-16 w-16 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-mono-400/50 animate-scale-in">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-mono-600 to-mono-500 bg-clip-text text-transparent">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Sign up to access your organization's log management
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8 pt-0">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Organization / Tenant Name
                            </label>
                            <div className="relative group">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-mono-600 transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="acme.com"
                                    value={tenantName}
                                    onChange={(e) => setTenantName(e.target.value)}
                                    className="pl-10 border-mono-300 focus:border-mono-500 focus:ring-mono-500 focus:ring-2 transition-all bg-white/80 hover:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-mono-600 transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="you@acme.com"
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
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 border-mono-300 focus:border-mono-500 focus:ring-mono-500 focus:ring-2 transition-all bg-white/80 hover:bg-white"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <p className="text-xs text-gray-500">At least 6 characters</p>
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
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>

                        <p className="text-sm text-center text-slate-600 mt-4">
                            Already have an account?{' '}
                            <Link to="/login" className="text-mono-600 hover:text-mono-700 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
