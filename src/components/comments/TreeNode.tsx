import { CommentResponse } from "@/models/commentModel";
import type { DataNode } from "antd/es/tree";

export type CommentTree = CommentResponse & {
    children?: CommentTree[];
};

export const buildCommentTree = (comments: CommentResponse[]): CommentTree[] => {
    const map = new Map<string | null, CommentResponse[]>();

    comments.forEach((c) => {

        if (map.get(c.parentId) === undefined) {
            console.log(c.parentId);

            map.set(c.parentId, [c]);
            return;
        }
        map.get(c.parentId)?.push(c);
    });
    console.log(map);

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
): DataNode => ({
    key: comment.id,
    title: (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <strong>{comment.authorId}</strong>
                <div className="flex gap-2 text-gray-500 text-sm">
                    <span>👍 {0}</span>
                    <span>💬 {comment.children?.length || 0}</span>
                    <button
                        className="text-blue-500"
                        onClick={() => onReply(comment.id)}
                    >
                        Reply
                    </button>
                </div>
            </div>
            <p className="text-gray-600">{comment.content}</p>
        </div>
    ),
    children: comment.children?.map((child) => convertToTreeNode(child, onReply)),
});
