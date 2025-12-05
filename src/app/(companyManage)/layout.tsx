'use client';
import React, { ReactNode } from 'react';
import { LayoutProvider } from '@/context/LayoutContext';
import { Header } from '@/components/layout/Header';
import { ChatInitializer } from '@/features/chat/components';

const CompanyManageLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <ChatInitializer />
            <Header />

            <div className="flex-1">
                <LayoutProvider>{children}</LayoutProvider>
            </div>
        </div>
    );
};

export default CompanyManageLayout;

