import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DETAILS_ROUTES } from '@/constants';

function matchesAnyPrefix(pathname: string, patterns: string[]): boolean {
    if (!pathname) return false;
    return patterns.some((p) => {
        if (!p) return false;
        if (p === '/') return pathname === '/';
        return pathname.startsWith(p);
    });
}

export const RouteAwareColumns = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname() ?? '';
    const isDetails = matchesAnyPrefix(pathname, DETAILS_ROUTES);
    const mode = isDetails ? 'details' : 'feed';

    return (
        <div className="grid grid-cols-12 gap-4">
            {mode === 'feed' && (
                <aside className="hidden lg:block col-span-3">
                    <div className="rounded-lg border p-4">Left Sidebar</div>
                </aside>
            )}

            <main
                className={
                    mode === 'details' ? 'col-span-12 lg:col-span-9' : 'col-span-12 lg:col-span-6'
                }
            >
                {children}
            </main>

            <aside className="hidden lg:block col-span-3">
                <div className="rounded-lg border p-4">Right Sidebar</div>
            </aside>
        </div>
    );
};

export default RouteAwareColumns;
