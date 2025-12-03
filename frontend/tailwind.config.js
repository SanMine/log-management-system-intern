/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium "Slate & Royal" Palette
                brand: {
                    50: '#eff6ff', // Very light blue for subtle backgrounds
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6', // Standard Blue
                    600: '#2563eb', // Royal Blue (Primary Action)
                    700: '#1d4ed8',
                    800: '#1e40af', // Deep Blue
                    900: '#1e3a8a', // Navy
                },
                slate: {
                    50: '#f8fafc', // Main App Background
                    100: '#f1f5f9', // Secondary Background
                    200: '#e2e8f0', // Borders
                    300: '#cbd5e1',
                    400: '#94a3b8', // Muted Text
                    500: '#64748b', // Secondary Text
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b', // Primary Text
                    900: '#0f172a', // Headings
                },
                // Semantic Colors
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },

                success: {
                    light: '#dcfce7',
                    DEFAULT: '#10b981',
                    dark: '#059669',
                },
                warning: {
                    light: '#fef3c7',
                    DEFAULT: '#f59e0b',
                    dark: '#d97706',
                },
                danger: {
                    light: '#fee2e2',
                    DEFAULT: '#ef4444',
                    dark: '#b91c1c',
                },
                // Keep for backwards compatibility
                mono: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'shimmer': 'shimmer 2s infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                slideDown: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(-10px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                scaleIn: {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.95)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)',
                    },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                glow: {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(171, 196, 255, 0.4)',
                    },
                    '50%': {
                        boxShadow: '0 0 30px rgba(171, 196, 255, 0.8)',
                    },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}

