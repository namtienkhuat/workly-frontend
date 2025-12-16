'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import React, { useEffect, useState, Suspense } from 'react';
import { Search, Loader } from 'lucide-react';
import SelectSkills from '../../profile/edit/_components/SelectSkills';
import { useRouter, useSearchParams } from 'next/navigation';
import searchService from '@/services/search/searchService';
import InfiniteScroll from 'react-infinite-scroll-component';
import JobCardSkeleton from '@/components/jobs/JobCardSkeleton';
import JobCard from '@/components/jobs/JobCard';
import { Job } from '@/models/jobModel';

const experienceLevelOptions = [
    { value: 'intern', label: 'Intern' },
    { value: 'fresher', label: 'Fresher' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid_level', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead/Manager' },
];

function JobSearchContent() {
    const [skills, setSkills] = useState<string[]>([]);
    const [level, setLevel] = useState<string | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [shouldFetch, setShouldFetch] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    const keyword = searchParams.get('keyword') ?? '';

    useEffect(() => {
        handleSearch();
    }, [keyword]);

    useEffect(() => {
        if (!shouldFetch) {
            return;
        }
        handleSearch();
        setShouldFetch(false);
    }, [level, startDate, skills, endDate]);

    const clearAll = () => {
        setSkills([]);
        setLevel(null);
        setStartDate('');
        setEndDate('');
        setShouldFetch(true);
    };

    const buildSearchParams = () => ({
        search: keyword,
        skills,
        level,
        startDate,
        endDate,
    });

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            setPage(1);

            const requestParams = {
                page: 1,
                size: 10,
                ...buildSearchParams(),
            };

            const response = await searchService.getJobSearchPaging(requestParams);

            setJobs(response.data.jobs ?? []);
            setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            router.push(`?keyword=${keyword}&origin=JOB_SEARCH_PAGE_JOB_FILTER`);
        }
    };

    const fetchMoreData = async () => {
        if (isFetching) return;

        setIsFetching(true);
        try {
            const nextPage = page + 1;
            const requestParams = {
                page: nextPage,
                size: 10,
                ...buildSearchParams(),
            };
            const response = await searchService.getJobSearchPaging(requestParams);
            setJobs((prev) => [...prev, ...(response.data.jobs ?? [])]);
            setPage(nextPage);
            if (response.data.pagination.page >= response.data.pagination.totalPages) {
                setHasMore(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetching(false);
        }
    };
    const hasActiveFilters = skills.length > 0 || level || startDate || endDate;
    return (
        <div>
            <div className="w-full bg-white border border-gray-300 rounded-lg p-3">
                <div className="flex flex-wrap items-center gap-4">
                    <SelectSkills value={skills} onChange={setSkills} />

                    <div className="flex justify-between w-[100%]">
                        <div className="flex justify-between w-[37%]">
                            <div className="flex items-center">
                                <Select value={level ?? ''} onValueChange={(v) => setLevel(v)}>
                                    <SelectTrigger className="flex items-center gap-2 px-6 py-1.5 border border-gray-600 rounded-full text-sm font-medium text-gray-700 hover:border-gray-800 hover:bg-gray-50 transition-colors">
                                        <SelectValue placeholder="Level: All levels" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {experienceLevelOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-600 rounded-full text-sm font-medium text-gray-700 hover:border-gray-800 hover:bg-gray-50 transition-colors">
                                <span className="whitespace-nowrap">Date:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border-none bg-transparent text-sm focus:outline-none w-[110px]"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border-none bg-transparent text-sm focus:outline-none w-[110px]"
                                />
                            </div>
                        </div>

                        <div className="flex">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAll}
                                    className="text-blue-600 mr-10 text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    Clear all
                                </button>
                            )}

                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search size={16} />
                                        Search
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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

export default function PageJobSearch() {
    return (
        <Suspense
            fallback={
                <div className="space-y-4 p-4">
                    {[...Array(2)].map((_, index) => (
                        <JobCardSkeleton key={`loader-${index}`} />
                    ))}
                </div>
            }
        >
            <JobSearchContent />
        </Suspense>
    );
}
