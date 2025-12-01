import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface TabConfig {
    id: string;
    label: string;
}

const ownerTabs: TabConfig[] = [
    { id: '', label: 'Edit Profile' },
    { id: 'skills', label: 'Skills' },
    { id: 'industries', label: 'Industries' },
    { id: 'education', label: 'Education' },
    { id: 'work-experiences', label: 'Work Experiences' },
];

const viewTabs: TabConfig[] = [
    { id: '', label: 'About' },
    { id: 'post', label: 'Post' },
];

const ProfileTabNav = ({ isOwner = false, userId }: { isOwner?: boolean; userId: string }) => {
    const tabs = isOwner ? ownerTabs : viewTabs;
    const pathname = usePathname();

    return (
        <div className="w-full border-t">
            <nav className="flex gap-4 font-bold text-base">
                <ul className="flex items-center p-2 gap-4">
                    {tabs.map((tab) => {
                        const tabPath = tab.id ? `/${tab.id}` : '';
                        const basePath = isOwner ? '/profile/edit' : `/profile/${userId}`;
                        const href = `${basePath}${tabPath}`;
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

export default ProfileTabNav;
