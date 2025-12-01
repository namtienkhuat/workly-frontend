'use client';
import JobManageCard from '@/app/(companyManage)/_components/JobManageCard';
import { Job } from '@/models/jobModel';
import JobService from '@/services/job/jobService';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'next/navigation';
import PopupCandidateModal from '@/app/(companyManage)/_components/PopupCandidateModel';

export default function CandidateJobs() {
    const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const params = useParams();
    const [openPopup, setOpenPopup] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const getActiveParam = (tab: 'open' | 'closed') => (tab === 'open' ? 1 : 0);

    const fetchJobs = async (tab: 'open' | 'closed', pageNum: number, isReset = false) => {
        if (isReset) {
            setLoading(true);
        }

        try {
            const active = getActiveParam(tab);
            const res = await JobService.getJobByStatus(active, pageNum, 10, params.id as string);
            if (isReset) {
                setJobs(res.data);
            } else {
                setJobs(prev => [...prev, ...res.data]);
            }
            setHasMore(pageNum < res.pagination.totalPages);
        } catch (error: any) {
            console.error('Failed to fetch jobs:', error);
            toast.error('Error when fetch jobs');
            if (isReset) {
                setJobs([]);
            }
        } finally {
            if (isReset) {
                setLoading(false);
            }
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchJobs(activeTab, nextPage, false);
    };

    useEffect(() => {
        setJobs([]);
        setPage(1);
        setHasMore(true);
        fetchJobs(activeTab, 1, true);
    }, [activeTab]);

    const renderJobList = () => (
        <div className="flex-1 p-4">
            {loading && <p>Loading...</p>}

            {!loading && jobs.length === 0 && (
                <p className="text-gray-500">No jobs found</p>
            )}

            {!loading && jobs.length > 0 && (
                <InfiniteScroll
                    dataLength={jobs.length}
                    next={loadMore}
                    hasMore={hasMore}
                    loader={<p className="text-center py-4">Loading more...</p>}
                    endMessage={
                        <p className="text-center py-4 text-gray-500">
                            No more jobs to load
                        </p>
                    }
                >
                    {jobs.map(job => (
                        <JobManageCard
                            key={job._id}
                            jobId={job._id}
                            {...job}
                            onViewCandidates={(id) => {
                                setSelectedJobId(id);
                                setOpenPopup(true);
                            }}

                        />
                    ))}
                </InfiniteScroll>
            )}
        </div>
    );

    return (
        <div>
            <div className="flex border-b bg-white shadow-sm">
                <button
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'open'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    onClick={() => setActiveTab('open')}
                >
                    Open Jobs
                </button>
                <button
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'closed'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    onClick={() => setActiveTab('closed')}
                >
                    Closed Jobs
                </button>
            </div>

            {renderJobList()}
            <PopupCandidateModal
                isOpen={openPopup}
                jobId={selectedJobId || ''}
                onClose={() => setOpenPopup(false)}
            />
        </div>
    );
}