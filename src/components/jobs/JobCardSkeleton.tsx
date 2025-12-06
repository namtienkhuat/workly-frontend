'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const JobCardSkeleton = () => {
    return (
        <article className="rounded-3xl border border-border/40 bg-white/80 p-6 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-5 w-3/4 rounded-full" />
                        <Skeleton className="h-4 w-1/2 rounded-full" />
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="mb-4">
                <div className="space-y-2 mb-4">
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-3 w-5/6 rounded-full" />
                    <Skeleton className="h-3 w-4/6 rounded-full" />
                </div>

                {/* Job Details */}
                <div className="flex flex-wrap gap-3 mb-4">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-18 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                </div>

                {/* Level */}
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>

            {/* Footer Actions */}
            <footer className="space-y-3 pt-4 border-t border-border/40">
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="flex gap-2">
                    <Skeleton className="flex-1 h-10 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </footer>
        </article>
    );
};

export default JobCardSkeleton;
