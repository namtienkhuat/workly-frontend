import type { Metadata } from 'next';
import '@/styles/global.css';
import { ReactNode } from 'react';
import MainProviders from '@/providers/MainProviders';

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
        <html lang="en">
            <body>
                <MainProviders>
                    <main className="min-h-screen">{children}</main>
                </MainProviders>
            </body>
        </html>
    );
}
