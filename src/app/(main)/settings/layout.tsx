'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SettingsSidebar } from './_components/SettingsSidebar';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    
    // Hide sidebar for change-password page
    const hideSidebar = pathname?.includes('/change-password');

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {!hideSidebar && <SettingsSidebar />}
                    <main className={hideSidebar ? 'w-full' : 'flex-1 min-w-0'}>{children}</main>
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;

