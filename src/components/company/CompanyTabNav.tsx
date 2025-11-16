import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface TabConfig {
    id: string;
    label: string;
}

const adminTabs: TabConfig[] = [
    { id: '', label: 'Overview' },
    { id: 'edit', label: 'Edit Information' },
    { id: 'admins', label: 'Admins' },
    { id: 'posts', label: 'Posts' },
    { id: 'hiring', label: 'Hiring' },
    { id: 'candidates', label: 'Candidates' },
];

const viewTabs: TabConfig[] = [
    { id: '', label: 'Overview' },
    { id: 'posts', label: 'Posts' },
    { id: 'jobs', label: 'Jobs' },
];

const CompanyTabNav = ({
    isAdmin = false,
    companyId,
}: {
    isAdmin?: boolean;
    companyId: string;
}) => {
    const tabs = isAdmin ? adminTabs : viewTabs;
    const pathname = usePathname();

    return (
        <div className="w-full border-t">
            <nav className="flex gap-4 font-bold text-base">
                <ul className="flex items-center p-2 gap-4">
                    {tabs.map((tab) => {
                        const baseRoute = isAdmin ? 'manage-company' : 'company';
                        const tabPath = tab.id ? `/${tab.id}` : '';
                        const href = `/${baseRoute}/${companyId}${tabPath}`;
                        const isActive = pathname === href;
                        return (
                            <li key={tab.id}>
                                <Link
                                    href={href}
                                    className={clsx(
                                        'block px-2 py-1 font-semibold border-b-2 transition',
                                        isActive
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary'
                                    )}
                                >
                                    {tab.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default CompanyTabNav;
