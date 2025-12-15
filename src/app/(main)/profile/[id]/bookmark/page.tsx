'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import bookmarkService, {
    BookmarkResponse,
    BookmarkType,
} from '@/services/bookmark/bookmarkService';
import { PostResponse } from '@/models/profileModel';
import { Job } from '@/models/jobModel';
import PostCard from '@/components/posts/PostCard';
import JobCard from '@/components/jobs/JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bookmark, FileText, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import FeedService from '@/services/feed/feedService';
import searchService from '@/services/search/searchService';
import { getPaging } from '@/utils/api';

const BookmarkPageSkeleton = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48 rounded" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </CardContent>
            </Card>
        </div>
    );
};

const BookmarkPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [bookmarkedPosts, setBookmarkedPosts] = useState<PostResponse[]>([]);
    const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([]);
    const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
    const [activeTab, setActiveTab] = useState<'posts' | 'jobs'>('posts');
    const [deletedBookmarks, setDeletedBookmarks] = useState<BookmarkResponse[]>([]);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slide {
                0% { background-position: 0 0; }
                100% { background-position: 20px 20px; }
            }
            @keyframes ping-slow {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
            @keyframes pulse-slow {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            @keyframes bounce-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            .animate-ping-slow {
                animation: ping-slow 3s ease-in-out infinite;
            }
            .animate-pulse-slow {
                animation: pulse-slow 3s ease-in-out infinite;
            }
            .animate-bounce-slow {
                animation: bounce-slow 2s ease-in-out infinite;
            }
        `;
        style.setAttribute('data-bookmark-animations', 'true');
        if (!document.head.querySelector('style[data-bookmark-animations]')) {
            document.head.appendChild(style);
        }

        if (!currentUser?.userId || currentUser.userId !== id) {
            return;
        }

        fetchBookmarks();
    }, [id, currentUser]);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const response = await bookmarkService.getUserBookmarks();
            const allBookmarks = response.data || [];
            setBookmarks(allBookmarks);

            const postBookmarks = allBookmarks.filter((b) => b.type === BookmarkType.POST);
            const jobBookmarks = allBookmarks.filter((b) => b.type === BookmarkType.JOB);

            if (postBookmarks.length > 0) {
                const postIds = postBookmarks.map((b) => b.itemId);
                await fetchPostDetails(postIds, postBookmarks);
            } else {
                setBookmarkedPosts([]);
            }

            if (jobBookmarks.length > 0) {
                const jobIds = jobBookmarks.map((b) => b.itemId);
                await fetchJobDetails(jobIds, jobBookmarks);
            } else {
                setBookmarkedJobs([]);
            }

            if (postBookmarks.length > 0) {
                setActiveTab('posts');
            } else if (jobBookmarks.length > 0) {
                setActiveTab('jobs');
            }
        } catch (error: any) {
            toast.error('Failed to load bookmarks');
        } finally {
            setLoading(false);
        }
    };

    const fetchPostDetails = async (postIds: string[], postBookmarks: BookmarkResponse[] = []) => {
        try {
            const posts: PostResponse[] = [];

            try {
                let page = 1;
                const size = 50;
                let hasMore = true;
                const postIdSet = new Set(postIds);
                let foundCount = 0;

                while (hasMore && foundCount < postIds.length) {
                    try {
                        const response = await searchService.getPostSearchPaging({
                            page,
                            size,
                            search: '',
                        });
                        const searchPosts = response.data || [];

                        const matchedPosts = searchPosts.filter((p: PostResponse) =>
                            postIdSet.has(p._id)
                        );
                        posts.push(...matchedPosts);
                        foundCount += matchedPosts.length;

                        if (foundCount >= postIds.length || searchPosts.length < size) {
                            hasMore = false;
                        } else {
                            page++;
                        }
                    } catch (err) {
                        hasMore = false;
                    }
                }
            } catch (err) {
                let page = 1;
                const size = 50;
                let hasMore = true;
                const postIdSet = new Set(postIds);
                let foundCount = 0;

                while (hasMore && foundCount < postIds.length) {
                    try {
                        const response = await FeedService.getFeed({ page, size });
                        const feedPosts = response.data || [];

                        const matchedPosts = feedPosts.filter((p: PostResponse) =>
                            postIdSet.has(p._id)
                        );
                        posts.push(...matchedPosts);
                        foundCount += matchedPosts.length;

                        if (foundCount >= postIds.length || feedPosts.length < size) {
                            hasMore = false;
                        } else {
                            page++;
                        }
                    } catch (err) {
                        hasMore = false;
                    }
                }
            }

            const sortedPosts = postIds
                .map((id) => posts.find((p) => p._id === id))
                .filter((p): p is PostResponse => p !== undefined);

            const foundPostIds = new Set(sortedPosts.map((p) => p._id));
            const deletedPostBookmarks = postBookmarks.filter(
                (b: BookmarkResponse) => !foundPostIds.has(b.itemId)
            );

            setBookmarkedPosts(sortedPosts);

            if (deletedPostBookmarks.length > 0) {
                setDeletedBookmarks((prev) => [...prev, ...deletedPostBookmarks]);
            }
        } catch (error) {
            setBookmarkedPosts([]);
        }
    };

    const fetchJobDetails = async (jobIds: string[], jobBookmarks: BookmarkResponse[] = []) => {
        try {
            const jobs: Job[] = [];
            const jobIdSet = new Set(jobIds);

            try {
                let page = 1;
                const size = 50;
                let hasMore = true;
                let foundCount = 0;

                while (hasMore && foundCount < jobIds.length) {
                    try {
                        const response = await getPaging<Job>({
                            url: '/feed/job',
                            params: { page, size },
                        });
                        const feedJobs = response.data || [];

                        const matchedJobs = feedJobs.filter((j: Job) => jobIdSet.has(j._id));
                        jobs.push(...matchedJobs);
                        foundCount += matchedJobs.length;

                        if (foundCount >= jobIds.length || feedJobs.length < size) {
                            hasMore = false;
                        } else {
                            page++;
                        }
                    } catch (err) {
                        try {
                            const response = await searchService.getJobSearchPaging({
                                page,
                                size,
                                search: '',
                            });
                            const searchJobs = response.data || [];

                            const matchedJobs = searchJobs.filter((j: Job) => jobIdSet.has(j._id));
                            jobs.push(...matchedJobs);
                            foundCount += matchedJobs.length;

                            if (foundCount >= jobIds.length || searchJobs.length < size) {
                                hasMore = false;
                            } else {
                                page++;
                            }
                        } catch (searchErr) {
                            hasMore = false;
                        }
                    }
                }
            } catch (err) {}

            const sortedJobs = jobIds
                .map((id) => jobs.find((j) => j._id === id))
                .filter((j): j is Job => j !== undefined);

            const foundJobIds = new Set(sortedJobs.map((j) => j._id));
            const deletedJobBookmarks = jobBookmarks.filter(
                (b: BookmarkResponse) => !foundJobIds.has(b.itemId)
            );

            setBookmarkedJobs(sortedJobs);

            if (deletedJobBookmarks.length > 0) {
                setDeletedBookmarks((prev) => [...prev, ...deletedJobBookmarks]);
            }
        } catch (error) {
            setBookmarkedJobs([]);
        }
    };

    if (!currentUser?.userId || currentUser.userId !== id) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <Bookmark className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-semibold text-foreground mb-2">Access Restricted</p>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                    You can only view your own bookmarks. Please log in to see your saved items.
                </p>
            </div>
        );
    }

    if (loading) {
        return <BookmarkPageSkeleton />;
    }

    const actualTotalBookmarks = bookmarkedPosts.length + bookmarkedJobs.length;
    const totalPosts = bookmarkedPosts.length;
    const totalJobs = bookmarkedJobs.length;
    const hasDeletedItems = deletedBookmarks.length > 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {hasDeletedItems && (
                <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 animate-in slide-in-from-top-4 fade-in duration-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 animate-bounce-slow">
                                <Bookmark className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                                    {deletedBookmarks.length}{' '}
                                    {deletedBookmarks.length === 1 ? 'item has' : 'items have'} been
                                    deleted
                                </p>
                                <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                                    Some of your bookmarked posts or jobs are no longer available.
                                    They have been removed from your bookmarks.
                                </p>
                                <button
                                    onClick={async () => {
                                        try {
                                            for (const bookmark of deletedBookmarks) {
                                                await bookmarkService.unbookmarkItem(
                                                    bookmark.itemId,
                                                    bookmark.type
                                                );
                                            }
                                            setBookmarks((prev) =>
                                                prev.filter(
                                                    (b) =>
                                                        !deletedBookmarks.some(
                                                            (db) =>
                                                                db.itemId === b.itemId &&
                                                                db.type === b.type
                                                        )
                                                )
                                            );
                                            setDeletedBookmarks([]);
                                            toast.success('Cleaned up deleted bookmarks');
                                            await fetchBookmarks();
                                        } catch (error) {
                                            toast.error('Failed to clean up bookmarks');
                                        }
                                    }}
                                    className="text-sm px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                                >
                                    Clean up deleted items
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {actualTotalBookmarks === 0 && !hasDeletedItems ? (
                <Card className="animate-in fade-in zoom-in duration-500">
                    <CardContent className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="relative mb-6 animate-pulse-slow">
                            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-ping-slow" />
                            <Bookmark className="h-20 w-20 text-muted-foreground relative opacity-50" />
                        </div>
                        <p className="text-xl font-semibold text-foreground mb-2">
                            No bookmarks yet
                        </p>
                        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                            Start saving posts and jobs you&apos;re interested in. They&apos;ll
                            appear here for easy access.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/home')}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                            >
                                Explore Posts
                            </button>
                            <button
                                onClick={() => router.push('/jobs')}
                                className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
                            >
                                Browse Jobs
                            </button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-0">
                            <div className="flex border-b border-border bg-gradient-to-r from-background via-background/95 to-background">
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`
                                        flex-1 px-6 py-4 text-center font-semibold transition-all duration-300
                                        relative overflow-hidden group
                                        ${
                                            activeTab === 'posts'
                                                ? 'text-primary bg-primary/5'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                        }
                                    `}
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                        <FileText
                                            className={`h-5 w-5 transition-transform duration-300 ${activeTab === 'posts' ? 'scale-110' : 'group-hover:scale-110'}`}
                                        />
                                        <span>Saved Posts</span>
                                        {totalPosts > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className={`ml-1 text-xs transition-all duration-300 ${activeTab === 'posts' ? 'scale-110' : ''}`}
                                            >
                                                {totalPosts}
                                            </Badge>
                                        )}
                                    </div>
                                    {activeTab === 'posts' && (
                                        <>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-t-full animate-in slide-in-from-left duration-300" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50" />
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                                </button>
                                <button
                                    onClick={() => setActiveTab('jobs')}
                                    className={`
                                        flex-1 px-6 py-4 text-center font-semibold transition-all duration-300
                                        relative overflow-hidden group
                                        ${
                                            activeTab === 'jobs'
                                                ? 'text-primary bg-primary/5'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                        }
                                    `}
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                        <Briefcase
                                            className={`h-5 w-5 transition-transform duration-300 ${activeTab === 'jobs' ? 'scale-110' : 'group-hover:scale-110'}`}
                                        />
                                        <span>Saved Jobs</span>
                                        {totalJobs > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className={`ml-1 text-xs transition-all duration-300 ${activeTab === 'jobs' ? 'scale-110' : ''}`}
                                            >
                                                {totalJobs}
                                            </Badge>
                                        )}
                                    </div>
                                    {activeTab === 'jobs' && (
                                        <>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-t-full animate-in slide-in-from-right duration-300" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-50" />
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="min-h-[400px] relative">
                        {activeTab === 'posts' && (
                            <div
                                className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500"
                                key="posts-tab"
                            >
                                {totalPosts > 0 ? (
                                    <div className="space-y-4">
                                        {bookmarkedPosts.map((post, index) => (
                                            <div
                                                key={post._id}
                                                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <PostCard
                                                    post={post}
                                                    reload={() => {}}
                                                    type="USER"
                                                    authorId={
                                                        post.author_id || post.author?.id || ''
                                                    }
                                                    openPopupEdit={() => {}}
                                                    isFeed={true}
                                                    onBookmarkChange={async (isBookmarked) => {
                                                        if (!isBookmarked) {
                                                            setBookmarkedPosts((prev) =>
                                                                prev.filter(
                                                                    (p) => p._id !== post._id
                                                                )
                                                            );
                                                            setBookmarks((prev) =>
                                                                prev.filter(
                                                                    (b) =>
                                                                        !(
                                                                            b.itemId === post._id &&
                                                                            b.type ===
                                                                                BookmarkType.POST
                                                                        )
                                                                )
                                                            );
                                                            toast.success('Removed from bookmarks');
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="animate-in fade-in zoom-in duration-500">
                                        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                                            <div className="relative mb-4 animate-pulse-slow">
                                                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-ping-slow" />
                                                <FileText className="h-16 w-16 text-muted-foreground relative opacity-50" />
                                            </div>
                                            <p className="text-lg font-semibold text-foreground mb-2">
                                                No saved posts
                                            </p>
                                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                                Start bookmarking posts to see them here.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div
                                className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500"
                                key="jobs-tab"
                            >
                                {totalJobs > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {bookmarkedJobs.map((job, index) => (
                                            <div
                                                key={job._id}
                                                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <JobCard
                                                    job={job}
                                                    isCompanyPage={false}
                                                    canEdit={false}
                                                    onReload={() => {}}
                                                    onBookmarkChange={async (isBookmarked) => {
                                                        if (!isBookmarked) {
                                                            setBookmarkedJobs((prev) =>
                                                                prev.filter(
                                                                    (j) => j._id !== job._id
                                                                )
                                                            );
                                                            setBookmarks((prev) =>
                                                                prev.filter(
                                                                    (b) =>
                                                                        !(
                                                                            b.itemId === job._id &&
                                                                            b.type ===
                                                                                BookmarkType.JOB
                                                                        )
                                                                )
                                                            );
                                                            toast.success('Removed from bookmarks');
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="animate-in fade-in zoom-in duration-500">
                                        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                                            <div className="relative mb-4 animate-pulse-slow">
                                                <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl animate-ping-slow" />
                                                <Briefcase className="h-16 w-16 text-muted-foreground relative opacity-50" />
                                            </div>
                                            <p className="text-lg font-semibold text-foreground mb-2">
                                                No saved jobs
                                            </p>
                                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                                Start bookmarking jobs to see them here.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookmarkPage;
