'use client';

import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
    avatar?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    showOnlineIndicator?: boolean;
    isOnline?: boolean;
}

const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
};

const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
};

const indicatorSizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
};

export function UserAvatar({
    avatar,
    name,
    size = 'md',
    showOnlineIndicator = false,
    isOnline = false,
}: UserAvatarProps) {
    return (
        <div className="relative">
            {avatar ? (
                <img
                    src={avatar}
                    alt={name}
                    className={`${sizeClasses[size]} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-blue-500 text-white`}
                >
                    <UserIcon className={iconSizeClasses[size]} />
                </div>
            )}

            {showOnlineIndicator && isOnline && (
                <span
                    className={`${indicatorSizeClasses[size]} absolute bottom-0 right-0 rounded-full border-2 border-white bg-green-500`}
                ></span>
            )}
        </div>
    );
}

