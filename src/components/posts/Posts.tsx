'use client';
import { useEffect, useState } from 'react';
import { PostResponse } from '@/models/profileModel';
import ProfileService from '@/services/profile/profileService';
import { toast } from 'sonner';
import UploadPostModal from '../UploadPost/UploadPost';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from './PostCard';

const Posts = ({ type }: { type: string }) => {
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [canUploadCompany, setCanUploadCompany] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<string>('');
    const { user: currentUser } = useAuth();
    const params = useParams();
    const pageSize = 10;

    const fetchPosts = async (pageNumber: number = 1) => {
        try {
            const response = await ProfileService.getProfilePostPaging({
                userId: params.id,
                author_type: type,
                page: pageNumber,
                size: pageSize,
            });

            if (pageNumber === 1) {
                setPosts(response?.data || []);
            } else {
                setPosts((prev) => [...prev, ...(response?.data || [])]);
            }

            setHasMore((response?.data?.length ?? 0) === pageSize);
            if (type === 'COMPANY') {
                const canAccess = await ProfileService.checkAccessCompany(params.id as string);
                setCanUploadCompany(canAccess.data.isAccess);
            }
        } catch (error) {
            toast.error('Unable to load posts');
        } finally {
            setLoading(false);
        }
    };

    const canUpload =
        (type === 'COMPANY' && canUploadCompany) ||
        (type === 'USER' && params?.id === currentUser?.userId);
    useEffect(() => {
        fetchPosts(1);
    }, [params.id]);

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {canUpload && (
                    <UploadPostModal
                        reload={fetchPosts}
                        editPost={posts.find((p) => p._id === status)}
                        setStatus={setStatus}
                        type={type}
                        authorId={params.id as string}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        status={status}
                    />
                )}
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground text-sm animate-pulse">Loading posts...</p>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                {canUpload && (
                    <UploadPostModal
                        reload={fetchPosts}
                        editPost={posts.find((p) => p._id === status)}
                        setStatus={setStatus}
                        type={type}
                        authorId={params.id as string}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        status={status}
                    />
                )}
                <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse-slow" />
                        <div className="text-6xl mb-4 opacity-50 relative animate-bounce-slow">
                            📝
                        </div>
                    </div>
                    <p className="text-lg font-semibold text-foreground mb-2">No posts yet</p>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                        {canUpload
                            ? 'Start sharing your thoughts and updates with the community!'
                            : "This user hasn't shared any posts yet."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {canUpload && (
                <UploadPostModal
                    reload={fetchPosts}
                    editPost={posts.find((p) => p._id === status)}
                    setStatus={setStatus}
                    type={type}
                    authorId={params.id as string}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    status={status}
                />
            )}

            <InfiniteScroll
                dataLength={posts.length}
                next={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchPosts(nextPage);
                }}
                hasMore={hasMore}
                loader={
                    <div className="flex justify-center py-8 animate-in fade-in duration-300">
                        <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                }
                endMessage={
                    <div className="text-center py-8 animate-in fade-in duration-300">
                        <p className="text-sm text-muted-foreground">No more posts to load</p>
                    </div>
                }
                scrollThreshold={0.8}
            >
                <div className="flex flex-col gap-6">
                    {posts.map((post, index) => (
                        <div
                            key={post._id}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <PostCard
                                post={post}
                                reload={() => fetchPosts(1)}
                                type={type}
                                authorId={params.id as string}
                                openPopupEdit={() => {
                                    setIsOpen(true);
                                    setStatus(post._id);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </InfiniteScroll>
        </div>
    );
};

export default Posts;
