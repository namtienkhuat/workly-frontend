'use client';

import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'sonner';

import PostCard from '@/components/posts/PostCard';
import PostSkeleton from '@/components/posts/PostSkeleton';
import { PostResponse } from '@/models/profileModel';
import FeedService from '@/services/feed/feedService';

const pageSize = 10;
const skeletonCount = 3;

export default function HomePage() {
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchFeed = async (pageNumber: number = 1) => {
        const isFirstPage = pageNumber === 1;
        if (isFirstPage) {
            setLoading(true);
        } else {
            setIsFetchingMore(true);
        }

        try {
            const response = await FeedService.getFeed({ page: pageNumber, size: pageSize });
            const newPosts = response?.data || [];

            if (pageNumber === 1) {
                setPosts(newPosts);
            } else {
                setPosts((prev) => [...prev, ...newPosts]);
            }

            setHasMore((newPosts?.length ?? 0) === pageSize);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải bảng tin');
        } finally {
            if (isFirstPage) {
                setLoading(false);
            } else {
                setIsFetchingMore(false);
            }
        }
    };

    const handleReload = () => {
        setPage(1);
        setHasMore(true);
        fetchFeed(1);
    };

    useEffect(() => {
        fetchFeed(1);
    }, []);

    if (loading) {
        return (
            <section className="space-y-4">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <PostSkeleton key={index} />
                ))}
            </section>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400">
                Follow someone to see their posts here.
            </div>
        );
    }

    return (
        <section className="space-y-4 pb-10">
            <InfiniteScroll
                dataLength={posts.length}
                next={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchFeed(nextPage);
                }}
                hasMore={hasMore}
                loader={
                    isFetchingMore ? (
                        <div className="space-y-4 py-4">
                            {Array.from({ length: 1 }).map((_, index) => (
                                <PostSkeleton key={`loader-${index}`} />
                            ))}
                        </div>
                    ) : null
                }
                // endMessage={
                //     <p className="text-center py-4 text-gray-400">Không còn bài viết nào nữa.</p>
                // }
            >
                <div className="flex flex-col gap-6">
                    {posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            reload={handleReload}
                            type={post.author_type}
                            authorId={post.author?.id || ''}
                            openPopupEdit={() => {}}
                            isFeed={true}
                        />
                    ))}
                </div>
            </InfiniteScroll>
        </section>
    );
}
