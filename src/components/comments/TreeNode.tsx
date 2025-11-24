import { CommentResponse } from "@/models/commentModel";
import type { DataNode } from "antd/es/tree";
import Image from "next/image";
import { Avatar, AvatarFallback } from "../ui/avatar";
import StringUtil from "@/utils/StringUtil";
import { getInitials } from "@/utils/helpers";
import CommentUpload from "./AddComment";
import { MoreHorizontalIcon } from "lucide-react";

export type CommentTree = CommentResponse & {
    children?: CommentTree[];
};

export const buildCommentTree = (comments: CommentResponse[]): CommentTree[] => {
    const map = new Map<string | null, CommentResponse[]>();

    comments.forEach((c) => {
        if (!map.has(c.parentId)) {
            map.set(c.parentId, []);
        }
        map.get(c.parentId)?.push(c);
    });

    const rootComments = map.get(null) || [];

    const buildTree = (comment: CommentResponse): CommentTree => ({
        ...comment,
        children: map.get(comment.id)?.map(buildTree),
    });

    return rootComments.map(buildTree);
};

export const convertToTreeNode = (
    comment: CommentTree,
    onReply: (id: string) => void,
    replyToCommentId: string | null,
    postId: string,
    handleCommentAdded: any,
    openMenuId: string | null,
    setOpenMenuId: (id: string) => void
): DataNode => ({
    key: comment.id,
    title: (
        <div className="flex">
            {comment.author.avatarUrl ? (
                <Image
                    src={comment.author.avatarUrl}
                    alt={comment.author.name}
                    loading="lazy"
                    width={40}
                    height={40}
                    className="object-cover rounded-full"
                />
            ) : (
                <Avatar
                    className="h-[40px] w-[40px] rounded-full border-muted"
                    style={{ backgroundColor: StringUtil.getRandomColor() }}
                >
                    <AvatarFallback className="text-xl bg-white">
                        {getInitials(comment.author.name)}
                    </AvatarFallback>
                </Avatar>
            )}
            <div className="flex flex-col gap-3 w-full">

                <div className="flex">
                    <div className="flex items-center">
                        <div className="ml-4">
                            <strong>{comment.author.name}</strong>
                            <span className="text-gray-400 text-xs ml-2">
                                {comment.createdAt ? formatToDate(comment.createdAt) : ''}
                            </span>
                            <p className="text-gray-600">{comment.content}</p>
                        </div>
                    </div>
                    {/* Menu ... */}
                    <MoreHorizontalIcon
                        className="cursor-pointer ml-2"
                        onClick={() => {
                            console.log(comment.id);
                            setOpenMenuId(comment.id)
                        }
                        }
                    />

                    {openMenuId === comment.id && (
                        <div className="absolute right-0 top-8 w-24 bg-white border rounded shadow-lg z-10">
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={() => setOpenMenuId('')}
                            >
                                Edit
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                                onClick={() => setOpenMenuId('')}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 text-gray-500 text-sm justify-end">
                    <span>💬 {comment.children?.length || 0}</span>
                    <button
                        className="text-blue-500 hover:underline"
                        onClick={() => onReply(comment.id)}
                    >
                        Reply
                    </button>
                </div>

                {/* Hiển thị form reply khi click Reply */}
                {replyToCommentId === comment.id && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200 w-full">
                        <CommentUpload
                            postId={postId}
                            parentId={comment.id}  // ✅ Truyền parentId vào đây
                            onCommentAdded={handleCommentAdded}
                        />
                    </div>
                )}
            </div>
        </div>
    ),
    children: comment.children?.map((child) =>
        convertToTreeNode(child, onReply, replyToCommentId, postId, handleCommentAdded, openMenuId, setOpenMenuId)
    ),
});
export function formatToDate(dateTimeString: string) {
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day} month ${month} at ${hours}:${minutes}`;
}