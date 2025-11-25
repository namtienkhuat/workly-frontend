'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';
import { useChatStore } from '@/features/chat/store';

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
    { id: 'messages', label: 'Messages' },
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
    const conversationsMap = useChatStore((state) => state.conversations);

    // Calculate total unread messages for this company
    const unreadMessagesCount = useMemo(() => {
        if (!isAdmin) return 0;

        const conversations = Object.values(conversationsMap);
        return conversations.reduce((total, conversation) => {
            // Check if this company is a participant in the conversation
            const companyUnread = conversation.unreadCount[companyId] || 0;
            return total + companyUnread;
        }, 0);
    }, [conversationsMap, companyId, isAdmin]);

    return (
        <div className="w-full border-t">
            <nav className="flex gap-4 font-bold text-base">
                <ul className="flex items-center p-2 gap-4">
                    {tabs.map((tab) => {
                        const baseRoute = isAdmin ? 'manage-company' : 'company';
                        const tabPath = tab.id ? `/${tab.id}` : '';
                        const href = `/${baseRoute}/${companyId}${tabPath}`;
                        const isActive = pathname === href;
                        const showBadge = tab.id === 'messages' && unreadMessagesCount > 0;

                        return (
                            <li key={tab.id}>
                                <Link
                                    href={href}
                                    className={clsx(
                                        'relative block px-2 py-1 font-semibold border-b-2 transition',
                                        isActive
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary'
                                    )}
                                >
                                    {tab.label}
                                    {showBadge && (
                                        <span className="absolute -top-1 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                                            {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                                        </span>
                                    )}
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
