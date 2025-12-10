import { CommentResponse } from "@/models/commentModel";
import type { DataNode } from "antd/es/tree";
import Image from "next/image";
import { Avatar, AvatarFallback } from "../ui/avatar";
import StringUtil from "@/utils/StringUtil";
import { getInitials } from "@/utils/helpers";
import CommentUpload from "./AddComment";
import { MessageSquare } from "lucide-react";

export type CommentTree = CommentResponse & {
    children?: CommentTree[];
};

// ========================================
// Build Comment Tree
// ========================================
export const buildCommentTree = (comments: CommentResponse[]): CommentTree[] => {
    const commentMap = new Map<string | null, CommentResponse[]>();

    // Group comments by parentId
    comments.forEach((comment) => {
        if (!commentMap.has(comment.parentId)) {
            commentMap.set(comment.parentId, []);
        }
        commentMap.get(comment.parentId)?.push(comment);
    });

    // Build tree recursively
    const buildTree = (comment: CommentResponse): CommentTree => ({
        ...comment,
        children: commentMap.get(comment.id)?.map(buildTree),
    });

    const rootComments = commentMap.get(null) || [];
    return rootComments.map(buildTree);
};

// ========================================
// Format Date Helper
// ========================================
export function formatToDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day} month ${month} at ${hours}:${minutes}`;
}

const CommentAvatar = ({
    author,
}: {
    author: { name: string; imageUrl?: string };
}) => {
    if (author.imageUrl) {
        return (
            <Image
                src={author.imageUrl}
                alt={author.name}
                loading="lazy"
                width={40}
                height={40}
                className="object-cover rounded-full"
            />
        );
    }

    return (
        <Avatar
            className="h-10 w-10 rounded-full"
            style={{ backgroundColor: StringUtil.getRandomColor() }}
        >
            <AvatarFallback className="text-sm font-semibold">
                {getInitials(author.name)}
            </AvatarFallback>
        </Avatar>
    );
};


const CommentNode = ({
    comment,
    onReply,
}: {
    comment: CommentTree;
    onReply: (id: string) => void;
}) => {
    const replyCount = comment.children?.length || 0;

    return (
        <div className="flex w-full gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
            {/* Avatar */}
            <div className="flex-shrink-0">
                <CommentAvatar author={comment.author} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 relative">
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {comment.author.name}
                            </strong>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {comment.createdAt ? formatToDate(comment.createdAt) : ""}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Comment Text */}
                <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
                    {comment.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-2">
                    {replyCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {replyCount} {replyCount === 1 ? "reply" : "replies"}
                        </span>
                    )}
                    <button
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                        onClick={() => onReply(comment.id)}
                    >
                        Reply
                    </button>
                </div>

            </div>
        </div>
    );
};

// ========================================
// Render Comment with Children
// ========================================
const renderCommentNode = (
    comment: CommentTree,
    onReply: (id: string) => void,
    replyToCommentId: string | null,
    postId: string,
    handleCommentAdded: any
): React.ReactNode => {
    return (
        <div key={comment.id} className="w-full">
            {/* Comment */}
            <CommentNode
                comment={comment}
                onReply={onReply}
            />

            {/* Nested Replies */}
            {comment.children && comment.children.length > 0 && (
                <div className="mt-2 ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
                    {comment.children.map((child) =>
                        renderCommentNode(
                            child,
                            onReply,
                            replyToCommentId,
                            postId,
                            handleCommentAdded,
                        )
                    )}
                </div>
            )}
        </div>
    );
};


const isReplyInSubtree = (comment: CommentTree, targetId: string): boolean => {
    if (comment.id === targetId) return true;
    if (comment.children) {
        return comment.children.some((child) => isReplyInSubtree(child, targetId));
    }
    return false;
};

// ========================================
// Convert to Tree Node for Ant Design
// ========================================
export const convertToTreeNode = (
    comment: CommentTree,
    onReply: (id: string) => void,
    replyToCommentId: string | null,
    postId: string,
    handleCommentAdded: any,
): DataNode => {
    const showReplyInput = replyToCommentId && isReplyInSubtree(comment, replyToCommentId);

    return {
        key: comment.id,
        title: (
            <div className="flex flex-col w-full space-y-3">
                {/* Comment Tree */}
                {renderCommentNode(
                    comment,
                    onReply,
                    replyToCommentId,
                    postId,
                    handleCommentAdded
                )}

                {/* Reply Input */}
                {showReplyInput && (
                    <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
                            Replying to <span className="text-blue-600 dark:text-blue-400">{comment.author.name}</span>
                        </p>
                        <CommentUpload
                            postId={postId}
                            parentId={replyToCommentId || ""}
                            onCommentAdded={handleCommentAdded}
                        />
                    </div>
                )}
            </div>
        ),
        children: [],
    };
};