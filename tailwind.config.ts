import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            keyframes: {
                "fade-in": {
                    "0%": { opacity: '0', transform: "scale(0.95)" },
                    "100%": { opacity: '1', transform: "scale(1)" },
                },
                "slide-in": {
                    "0%": { transform: "translateX(-100%)", opacity: '0' },
                    "100%": { transform: "translateX(0)", opacity: '1' },
                },
                "zoom-in": {
                    "0%": { transform: "scale(0.5)", opacity: '0' },
                    "100%": { transform: "scale(1)", opacity: '1' },
                },
            },
            animation: {
                "fade-in": "fade-in 0.2s ease-out",
                "slide-in": "slide-in 0.3s ease-out",
                "zoom-in": "zoom-in 0.2s ease-out",
                "in": "fade-in 0.5s ease-out",
            },
            colors: {
                dark: '#313638',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            transitionDelay: {
                '100': '100ms',
                '200': '200ms',
                '1000': '1000ms',
            },
        },
    },
    plugins: [
        // Custom scrollbar plugin
        function({ addUtilities }: any) {
            const newUtilities = {
                '.scrollbar-thin': {
                    'scrollbar-width': 'thin',
                },
                '.scrollbar-thumb-primary\\/20': {
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'hsl(var(--primary) / 0.2)',
                        'border-radius': '999px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: 'hsl(var(--primary) / 0.3)',
                    },
                },
                '.scrollbar-thumb-primary\\/30': {
                    '&::-webkit-scrollbar-thumb': {
                        background: 'hsl(var(--primary) / 0.3)',
                    },
                },
                '.scrollbar-track-transparent': {
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                },
            };
            addUtilities(newUtilities, ['responsive', 'hover']);
        },
    ],
};
export default config;
