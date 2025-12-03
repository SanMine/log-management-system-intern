import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, LogOut, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header - Clean White with Border */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-brand-600 p-1.5 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                Log<span className="text-brand-600">Sentinel</span>
                            </h1>
                        </div>

                        <nav className="flex items-center space-x-1">
                            <Link to="/dashboard">
                                <Button
                                    variant="ghost"
                                    className={
                                        isActive('/dashboard')
                                            ? 'bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100 hover:text-brand-800'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/alerts">
                                <Button
                                    variant="ghost"
                                    className={
                                        isActive('/alerts')
                                            ? 'bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100 hover:text-brand-800'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                >
                                    <Bell className="w-4 h-4 mr-2" />
                                    Alerts
                                </Button>
                            </Link>
                            <Link to="/users-activity">
                                <Button
                                    variant="ghost"
                                    className={
                                        isActive('/users-activity')
                                            ? 'bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100 hover:text-brand-800'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Users Activity
                                </Button>
                            </Link>
                            <div className="h-6 w-px bg-slate-200 mx-2" />
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
