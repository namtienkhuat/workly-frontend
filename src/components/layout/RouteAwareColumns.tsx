import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
    EMPTY_ROUTES,
    TWO_COLUMN_ROUTES,
    THREE_COLUMN_ROUTES,
    type RouteLayoutType,
} from '@/constants';

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

export const RouteAwareColumns = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname() ?? '';
    const layoutType = getLayoutType(pathname);

    if (layoutType === 'empty') {
        return <div className="w-full">{children}</div>;
    }

    if (layoutType === '2-column') {
        return (
            <div className="grid grid-cols-12 gap-4">
                <main className="col-span-12 lg:col-span-9">{children}</main>
                <aside className="hidden lg:block col-span-3">
                    <div className="rounded-lg border p-4">Right Sidebar</div>
                </aside>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-4">
            <aside className="hidden lg:block col-span-3">
                <div className="rounded-lg border p-4">Left Sidebar</div>
            </aside>
            <main className="col-span-12 lg:col-span-6">{children}</main>
            <aside className="hidden lg:block col-span-3">
                <div className="rounded-lg border p-4">Right Sidebar</div>
            </aside>
        </div>
    );
};

export default RouteAwareColumns;
