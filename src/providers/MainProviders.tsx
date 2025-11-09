'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SessionProvider } from 'next-auth/react';

const MainProviders = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster
                    position="top-right"
                    expand={false}
                    richColors
                    closeButton
                    duration={3000}
                />
            </QueryClientProvider>
        </SessionProvider>
    );
};

export default MainProviders;
