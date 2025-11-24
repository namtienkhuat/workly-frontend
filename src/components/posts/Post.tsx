'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    FavoriteBorderOutlined as FavoriteBorderOutlinedIcon,
    FavoriteOutlined as FavoriteOutlinedIcon,
    TextsmsOutlined as TextsmsOutlinedIcon,
    ShareOutlined as ShareOutlinedIcon,
    MoreHoriz as MoreHorizIcon,
    ArrowBackIosNew as ArrowBackIosNewIcon,
    ArrowForwardIos as ArrowForwardIosIcon,
} from "@mui/icons-material";
import { PostResponse, MediaType } from '@/models/profileModel';
import Comments from '../comments/Comments';
import ProfileService from '@/services/profile/profileService';
import StringUtil from '@/utils/StringUtil';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials } from '@/utils/helpers';
import ShowMore from './ShowMore';
import { useAuth } from '@/hooks/useAuth';
import likeService from '@/services/like/likeService';
import { toast } from 'sonner';
import ReactPlayer from 'react-player';


interface PostProps {
    post: PostResponse;
    reload: any;
    type: string;
    authorId: string;
}

const Post = ({ post, reload, type, authorId }: PostProps) => {
    const [liked, setLiked] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalComment, setTotalComment] = useState(0);
    const [totalLikes, setTotalLikes] = useState<string[]>(post.totalLikes.map(l => l.authorId));
    const { isLoading: isLoadingAuth, user: currentUser } = useAuth();
    console.log("post", post);


    useEffect(() => {
        setLiked(totalLikes?.includes(currentUser?.userId ?? "") || false)
        setTotalComment(post.totalComments);
    }, [post, currentUser, totalLikes])

    const mediaList = post.media_url || [];
    const currentMedia = mediaList[currentIndex];
    function formatToDate(dateTimeString: string) {
        const date = new Date(dateTimeString);

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day} month ${month} at ${hours}:${minutes}`;
    }
    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
    };


    const onDeletePost = async () => {
        try {
            await ProfileService.deletePost(post._id, type, authorId);
            toast.success("delete post success");

            reload();
        } catch (err) {
            toast.error("delete post fail");
        }
    };
    const handleLike = async () => {
        if (!currentUser?.userId) return alert("Bạn cần đăng nhập");

        if (liked) {
            await likeService.unlikePost(post._id).then(() => {
                setLiked(false);
                setTotalLikes(prev => prev.filter(id => id !== currentUser.userId));
            }).catch(() => {
                toast("unlike error")
            })
        } else {
            await likeService.likePost(post._id).then(() => {
                setLiked(true);
                setTotalLikes(prev => [...prev, currentUser.userId]);
            }).catch(() => {
                toast("unlike error")
            })
        }
    };

    return (
        <div className="shadow-[0_0_25px_-10px_rgba(0,0,0,0.38)] py-8 px-8 rounded-[20px] bg-white text-black dark:bg-gray-900 dark:text-white">
            <div className="flex justify-between relative">

                {/* User Info */}
                <div className="flex items-center">
                    <div className="mr-4">
                        {post.author?.avatarUrl ? (
                            <Image
                                src={post.author!!.avatarUrl}
                                alt={post.author!!.name}
                                loading="lazy"
                                width={15}
                                height={15}
                                className="object-cover"
                            />
                        ) : (
                            <Avatar
                                className="h-[50px] w-[50px] rounded-full border-muted text-2xl"
                                style={{ backgroundColor: StringUtil.getRandomColor() }}
                            >
                                <AvatarFallback className="text-2xl bg-white">
                                    {getInitials(post.author?.name)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <Link
                            href={`/profile/${post._id}`}
                            className="no-underline text-inherit"
                        >
                            <span className="font-medium">{post.author?.name}</span>
                        </Link>
                        <span className="text-xs text-gray-500">{formatToDate(post.created_at)}</span>
                    </div>
                </div>

                {/* More options */}
                <MoreHorizIcon
                    className="cursor-pointer"
                    onClick={() => setOpen(!open)}
                />

                {open && (
                    <div className="absolute right-0 top-8 w-24 bg-white border rounded shadow-lg z-10">
                        <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                                setOpen(false);
                                // onEdit();
                            }}
                        >
                            Edit
                        </button>
                        <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                            onClick={() => {
                                setOpen(false);
                                onDeletePost();
                            }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="my-5 w-full">
                <ShowMore text={post.content} />

                {currentMedia && (
                    <div className="relative w-full max-h-[500px] rounded-lg overflow-hidden mt-5 bg-black flex justify-center">

                        {/* Image controls */}
                        {mediaList.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
                                >
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
                                >
                                    <ArrowForwardIosIcon fontSize="small" />
                                </button>
                            </>
                        )}

                        {/* IMAGE */}
                        {currentMedia.type === MediaType.IMAGE && (
                            <img
                                src={StringUtil.generatePath(currentMedia.url)}
                                alt="post image"
                                className="w-full max-h-[500px] object-contain"
                            />
                        )}

                        {/* VIDEO */}
                        <div className='max-w-[95%]'>
                            {currentMedia.type === MediaType.VIDEO && (
                                <ReactPlayer
                                    src={StringUtil.generatePathVideo(currentMedia.url)}
                                    playing={false}
                                    controls
                                    width="100%"
                                    height="500px"
                                    className="object-contain"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Slider dots */}
                {mediaList.length > 1 && (
                    <div className="flex justify-center gap-2 mt-2">
                        {mediaList.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-blue-500" : "bg-gray-400"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Likes - Comments - Share */}
            <div className="flex items-center gap-5 text-sm">
                <div className="flex items-center gap-2 cursor-pointer" onClick={handleLike}>
                    {liked ? <FavoriteOutlinedIcon className="text-red-500" /> : <FavoriteBorderOutlinedIcon />}
                    <span>{totalLikes.length}</span>
                </div>

                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setCommentOpen(!commentOpen)}
                >
                    <TextsmsOutlinedIcon />
                    <span>{totalComment} Comments</span>
                </div>

                <div className="flex items-center gap-2 cursor-pointer">
                    <ShareOutlinedIcon />
                    <span>Share</span>
                </div>
            </div>

            {/* Comments section */}
            {commentOpen && (
                <Comments
                    postId={post._id}
                    onAddComment={() => setTotalComment((prev) => prev + 1)}
                />
            )}
        </div>
    );
};

export default Post;
