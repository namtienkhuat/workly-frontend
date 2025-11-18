import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InsertOneResult } from "mongodb";
import Tree, { DataNode } from "antd/es/tree";
import CommentUpload from "./AddComment";
import { buildCommentTree, convertToTreeNode } from "./TreeNode";
import commentService from "@/services/comment/commentService";

type CommentsProps = {
  postId: string;
};

const Comments = ({ postId }: CommentsProps) => {
  const [comments, setComments] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentId, setCommentId] = useState<string | null>(null)

  const handleCommentAdded = async (result: InsertOneResult) => {
    try {
      const id = result.insertedId?.toString();
      if (!id) return;

      const { data } = await commentService.getCommentById(id);
      if (data) {
        setComments((prev) => [{
          key: data.id,
          title: (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <strong>{data.authorId}</strong>
                <div className="flex gap-2 text-gray-500 text-sm">
                  <span>👍 {0}</span>
                  <span>💬 {0}</span>
                  <button
                    className="text-blue-500"
                    onClick={() => setCommentId(data.id)}
                  >
                    Reply
                  </button>
                </div>
              </div>
              <p className="text-gray-600">{data.content}</p>
            </div>
          ),
        }, ...prev]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải bình luận mới");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchComments = async () => {
      try {
        const response = await commentService.getAllComment(postId);
        const commentTree = buildCommentTree(response.data);
        console.log(commentTree);

        const treeData: DataNode[] = commentTree.map((c) => convertToTreeNode(c, (commentId: string) => { setCommentId(commentId) }));
        if (isMounted) {
          setComments(treeData || []);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải bình luận");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">loading...</div>;
  }
  console.log(comments);

  return (
    <div>
      <Tree treeData={comments} defaultExpandAll selectable={false} />
      <CommentUpload postId={postId} onCommentAdded={handleCommentAdded} />
    </div>
  );
};

export default Comments;
