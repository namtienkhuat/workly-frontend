'use client';
import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import jobService from '@/services/job/jobService';
import { Candidate } from '@/models/jobModel';
import { toast } from 'sonner';
import CandidateCard from './CandidateCard';

export default function PopupCandidateModal({
    isOpen,
    onClose,
    jobId
}: {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
}) {
    const [tab, setTab] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const size = 10;

    const fetchCandidates = async (currentPage: number, isReset: boolean = false) => {
        if (loading) return;

        setLoading(true);
        try {
            const response = await jobService.getCandidateByStatus({
                status: tab,
                jobId,
                page: currentPage,
                size
            });

            const newCandidates = response.data || [];

            if (isReset) {
                setCandidates(newCandidates);
            } else {
                setCandidates(prev => [...prev, ...newCandidates]);
            }

            const { totalPages } = response.pagination;
            setHasMore(currentPage < totalPages);
        } catch (error: any) {
            console.error('Error fetching candidates:', error);
            toast.error('Failed to load candidates');
        } finally {
            setLoading(false);
        }
    };

    const handleFeedback = async (userId: string, status: 'ACCEPTED' | 'REJECTED') => {
        try {
            await jobService.feedBackCandidate({
                status,
                jobId,
                userId
            });

            toast.success(`Candidate ${status === 'ACCEPTED' ? 'accepted' : 'rejected'} successfully!`);

            setCandidates([]);
            setPage(1);
            setHasMore(true);
            await fetchCandidates(1, true);
        } catch (error: any) {
            console.error('Error updating candidate:', error);
            toast.error('Failed to update candidate status');
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCandidates(nextPage);
    };

    useEffect(() => {
        if (isOpen) {
            setCandidates([]);
            setPage(1);
            setHasMore(true);
            fetchCandidates(1, true);
        }
    }, [tab, isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white w-[50vw] h-[70vh] rounded-lg shadow-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between border-b p-4">
                    <h2 className="text-xl font-semibold">Candidates</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 px-4 pt-4 border-b">
                    <button
                        onClick={() => setTab('PENDING')}
                        className={`pb-2 px-2 ${tab === 'PENDING'
                            ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                            : 'text-gray-500'
                            }`}
                    >
                        PENDING
                    </button>
                    <button
                        onClick={() => setTab('ACCEPTED')}
                        className={`pb-2 px-2 ${tab === 'ACCEPTED'
                            ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                            : 'text-gray-500'
                            }`}
                    >
                        ACCEPTED
                    </button>
                    <button
                        onClick={() => setTab('REJECTED')}
                        className={`pb-2 px-2 ${tab === 'REJECTED'
                            ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                            : 'text-gray-500'
                            }`}
                    >
                        REJECTED
                    </button>
                </div>

                {/* Tab Content with Infinite Scroll */}
                <div
                    id="scrollableDiv"
                    className="flex-1 overflow-y-auto p-4"
                >
                    <InfiniteScroll
                        dataLength={candidates.length}
                        next={loadMore}
                        hasMore={hasMore}
                        loader={
                            <div className="text-center py-4">
                                <span className="text-gray-500">Loading...</span>
                            </div>
                        }
                        endMessage={
                            <div className="text-center py-4">
                                <span className="text-gray-400">
                                    {candidates.length === 0
                                        ? 'No candidates found'
                                        : 'You have seen all candidates'
                                    }
                                </span>
                            </div>
                        }
                        scrollableTarget="scrollableDiv"
                    >
                        {candidates.map((candidate, index) => (
                            <CandidateCard
                                key={`${candidate._id}-${index}`}
                                candidate={candidate}
                                jobId={jobId}
                                onFeedback={handleFeedback}
                            />
                        ))}
                    </InfiniteScroll>
                </div>
            </div>
        </div>
    );
}