'use client';
import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { RouteAwareColumns } from '@/components/layout/RouteAwareColumns';
import { LayoutProvider } from '@/context/LayoutContext';
import { Header } from '@/components/layout/Header';
import { ChatInitializer } from '@/features/chat/components';

const MainLayout = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    const isChatPage = pathname?.startsWith('/chat');

    return (
        <div className={`flex flex-col bg-background ${isChatPage ? 'h-screen' : 'min-h-screen'}`}>
            <ChatInitializer />
            <Header />

            <div className={`flex-1 ${isChatPage ? 'overflow-hidden' : ''}`}>
                <LayoutProvider>
                    {isChatPage ? (
                        <div className="h-full mx-auto max-w-7xl p-6 flex flex-col">
                            <div className="flex-1 rounded-xl border border-border/50 bg-background shadow-xl overflow-hidden backdrop-blur-sm">
                                {children}
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-7xl px-4 py-6">
                            <RouteAwareColumns>{children}</RouteAwareColumns>
                        </div>
                    )}
                </LayoutProvider>
            </div>
        </div>
    );
};

export default MainLayout;
