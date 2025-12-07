import { SetSidebar } from '@/components/layout/SetSideBar';
import type { Metadata } from 'next';
import React from 'react';
import RightSidebarHome from './_components/RightSideBarHome';
import LeftSideBarHome from './_components/LeftSideBarHome';

export const metadata: Metadata = {
    title: 'Home | Workly',
    description: 'Stay up to date with the latest updates across your Workly network.',
};

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <SetSidebar position="right">
                <RightSidebarHome />
            </SetSidebar>

            <SetSidebar position="left">
                <LeftSideBarHome />
            </SetSidebar>
            <div className="mx-auto max-w-5xl">{children}</div>
        </>
    );
};

export default HomeLayout;
