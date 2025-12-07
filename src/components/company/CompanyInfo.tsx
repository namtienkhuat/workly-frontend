import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/helpers';

interface CompanyInfoProps {
    companyId: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    onClick?: () => void;
    showHover?: boolean;
    actionButton?: React.ReactNode;
    className?: string;
}

const CompanyInfo = ({
    name,
    description,
    avatarUrl,
    onClick,
    showHover = false,
    actionButton,
    className,
}: CompanyInfoProps) => {
    return (
        <div
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                showHover && 'hover:bg-accent cursor-pointer transition-colors',
                className
            )}
            onClick={onClick}
        >
            <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{name}</h4>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
                )}
            </div>
            {actionButton && (
                <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {actionButton}
                </div>
            )}
        </div>
    );
};

export default CompanyInfo;
