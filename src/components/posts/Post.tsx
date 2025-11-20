'use client';
import { useEffect, useState } from 'react';
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

interface PostProps {
    post: PostResponse;
}

const Post = ({ post }: PostProps) => {
    const [liked, setLiked] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalComment, setTotalComment] = useState(0);
    useEffect(() => { setTotalComment(post.totalComments) }, [post])
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
        setVideoUrl(null);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
        setVideoUrl(null);
    };

    const handlePlayVideo = async (video: string) => {
        try {
            setLoadingVideo(true);
            const res = await ProfileService.getApiStream(video);
            const data = await res.json();
            setVideoUrl(data.streamUrl);
        } catch (err) {
            console.error('Error streaming video:', err);
        } finally {
            setLoadingVideo(false);
        }
    };

    return (
        <div className="shadow-[0_0_25px_-10px_rgba(0,0,0,0.38)] py-8 px-8 rounded-[20px] bg-white text-black dark:bg-gray-900 dark:text-white">
            <div className=" flex justify-between">
                {/* User Info */}
                <div className="flex items-center">
                    <div className='mr-4'>
                        <div >
                            {post.author.avatarUrl ? (
                                <Image
                                    src={post.author!!.avatarUrl}
                                    alt={post.author!!.name}
                                    loading="lazy"
                                    width={15}
                                    height={15}
                                    className="object-cover"
                                />
                            ) : (
                                <Avatar className="h-[50px] w-[50px] rounded-full border-muted text-2xl" style={{ backgroundColor: StringUtil.getRandomColor() }}
                                >
                                    <AvatarFallback className="text-2xl bg-white">
                                        {getInitials(post.author.name)}
                                    </AvatarFallback>
                                </Avatar>
                            )}</div>

                    </div>

                    <div className="flex flex-col">
                        <Link
                            href={`/profile/${post._id}`}
                            className="no-underline text-inherit"
                        >
                            <span className="font-medium">{post._id}</span>
                        </Link>
                        <span className="text-xs text-gray-500">{formatToDate(post.created_at)}</span>
                    </div>
                </div>
                <MoreHorizIcon className="cursor-pointer" />
            </div>

            {/* Content */}
            <div className="my-5 w-full">
                <ShowMore text={post.content} />

                {currentMedia && (
                    <div className="relative w-full max-h-[500px] rounded-lg overflow-hidden mt-5 bg-black">
                        {/* Điều hướng media */}
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
                        {currentMedia.type === MediaType.VIDEO && (
                            <>
                                {!videoUrl ? (
                                    <div className="relative">
                                        <img
                                            src={`${StringUtil.generatePath(currentMedia.url)}?thumbnail=true`}
                                            alt="video thumbnail"
                                            className="w-full max-h-[500px] object-cover opacity-80"
                                        />
                                        <button
                                            disabled={loadingVideo}
                                            onClick={() =>
                                                handlePlayVideo(
                                                    StringUtil.generatePath(currentMedia.url)
                                                )
                                            }
                                            className="absolute inset-0 flex items-center justify-center text-white bg-black/40 hover:bg-black/60 transition"
                                        >
                                            {loadingVideo ? 'Loading...' : '▶️'}
                                        </button>
                                    </div>
                                ) : (
                                    <video
                                        src={videoUrl}
                                        controls
                                        autoPlay
                                        className="w-full max-h-[500px] object-contain"
                                    />
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Dots indicator */}
                {mediaList.length > 1 && (
                    <div className="flex justify-center gap-2 mt-2">
                        {mediaList.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex items-center gap-5 text-sm">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setLiked(!liked)}
                >
                    {liked ? (
                        <FavoriteOutlinedIcon className="text-red-500" />
                    ) : (
                        <FavoriteBorderOutlinedIcon />
                    )}
                    <span>12 Likes</span>
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

            {/* Comments */}
            {commentOpen && <Comments postId={post._id} onAddComment={() => setTotalComment((prev) => { return prev + 1 })} />}
        </div>
    );
};

export default Post;
