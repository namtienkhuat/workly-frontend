import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
    EMPTY_ROUTES,
    TWO_COLUMN_ROUTES,
    THREE_COLUMN_ROUTES,
    type RouteLayoutType,
} from '@/constants';
import { useLayout } from '@/context/LayoutContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function matchesAnyPrefix(pathname: string, patterns: string[]): boolean {
    if (!pathname) return false;

    return patterns.some((p) => {
        if (!p) return false;
        if (p === '/') return pathname === '/';
        return pathname.startsWith(p);
    });
}

function getLayoutType(pathname: string): RouteLayoutType {
    if (matchesAnyPrefix(pathname, EMPTY_ROUTES)) {
        return 'empty';
    }
    if (matchesAnyPrefix(pathname, TWO_COLUMN_ROUTES)) {
        return '2-column';
    }
    if (matchesAnyPrefix(pathname, THREE_COLUMN_ROUTES)) {
        return '3-column';
    }

    return 'empty';
}

const SidebarSkeleton = () => {
    return (
        <Card className="pb-2">
            <CardHeader className="py-2 pt-4">
                <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="px-0 pb-2">
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-20 flex-shrink-0" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export const RouteAwareColumns = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname() ?? '';
    const layoutType = getLayoutType(pathname);
    const { leftSidebar, rightSidebar, leftSidebarInitialized, rightSidebarInitialized } =
        useLayout();

    if (layoutType === 'empty') {
        return <div className="w-full">{children}</div>;
    }

    if (layoutType === '2-column') {
        return (
            <div className="grid grid-cols-12 gap-6">
                <main className="col-span-12 lg:col-span-9">{children}</main>
                <aside className="hidden lg:block col-span-3">
                    {rightSidebarInitialized ? rightSidebar : <SidebarSkeleton />}
                </aside>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-6">
            <aside className="hidden lg:block col-span-3">
                {leftSidebarInitialized ? leftSidebar : <SidebarSkeleton />}
            </aside>
            <main className="col-span-12 lg:col-span-6">{children}</main>
            <aside className="hidden lg:block col-span-3">
                {rightSidebarInitialized ? rightSidebar : <SidebarSkeleton />}
            </aside>
        </div>
    );
};

export default RouteAwareColumns;
