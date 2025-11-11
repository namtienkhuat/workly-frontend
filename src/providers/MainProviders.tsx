'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SessionProvider, useSession } from 'next-auth/react';
import { setAuthToken } from '@/utils/api';

const TokenSync = () => {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'authenticated') {
            setAuthToken(session?.apiToken || null);
        }
    }, [session?.apiToken]);

    return null;
};

const MainProviders = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <SessionProvider>
            <TokenSync />
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
