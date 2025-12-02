import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail } from 'lucide-react';

export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple navigation without actual authentication
        navigate('/dashboard');
    };

    return (
        <AuthLayout>
            <Card className="shadow-xl">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-bold text-primary-dark">
                        Admin Login
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access the log management system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary-dark hover:bg-primary-blue"
                        >
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
