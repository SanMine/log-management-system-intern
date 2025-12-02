import type { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary-blue to-gray-900">
            <div className="w-full max-w-md px-4">
                {children}
            </div>
        </div>
    );
}
