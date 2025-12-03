'use client';

import {
    FavoriteBorderOutlined as FavoriteBorderOutlinedIcon,
    FavoriteOutlined as FavoriteOutlinedIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MediaType, PostResponse } from '@/models/profileModel';
import { getInitials } from '@/utils/helpers';
import StringUtil from '@/utils/StringUtil';
import { ArrowLeft, ArrowRight, Clock, MessageCircle, MoreHorizontal } from 'lucide-react';
import ShowMore from './ShowMore';
import { formatRelativeTime } from '@/utils/time';
import Comments from '../comments/Comments';
import { useAuth } from '@/hooks/useAuth';
import likeService from '@/services/like/likeService';
import ProfileService from '@/services/profile/profileService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PostCardProps {
    post: PostResponse;
    reload: () => void;
    type: any;
    authorId: string;
    openPopupEdit: () => void;
    isFeed?: boolean;
}

const PostCard = ({
    post,
    reload,
    type,
    authorId,
    openPopupEdit,
    isFeed = false,
}: PostCardProps) => {
    const router = useRouter();
    const [liked, setLiked] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [totalComment, setTotalComment] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalLikes, setTotalLikes] = useState<string[]>(post.totalLikes.map((l) => l.authorId));
    const { user: currentUser } = useAuth();

    useEffect(() => {
        setLiked(totalLikes?.includes(currentUser?.userId ?? '') || false);
        setTotalComment(post.totalComments);
    }, [post, currentUser, totalLikes]);

    const mediaList = post.media_url || [];
    const currentMedia = mediaList[currentIndex];

    const hasMultipleMedia = mediaList.length > 1;

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
    };
    const onEdit = async () => {
        try {
            openPopupEdit();
            reload();
        } catch (err) {
            toast.error('edit post fail');
        }
    };
    const handleLike = async () => {
        if (!currentUser?.userId) {
            alert('Bạn cần đăng nhập');
            return;
        }

        if (liked) {
            await likeService
                .unlikePost(post._id)
                .then(() => {
                    setLiked(false);
                    setTotalLikes((prev) => prev.filter((id) => id !== currentUser.userId));
                })
                .catch(() => toast.error('unlike error'));
        } else {
            await likeService
                .likePost(post._id)
                .then(() => {
                    setLiked(true);
                    setTotalLikes((prev) => [...prev, currentUser.userId]);
                })
                .catch(() => toast.error('like error'));
        }
    };

    const handleDelete = async () => {
        try {
            if (type) {
                await ProfileService.deletePost(post._id, type, authorId);
                toast.success('Delete post success');
                reload();
            }
        } catch (error) {
            toast.error('Delete post failed');
        }
    };

    return (
        <article className="rounded-3xl border border-border/40 bg-white/80 p-6 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <header className="flex items-start justify-between gap-4">
                <div
                    className="flex items-start gap-2 cursor-pointer"
                    onClick={() => {
                        if (type === 'USER') {
                            router.push(`/profile/${post.author_id}`);
                        } else {
                            router.push(`/company/${post.author_id}`);
                        }
                    }}
                >
                    <Avatar className="h-12 w-12">
                        {post.author?.imageUrl && (
                            <AvatarImage src={post.author.imageUrl} alt={post.author.name} />
                        )}
                        <AvatarFallback
                            style={{ backgroundColor: StringUtil.getRandomColor() }}
                            className="text-white"
                        >
                            {getInitials(post.author?.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-0.5">
                        <p className="flex items-baseline text-base gap-1 text-foreground">
                            <span className="font-semibold">{post.author?.name}</span>{' '}
                            <span className="text-[10px] text-muted-foreground">
                                {post.author?.headline}
                            </span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>
                                <Clock className="h-3 w-3" />
                            </span>
                            <span>{formatRelativeTime(post.created_at)}</span>
                        </p>
                    </div>
                </div>

                {!isFeed && (
                    <div className="relative flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => setMenuOpen((prev) => !prev)}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        {menuOpen && (
                            <div className="absolute right-0 top-10 z-50 min-w-[160px] rounded-2xl border border-border/60 bg-background p-2 shadow-xl">
                                <button
                                    className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onEdit();
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-muted"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        handleDelete();
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <div className="mt-5 space-y-4 text-sm text-foreground/90">
                <ShowMore text={post.content} />

                {currentMedia && (
                    <div className="relative w-full rounded-2xl bg-black/80">
                        {currentMedia.type === MediaType.IMAGE && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={StringUtil.generatePath(currentMedia.url)}
                                alt=""
                                className="h-[420px] w-full object-contain rounded-2xl bg-black"
                            />
                        )}

                        {currentMedia.type === MediaType.VIDEO && (
                            <video
                                src={StringUtil.generatePathVideo(currentMedia.url)}
                                controls
                                className="h-[420px] w-full rounded-2xl object-contain"
                            />
                        )}

                        {hasMultipleMedia && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {hasMultipleMedia && (
                    <div className="flex justify-center gap-2">
                        {mediaList.map((_, index) => (
                            <span
                                key={index}
                                className={`h-2 w-2 rounded-full ${currentIndex === index ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <footer className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 rounded-full"
                        onClick={handleLike}
                    >
                        {liked ? (
                            <FavoriteOutlinedIcon className="text-red-500" />
                        ) : (
                            <FavoriteBorderOutlinedIcon />
                        )}
                        <span>{totalLikes.length} Likes</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 rounded-full"
                        onClick={() => setCommentOpen((prev) => !prev)}
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span>{totalComment} Comments</span>
                    </Button>
                    {/* <Button
                        variant="ghost"
                        className="flex items-center justify-center gap-2 rounded-full"
                        onClick={handleShare}
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button> */}
                </div>
            </footer>

            {commentOpen && (
                <div className="mt-6">
                    <Comments
                        postId={post._id}
                        onAddComment={() => setTotalComment((prev) => prev + 1)}
                    />
                </div>
            )}
        </article>
    );
};

export default PostCard;
