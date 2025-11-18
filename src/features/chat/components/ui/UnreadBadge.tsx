'use client';

import { useUnreadCount } from '../../hooks';
import { formatUnreadCount } from '../../utils';

interface UnreadBadgeProps {
    className?: string;
}

/**
 * Badge component to show total unread message count
 * Use this in Navbar or anywhere to show notification
 */
export function UnreadBadge({ className = '' }: UnreadBadgeProps) {
    const { totalUnreadCount, hasUnread } = useUnreadCount();

    if (!hasUnread) return null;

    return (
        <span
            className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${className}`}
            style={{ zIndex: 50 }}
        >
            {formatUnreadCount(totalUnreadCount)}
        </span>
    );
}
