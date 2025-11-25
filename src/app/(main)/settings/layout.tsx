'use client';

import React from 'react';
import { SettingsSidebar } from './_components/SettingsSidebar';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <SettingsSidebar />
                    <main className="flex-1 min-w-0">{children}</main>
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;

