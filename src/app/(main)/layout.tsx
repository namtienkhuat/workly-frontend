'use client';
import React, { ReactNode } from 'react';
import { RouteAwareColumns } from '@/components/layout/RouteAwareColumns';

const MainLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 py-3">
                    <div className="text-sm font-medium">Header</div>
                </div>
            </header>

            <div className="flex-1">
                {/* <div className="mx-auto max-w-7xl px-4 py-6"> */}
                <div className="px-4 py-6">
                    <RouteAwareColumns>{children}</RouteAwareColumns>
                    {/* {children} */}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
