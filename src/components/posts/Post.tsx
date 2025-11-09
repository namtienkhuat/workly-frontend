"use client";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useState } from "react";
import Link from "next/link";
import Comments from "../comments/Comments";

const Post = ({ post }: {post: any}) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const liked = false;

  return (
    <div className="shadow-[0_0_25px_-10px_rgba(0,0,0,0.38)] rounded-[20px] bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="p-5">
        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex gap-5 items-center">
            <img
              src={post.profilePic}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
                <Link
                href={`/profile/${post.userId}`}
                className="no-underline text-inherit"
                >
                <span className="font-medium">{post.name}</span>
                </Link>
              <span className="text-xs">1 min ago</span>
            </div>
          </div>
          <MoreHorizIcon />
        </div>

        {/* Content */}
        <div className="my-5">
          <p>{post.desc}</p>
          <img
            src={post.img}
            alt=""
            className="w-full max-h-[500px] object-cover mt-5"
          />
        </div>

        {/* Info */}
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-2 cursor-pointer">
            {liked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
            12 Likes
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCommentOpen(!commentOpen)}
          >
            <TextsmsOutlinedIcon />
            12 Comments
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>

        {/* Comments */}
        {commentOpen && <Comments />}
      </div>
    </div>
  );
};

export default Post;