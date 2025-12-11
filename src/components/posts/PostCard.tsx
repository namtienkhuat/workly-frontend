'use client';

import {
    FavoriteBorderOutlined as FavoriteBorderOutlinedIcon,
    FavoriteOutlined as FavoriteOutlinedIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MediaType, PostResponse, PostVisibilityType } from '@/models/profileModel';
import { getInitials } from '@/utils/helpers';
import StringUtil from '@/utils/StringUtil';
import {
    ArrowLeft,
    ArrowRight,
    Clock,
    MessageCircle,
    MoreHorizontal,
    Bookmark,
    BookmarkCheck,
    Globe,
    Lock,
    Users,
} from 'lucide-react';
import ShowMore from './ShowMore';
import { formatRelativeTime } from '@/utils/time';
import Comments from '../comments/Comments';
import { useAuth } from '@/hooks/useAuth';
import likeService from '@/services/like/likeService';
import ProfileService from '@/services/profile/profileService';
import bookmarkService, { BookmarkType } from '@/services/bookmark/bookmarkService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { Badge } from '@/components/ui/badge';

interface PostCardProps {
    post: PostResponse;
    reload: () => void;
    type: any;
    authorId: string;
    openPopupEdit: () => void;
    isFeed?: boolean;
    onBookmarkChange?: (isBookmarked: boolean) => void;
}

const PostCard = ({
    post,
    reload,
    type,
    authorId,
    openPopupEdit,
    isFeed = false,
    onBookmarkChange,
}: PostCardProps) => {
    const router = useRouter();
    const [liked, setLiked] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [totalComment, setTotalComment] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalLikes, setTotalLikes] = useState<string[]>(post.totalLikes.map((l) => l.authorId));
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        setLiked(totalLikes?.includes(currentUser?.userId ?? '') || false);
        setTotalComment(post.totalComments);
        if (currentUser?.userId) {
            bookmarkService
                .getBookmarkStatus(post._id, BookmarkType.POST)
                .then((res) => {
                    setIsBookmarked(res.data?.isBookmarked || false);
                })
                .catch(() => {});
        }
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
            setAuthModalOpen(true);
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

    const handleCommentClick = () => {
        if (!currentUser?.userId) {
            setAuthModalOpen(true);
            return;
        }
        setCommentOpen((prev) => !prev);
    };

    const handleBookmark = async () => {
        if (!currentUser?.userId) {
            setAuthModalOpen(true);
            return;
        }

        try {
            if (isBookmarked) {
                await bookmarkService.unbookmarkItem(post._id, BookmarkType.POST);
                setIsBookmarked(false);
                if (!onBookmarkChange) {
                    toast.success('Removed from bookmarks');
                }
                onBookmarkChange?.(false);
            } else {
                await bookmarkService.bookmarkItem(post._id, BookmarkType.POST);
                setIsBookmarked(true);
                if (!onBookmarkChange) {
                    toast.success('Saved to bookmarks');
                }
                onBookmarkChange?.(true);
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message || error?.message || 'Failed to update bookmark';
            toast.error(errorMessage);
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

    const getVisibilityIcon = (visibility: PostVisibilityType) => {
        switch (visibility) {
            case PostVisibilityType.PUBLIC:
                return <Globe className="h-3 w-3" />;
            case PostVisibilityType.PRIVATE:
                return <Lock className="h-3 w-3" />;
            case PostVisibilityType.FOLLOWER:
                return <Users className="h-3 w-3" />;
            default:
                return <Globe className="h-3 w-3" />;
        }
    };

    const getVisibilityLabel = (visibility: PostVisibilityType) => {
        switch (visibility) {
            case PostVisibilityType.PUBLIC:
                return 'Public';
            case PostVisibilityType.PRIVATE:
                return 'Private';
            case PostVisibilityType.FOLLOWER:
                return 'Followers';
            default:
                return 'Public';
        }
    };

    const getVisibilityColor = (visibility: PostVisibilityType) => {
        switch (visibility) {
            case PostVisibilityType.PUBLIC:
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case PostVisibilityType.PRIVATE:
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
            case PostVisibilityType.FOLLOWER:
                return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
            default:
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        }
    };

    return (
        <article className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-md hover:shadow-2xl transition-all duration-300">
            <header className="relative flex items-start justify-between gap-4 mb-5">
                <div
                    className="flex items-start gap-3 cursor-pointer group/author hover:opacity-80 transition-opacity"
                    onClick={() => {
                        if (type === 'USER') {
                            router.push(`/profile/${post.author_id}`);
                        } else {
                            router.push(`/company/${post.author_id}`);
                        }
                    }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover/author:opacity-100 transition-opacity duration-300"></div>
                        <Avatar className="h-14 w-14 border-2 border-primary/20 group-hover/author:border-primary/40 transition-all duration-300 relative z-10 shadow-md">
                            {post.author?.imageUrl && (
                                <AvatarImage src={post.author.imageUrl} alt={post.author.name} />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-base">
                                {getInitials(post.author?.name || '?')}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base font-semibold text-foreground group-hover/author:text-primary transition-colors">
                                {post.author?.name}
                            </p>
                            {post.author?.headline && (
                                <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
                                    • {post.author?.headline}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{formatRelativeTime(post.created_at)}</span>
                            </div>
                            {post.visibility && (
                                <Badge
                                    variant="outline"
                                    className={`text-xs px-2.5 py-1 h-6 flex items-center gap-1.5 font-medium ${getVisibilityColor(
                                        post.visibility
                                    )}`}
                                >
                                    {getVisibilityIcon(post.visibility)}
                                    <span>{getVisibilityLabel(post.visibility)}</span>
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {!isFeed && (
                    <div className="relative flex items-center" style={{ zIndex: 9999 }}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-9 w-9 hover:bg-muted/80 transition-all duration-200"
                            onClick={() => setMenuOpen((prev) => !prev)}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        {menuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0"
                                    style={{ zIndex: 9998 }}
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div 
                                    className="absolute right-0 top-12 min-w-[180px] rounded-xl border border-border/60 bg-background/95 backdrop-blur-md p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
                                    style={{ zIndex: 9999 }}
                                >
                                    <button
                                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-accent transition-colors duration-200 flex items-center gap-2"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onEdit();
                                        }}
                                    >
                                        <span>✏️</span>
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors duration-200 flex items-center gap-2"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            handleDelete();
                                        }}
                                    >
                                        <span>🗑️</span>
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </header>

            <div className="relative z-10 space-y-4">
                {post.content && (
                    <div className="text-sm leading-relaxed text-foreground/90">
                        <ShowMore text={post.content} />
                    </div>
                )}

                {currentMedia && (
                    <div className="relative w-full rounded-xl overflow-hidden bg-muted/30 group/media" style={{ zIndex: 1 }}>
                        {currentMedia.type === MediaType.IMAGE && (
                            <img
                                src={StringUtil.generatePath(currentMedia.url)}
                                alt=""
                                className="w-full max-h-[500px] object-contain rounded-xl transition-transform duration-300 group-hover/media:scale-[1.01]"
                            />
                        )}

                        {currentMedia.type === MediaType.VIDEO && (
                            <video
                                src={StringUtil.generatePathVideo(currentMedia.url)}
                                controls
                                className="w-full max-h-[500px] rounded-xl object-contain"
                            />
                        )}

                        {hasMultipleMedia && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 backdrop-blur-sm p-2.5 text-white hover:bg-black/80 transition-all duration-200 hover:scale-110 shadow-lg opacity-0 group-hover/media:opacity-100"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 backdrop-blur-sm p-2.5 text-white hover:bg-black/80 transition-all duration-200 hover:scale-110 shadow-lg opacity-0 group-hover/media:opacity-100"
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
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 rounded-full transition-all duration-200 ${
                                    currentIndex === index
                                        ? 'bg-primary w-8 shadow-md shadow-primary/50'
                                        : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <footer className="relative z-10 mt-6 pt-4 border-t border-border/50">
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant="ghost"
                        className="flex items-center justify-center gap-2 rounded-xl h-11 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group/like"
                        onClick={handleLike}
                    >
                        <div className={`transition-transform duration-200 ${liked ? 'scale-110' : 'group-hover/like:scale-110'}`}>
                            {liked ? (
                                <FavoriteOutlinedIcon className="text-red-500" />
                            ) : (
                                <FavoriteBorderOutlinedIcon className="group-hover/like:text-red-500 transition-colors" />
                            )}
                        </div>
                        <span className="font-medium">{totalLikes.length}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex items-center justify-center gap-2 rounded-xl h-11 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group/comment"
                        onClick={handleCommentClick}
                    >
                        <MessageCircle className={`h-4 w-4 transition-transform duration-200 group-hover/comment:scale-110 ${commentOpen ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                        <span className="font-medium">{totalComment}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex items-center justify-center gap-2 rounded-xl h-11 hover:bg-primary/10 hover:text-primary transition-all duration-200 group/bookmark"
                        onClick={handleBookmark}
                    >
                        {isBookmarked ? (
                            <BookmarkCheck className="h-4 w-4 text-primary transition-transform duration-200 group-hover/bookmark:scale-110" />
                        ) : (
                            <Bookmark className="h-4 w-4 transition-transform duration-200 group-hover/bookmark:scale-110 group-hover/bookmark:text-primary" />
                        )}
                        <span className="font-medium">Save</span>
                    </Button>
                </div>
            </footer>

            {commentOpen && (
                <div className="relative z-10 mt-6 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Comments
                        postId={post._id}
                        onAddComment={() => setTotalComment((prev) => prev + 1)}
                    />
                </div>
            )}

            <AuthRequiredModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                featureName="interact with this post"
            />
        </article>
    );
};

export default PostCard;
