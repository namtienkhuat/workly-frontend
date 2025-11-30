'use client';

import { useState } from 'react';
import { MoreVertical, User, Trash2, Building2 } from 'lucide-react';
import { UserAvatar } from '../ui';
import { ConversationWithUserInfo, ParticipantType } from '../../types';
import { formatConversationTime, formatUnreadCount } from '../../utils';
import { getUserById } from '@/features/chat/services';
import { useChatStore } from '@/features/chat/store';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
    const userInfoCache = useChatStore((state) => state.userInfoCache);
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    if (!otherParticipant) return null;

    const otherUserInfo = userInfoCache[otherParticipant.id];

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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Subtle animated background effect */}
            {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
            
            <button
                onClick={() => onClick(conversation._id)}
                className="flex flex-1 items-center gap-3 relative z-10"
            >
                {/* Avatar with glow effect on unread */}
                <div className="relative">
                    {myUnreadCount > 0 && (
                        <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md animate-pulse" />
                    )}
                    <UserAvatar
                        avatar={otherUserInfo?.avatar || ''}
                        name={otherUserInfo?.name || ''}
                        size="lg"
                        showOnlineIndicator
                        isOnline={otherParticipant.isOnline}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 overflow-hidden text-left">
                    <div className="flex items-center justify-between gap-2">
                        <h3
                            className={`truncate transition-colors ${
                                myUnreadCount > 0 
                                    ? 'font-semibold text-foreground' 
                                    : 'font-medium text-foreground/90'
                            }`}
                        >
                            {otherParticipant.name}
                        </h3>
                        {lastMessageAt && (
                            <span className={`text-xs whitespace-nowrap transition-colors ${
                                myUnreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'
                            }`}>
                                {formatConversationTime(lastMessageAt)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                        <p
                            className={`truncate text-sm transition-colors ${
                                myUnreadCount > 0 
                                    ? 'font-medium text-foreground/80' 
                                    : 'text-muted-foreground'
                            }`}
                        >
                            {lastMessage?.content || 'Chưa có tin nhắn'}
                        </p>

                        {myUnreadCount > 0 && (
                            <span className="ml-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 px-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/30 animate-in zoom-in duration-200">
                                {formatUnreadCount(myUnreadCount)}
                            </span>
                        )}
                    </div>
                </div>
            </button>

            {/* More Options Menu with smooth transition */}
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 transition-all duration-200 ${
                (isHovered || isMenuOpen) ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
            }`}>
                <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <PopoverTrigger asChild>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="rounded-full p-2 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <MoreVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-1 shadow-lg border-border/50 backdrop-blur-sm" align="end">
                        <div className="flex flex-col gap-0.5">
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
                                <span className="font-medium">Xem trang cá nhân</span>
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-all duration-200 group/item"
                            >
                                <div className="rounded-md bg-destructive/10 p-1.5 group-hover/item:bg-destructive/20 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-medium">Xóa cuộc trò chuyện</span>
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa cuộc trò chuyện với{' '}
                            <span className="font-semibold">{otherParticipant.name}</span>? Hành động
                            này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
