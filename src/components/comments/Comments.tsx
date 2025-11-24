import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InsertOneResult } from "mongodb";
import Tree, { DataNode } from "antd/es/tree";
import CommentUpload from "./AddComment";
import { buildCommentTree, convertToTreeNode } from "./TreeNode";
import commentService from "@/services/comment/commentService";
import Image from "next/image";
import { Avatar, AvatarFallback } from "../ui/avatar";
import StringUtil from "@/utils/StringUtil";
import { getInitials } from "@/utils/helpers";
import "./comment.css"


type CommentsProps = {
  postId: string;
  onAddComment: any;
};

const Comments = ({ postId, onAddComment }: CommentsProps) => {
  const [comments, setComments] = useState<DataNode[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const handleCommentAdded = async (result: InsertOneResult) => {
    try {
      const id = result.insertedId?.toString();
      if (!id) return;
      onAddComment();
      const { data } = await commentService.getCommentById(id);
      if (data) {
        const newComment: DataNode = {
          key: data.id,
          title: (
            <div className="flex">
              {data.author.avatarUrl ? (
                <Image
                  src={data.author.avatarUrl}
                  alt={data.author.name}
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
                    {getInitials(data.author.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col gap-3 w-full">

                <div>
                  <div className="flex items-center">
                    <div className="ml-4">
                      <strong>{data.author.name}</strong>
                      <span className="text-gray-400 text-xs ml-2">
                        now
                      </span>
                      <p className="text-gray-600">{data.content}</p>
                    </div>
                  </div>

                </div>
                <div className="flex gap-2 text-gray-500 text-sm justify-end">
                  <span>💬 {0}</span>
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setReplyToCommentId(data.id)}
                  >
                    Reply
                  </button>
                </div>
                {replyToCommentId === data.id && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-200 w-full">
                    <CommentUpload
                      postId={postId}
                      parentId={data.id}
                      onCommentAdded={handleCommentAdded}
                    />
                  </div>
                )}
              </div>
            </div>
          ),
        };

        setComments((prev) => [newComment, ...prev]);
        setReplyToCommentId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải bình luận mới");
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentService.getAllComment(postId);
      const commentTree = buildCommentTree(response.data);

      const treeData: DataNode[] = commentTree.map((c) =>
        convertToTreeNode(
          c,
          (id: string) => setReplyToCommentId(id),
          replyToCommentId || '',
          postId,
          handleCommentAdded,
          openMenuId || '',
          (id: string) => {
            setOpenMenuId(id)
          }
        )
      );

      setComments(treeData || []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (comments.length > 0) {
      fetchComments();
    }
  }, [replyToCommentId]);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="flex flex-col max-h-[500px]">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 py-5">
        <Tree
          treeData={comments}
          defaultExpandAll={false}
          selectable={false}
          className="comment-tree"
          switcherIcon={({ expanded }) => (
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                cursor: "pointer"
              }}
            >
              {expanded ? "-" : "+"}
            </div>)} />
      </div>
      <div className="mt-4 pt-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <CommentUpload
          postId={postId}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </div>
  );
};

export default Comments;
