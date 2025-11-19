import React from 'react';
import { Skeleton } from '../ui/skeleton';

const UserInfoSkeleton = () => {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-20 flex-shrink-0" />
                </div>
            </div>
        </div>
    );
};

export default UserInfoSkeleton;
