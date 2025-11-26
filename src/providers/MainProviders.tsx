'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { AppearanceProvider } from '@/components/appearance-provider';

const MainProviders = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
            >
                <AppearanceProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        expand={false}
                        richColors
                        closeButton
                        duration={3000}
                    />
                </AppearanceProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default MainProviders;
