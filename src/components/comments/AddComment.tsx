"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { InsertOneResult } from "mongodb";
import commentService from "@/services/comment/commentService";
import StringUtil from "@/utils/StringUtil";
import Image from "next/image";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { getInitials } from "@/utils/helpers";
import { useAuth } from "@/hooks/useAuth";

const commentSchema = z.object({
    desc: z
        .string()
        .min(1, "Bình luận không được để trống")
        .max(300, "Bình luận tối đa 300 ký tự"),
});

type CommentUploadProps = {
    postId: string;
    onCommentAdded: (result: InsertOneResult) => void;
    parentId?: string | null;
    userProfilePicture?: string;
    userName?: string;
};

const CommentUpload = ({
    postId,
    onCommentAdded,
    parentId = null,
}: CommentUploadProps) => {
    const [commentText, setCommentText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const { isLoading: isLoadingAuth, user: currentUser } = useAuth();

    const handleSend = useCallback(async () => {
        if (loading) return;

        setErrorMessage("");

        try {
            commentSchema.parse({ desc: commentText });

            setLoading(true);

            const response = await commentService.createComment({
                content: commentText,
                parentId,
                postId,
            });
            console.log(response);

            if (!response.data) {
                throw new Error("API không trả về kết quả hợp lệ");
            }

            onCommentAdded(response.data);
            setCommentText("");
        } catch (err) {
            if (err instanceof z.ZodError) {
                const message = err.issues?.[0]?.message ?? "Lỗi validation";
                setErrorMessage(message);
                toast.error(message);
            } else {
                console.error(err);
                toast.error("Không thể gửi bình luận");
            }
        } finally {
            setLoading(false);
        }
    }, [commentText, parentId, postId, onCommentAdded, loading]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && commentText.trim() && !loading) handleSend();
    };

    return (
        <div className="flex flex-col gap-1 flex-1 w-full">
            <div className="flex items-center gap-3 w-full">
                {currentUser?.avatarUrl ? (
                    <Image
                        src={currentUser!!.avatarUrl}
                        alt={currentUser!!.name}
                        loading="lazy"
                        width={15}
                        height={15}
                        className="object-cover"
                    />
                ) : (
                    <Avatar className="h-[50px] w-[50px] rounded-full border-muted text-2xl" style={{ backgroundColor: StringUtil.getRandomColor() }}
                    >
                        <AvatarFallback className="text-2xl bg-white">
                            {getInitials(currentUser!!.name)}
                        </AvatarFallback>
                    </Avatar>
                )}

                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Viết bình luận..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={loading}
                />

                <button
                    onClick={handleSend}
                    disabled={loading || !commentText.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Đang gửi..." : "Gửi"}
                </button>
            </div>

            {errorMessage && (
                <span className="text-red-500 text-sm ml-3">{errorMessage}</span>
            )}
        </div>
    );
};

export default CommentUpload;
