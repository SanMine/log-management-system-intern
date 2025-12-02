import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary-dark">
                                Log Management System
                            </h1>
                        </div>

                        <nav className="flex items-center space-x-4">
                            <Link to="/dashboard">
                                <Button
                                    variant={isActive('/dashboard') ? 'default' : 'ghost'}
                                    className={isActive('/dashboard') ? 'bg-primary-dark hover:bg-primary-blue' : ''}
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/alerts">
                                <Button
                                    variant={isActive('/alerts') ? 'default' : 'ghost'}
                                    className={isActive('/alerts') ? 'bg-primary-dark hover:bg-primary-blue' : ''}
                                >
                                    <Bell className="w-4 h-4 mr-2" />
                                    Alerts
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="ghost">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
