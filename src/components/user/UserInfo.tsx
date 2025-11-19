import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface UserInfoProps {
    userId: string;
    name: string;
    headline?: string;
    avatarUrl?: string;
}

const UserInfo = ({ name, headline, avatarUrl }: UserInfoProps) => {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg">
            <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{name}</h4>
                {headline && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{headline}</p>
                )}
            </div>
        </div>
    );
};

export default UserInfo;
