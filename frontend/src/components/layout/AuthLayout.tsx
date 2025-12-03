import type { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mono-100 via-mono-200 to-mono-300 relative overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mono-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mono-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1s' }} />
            </div>

            <div className="w-full max-w-md px-4 relative z-10 animate-scale-in">
                {children}
            </div>
        </div>
    );
}
