'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import searchService from '@/services/search/searchService';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from '@/components/posts/PostCard';
import { PostResponse } from '@/models/profileModel';
import PostSkeleton from '@/components/posts/PostSkeleton';

function PostSearchContent() {
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword') ?? '';

    useEffect(() => {
        searchKeyword(keyword);
    }, [keyword]);

    const searchKeyword = async (kw: string) => {
        setIsLoading(true);
        try {
            const res = await searchService.getPostSearchPaging({
                keyword: kw,
                page: 1,
                size: 10,
            });

            setPosts(res.data ?? []);
            setPage(1);
            setHasMore(res.pagination.page < res.pagination.totalPages);

            if (kw !== keyword) {
                router.push(`?keyword=${kw}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            router.push(`?keyword=${keyword}&origin=JOB_SEARCH_PAGE_JOB_FILTER`);
        }
    };

    const fetchMore = async () => {
        if (isFetchingMore) return;

        setIsFetchingMore(true);

        const next = page + 1;
        try {
            const res = await searchService.getPostSearchPaging({
                keyword,
                page: next,
                size: 10,
            });

            setPosts((prev) => [...prev, ...(res.data ?? [])]);
            setPage(next);
            setHasMore(res.pagination.page < res.pagination.totalPages);
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetchingMore(false);
        }
    };

    const handleReload = () => {
        searchKeyword(keyword);
    };

    return (
        <section className="space-y-4 pb-10">
            {isLoading && (
                <div className="py-4">
                    <PostSkeleton />
                </div>
            )}

            <InfiniteScroll
                dataLength={posts.length}
                next={fetchMore}
                hasMore={hasMore}
                loader={
                    isFetchingMore ? (
                        <div className="space-y-4 py-4">
                            <PostSkeleton />
                        </div>
                    ) : null
                }
                endMessage={<p className="text-center text-gray-500 py-4">No more posts to show</p>}
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

export default function PageJobSearch() {
    return (
        <Suspense
            fallback={
                <section className="space-y-4 pb-10">
                    <div className="py-4">
                        <PostSkeleton />
                    </div>
                </section>
            }
        >
            <PostSearchContent />
        </Suspense>
    );
}
