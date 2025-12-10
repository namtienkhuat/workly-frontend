'use client';

import { useState } from 'react';
import { MoreVertical, User, Trash2, Building2 } from 'lucide-react';
import { UserAvatar } from '../ui';
import { ConversationWithUserInfo, ParticipantType } from '../../types';
import { formatConversationTime } from '../../utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConversationItemProps {
    conversation: ConversationWithUserInfo;
    currentUserId: string | null;
    onClick: (conversationId: string) => void;
    onDelete: (conversationId: string) => void;
    onViewProfile: (participantId: string, participantType: ParticipantType) => void;
    isActive?: boolean;
}

export function ConversationItem({
    conversation,
    currentUserId,
    onClick,
    onDelete,
    onViewProfile,
    isActive = false,
}: ConversationItemProps) {
    const { otherParticipant, lastMessage, lastMessageAt, unreadCount } = conversation;
    const myUnreadCount = currentUserId ? unreadCount[currentUserId] || 0 : 0;
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    if (!otherParticipant) return null;

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete(conversation._id);
        setIsDeleteDialogOpen(false);
    };

    const handleViewProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onViewProfile(otherParticipant.id, otherParticipant.type);
    };

    return (
        <div
            className={`relative flex w-full items-center gap-3 p-4 transition-all duration-300 group ${
                isActive
                    ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-l-4 border-l-primary shadow-sm'
                    : 'hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40 cursor-pointer hover:shadow-sm'
            }`}
            onClick={() => onClick(conversation._id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Subtle animated background effect */}
            {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            )}

            <div className="flex flex-1 items-center gap-3 relative z-10">
                {/* Avatar with glow effect on unread */}
                <div className="relative">
                    {myUnreadCount > 0 && (
                        <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md animate-pulse" />
                    )}
                    <div className="relative">
                        <UserAvatar
                            avatar={otherParticipant.avatar || ''}
                            name={otherParticipant.name || ''}
                            size="lg"
                            showOnlineIndicator={!otherParticipant.isDeleted}
                            isOnline={otherParticipant.isOnline}
                        />
                        {otherParticipant.isDeleted && (
                            <div className="absolute inset-0 bg-muted/80 rounded-full flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">❌</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 overflow-hidden text-left">
                    <div className="flex items-center justify-between gap-2">
                        <h3
                            className={`truncate transition-colors ${
                                otherParticipant.isDeleted
                                    ? 'text-muted-foreground italic'
                                    : myUnreadCount > 0
                                      ? 'font-semibold text-foreground'
                                      : 'font-medium text-foreground/90'
                            }`}
                        >
                            {otherParticipant.isDeleted
                                ? otherParticipant.type === ParticipantType.COMPANY
                                    ? 'Company not found'
                                    : 'Account not found'
                                : otherParticipant.name}
                        </h3>
                        {lastMessageAt && (
                            <span
                                className={`text-xs whitespace-nowrap transition-colors ${
                                    myUnreadCount > 0
                                        ? 'text-primary font-medium'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {formatConversationTime(lastMessageAt)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <p
                            className={`flex-1 truncate text-sm transition-colors ${
                                myUnreadCount > 0
                                    ? 'font-medium text-foreground/80'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            {lastMessage?.content || 'No messages yet'}
                        </p>

                        {myUnreadCount > 0 && (
                            <span className="flex-shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                {myUnreadCount > 99 ? '99+' : myUnreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* More Options Menu with smooth transition */}
            <div
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-50 transition-all duration-200 ${
                    isHovered || isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
            >
                <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <PopoverTrigger asChild>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="rounded-full p-2 bg-background hover:bg-accent transition-all duration-200 border border-border"
                        >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-52 p-1 shadow-lg border-border/50 backdrop-blur-sm z-50"
                        align="end"
                        sideOffset={5}
                    >
                        <div className="flex flex-col gap-0.5">
                            {!otherParticipant.isDeleted && (
                                <button
                                    onClick={handleViewProfile}
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-md hover:bg-accent transition-all duration-200 group/item"
                                >
                                    <div className="rounded-md bg-primary/10 p-1.5 group-hover/item:bg-primary/20 transition-colors">
                                        {otherParticipant.type === ParticipantType.COMPANY ? (
                                            <Building2 className="h-3.5 w-3.5 text-primary" />
                                        ) : (
                                            <User className="h-3.5 w-3.5 text-primary" />
                                        )}
                                    </div>
                                    <span className="font-medium">View profile</span>
                                </button>
                            )}
                            <button
                                onClick={handleDeleteClick}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-all duration-200 group/item"
                            >
                                <div className="rounded-md bg-destructive/10 p-1.5 group-hover/item:bg-destructive/20 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-medium">Delete conversation</span>
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the conversation with{' '}
                            <span className="font-semibold">{otherParticipant.name}</span>? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
