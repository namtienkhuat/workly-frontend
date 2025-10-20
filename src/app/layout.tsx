import type { Metadata } from 'next';
import '@/styles/global.css';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

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
                {children}
                <Toaster
                    position="top-right"
                    expand={false}
                    richColors
                    closeButton
                    duration={3000}
                />
            </body>
        </html>
    );
}
