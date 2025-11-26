import type { Metadata } from 'next';
import '@/styles/global.css';
import { ReactNode } from 'react';
import MainProviders from '@/providers/MainProviders';
import { AppearanceScript } from '@/components/appearance-script';

export const metadata: Metadata = {
    title: 'Workly',
    description: '',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" className="mdl-js" suppressHydrationWarning>
            <head>
                <AppearanceScript />
            </head>
            <body cz-shortcut-listen="true">
                <MainProviders>
                    <main className="min-h-screen">{children}</main>
                </MainProviders>
            </body>
        </html>
    );
}
