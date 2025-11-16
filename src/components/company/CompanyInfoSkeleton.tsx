import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const CompanyInfoSkeleton = () => {
    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardContent>
        </Card>
    );
};

export default CompanyInfoSkeleton;
