import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TabConfig {
    label: string;
    path: string;
    exact?: boolean;
}

const TabSwitch = () => {
    const pathname = usePathname();
    const { id } = useParams<{ id: string }>();
    const basePath = `/manage-company/${id}`;

    const tabs: TabConfig[] = useMemo(
        () => [
            { label: 'Overview', path: basePath, exact: true },
            { label: 'Edit Information', path: `${basePath}/edit` },
            { label: 'Admins', path: `${basePath}/admins` },
            { label: 'Posts', path: `${basePath}/posts` },
            { label: 'Hiring', path: `${basePath}/hiring` },
            { label: 'Candidates', path: `${basePath}/candidates` },
        ],
        [basePath]
    );

    const isTabActive = (tab: TabConfig): boolean => {
        if (!pathname) return false;
        if (tab.exact) return pathname === tab.path;
        return pathname === tab.path || pathname.startsWith(`${tab.path}/`);
    };

    return (
        <div className="w-full border-t">
            <nav className="flex gap-4 font-bold text-base py-2">
                {tabs.map((tab) => {
                    const isActive = isTabActive(tab);
                    return (
                        <Link
                            key={tab.path}
                            href={tab.path}
                            className={cn(
                                'px-2 py-1 border-b-2 rounded-t-md transition-colors',
                                isActive
                                    ? 'border-primary text-primary hover:bg-primary/10'
                                    : 'border-transparent text-muted-foreground hover:bg-primary/10'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default TabSwitch;
