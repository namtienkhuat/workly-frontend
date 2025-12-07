'use client';

import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import JobCard from '@/components/jobs/JobCard';
import JobCardSkeleton from '@/components/jobs/JobCardSkeleton';
import { useGetFeedJobs } from '@/hooks/useQueryData';
import { Job } from '@/models/jobModel';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [params, setParams] = useState({
        page: 1,
        size: 10,
    });
    const [hasMore, setHasMore] = useState(true);

    const { data: jobData, isLoading, isFetching } = useGetFeedJobs(params);

    // Only show full page skeleton on initial load (page 1)
    const isInitialLoading = isLoading && params.page === 1;

    useEffect(() => {
        if (jobData?.data) {
            const newJobs = jobData.data;

            if (params.page === 1) {
                setJobs(newJobs);
            } else {
                setJobs((prev) => {
                    return [...prev, ...newJobs];
                });
            }

            if (newJobs.length < params.size || newJobs.length === 0) {
                setHasMore(false);
            }
        }
    }, [jobData, params.page, params.size]);

    const fetchMoreData = () => {
        if (!isFetching && hasMore) {
            setParams((prev) => ({
                ...prev,
                page: prev.page + 1,
            }));
        }
    };

    if (isInitialLoading) {
        return (
            <div className="space-y-4 p-4">
                {[...Array(3)].map((_, index) => (
                    <JobCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold px-4">Jobs Feed</h1>
            <InfiniteScroll
                dataLength={jobs.length}
                next={fetchMoreData}
                hasMore={hasMore && !isFetching}
                loader={
                    <div className="space-y-4 p-4">
                        {[...Array(2)].map((_, index) => (
                            <JobCardSkeleton key={`loader-${index}`} />
                        ))}
                    </div>
                }
                endMessage={
                    <p className="text-center text-gray-500 py-4">
                        {jobs.length === 0 ? 'No jobs available' : 'No more jobs to load'}
                    </p>
                }
                className="space-y-4 p-4"
            >
                {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                ))}
            </InfiniteScroll>
        </div>
    );
}
