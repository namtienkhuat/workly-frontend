'use client';

import { X, Minimize2 } from 'lucide-react';
import { UserAvatar } from '../ui';
import { UserInfo } from '../../types';

interface ConversationHeaderProps {
    user?: UserInfo;
    onClose?: () => void;
    onMinimize?: () => void;
    showMinimize?: boolean;
}

export function ConversationHeader({
    user,
    onClose,
    onMinimize,
    showMinimize = false,
}: ConversationHeaderProps) {
    if (!user) {
        return (
            <div className="flex items-center justify-between border-b p-4">
                <div className="text-muted-foreground">Loading...</div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 transition-colors hover:bg-accent"
                        title="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <UserAvatar
                        avatar={user.avatar}
                        name={user.name}
                        size="md"
                        showOnlineIndicator={!user.isDeleted}
                        isOnline={user.isOnline}
                    />
                    {user.isDeleted && (
                        <div className="absolute inset-0 bg-muted/80 rounded-full flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">❌</span>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className={`font-semibold ${user.isDeleted ? 'text-muted-foreground italic' : ''}`}>
                        {user.isDeleted 
                            ? (user.type === 'COMPANY' ? 'Company not found' : 'Account not found')
                            : user.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {user.isDeleted 
                            ? 'Account deleted'
                            : user.isOnline ? 'Active' : 'Inactive'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {showMinimize && onMinimize && (
                    <button
                        onClick={onMinimize}
                        className="rounded-md p-2 transition-colors hover:bg-accent"
                        title="Minimize"
                    >
                        <Minimize2 className="h-5 w-5" />
                    </button>
                )}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 transition-colors hover:bg-accent"
                        title="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

