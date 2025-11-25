"use client"
import { useEffect, useState } from "react";
import Post from "./Post";
import { PostResponse } from "@/models/profileModel";
import ProfileService from "@/services/profile/profileService";
import { toast } from "sonner";
import UploadPostModal from "../UploadPost/UploadPost";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";

const Posts = ({ type }: { type: string }) => {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [canUploadCompany, setCanUploadCompany] = useState(false);
  const { isLoading: isLoadingAuth, user: currentUser } = useAuth();
  const params = useParams();
  const pageSize = 10;

  const fetchPosts = async (pageNumber: number = 1) => {
    try {

      const response = await ProfileService.getProfilePostPaging({
        userId: params.id,
        author_type: type,
        page: pageNumber,
        size: pageSize,
      });

      if (pageNumber === 1) {
        setPosts(response?.data || []);
      } else {
        setPosts((prev) => [...prev, ...(response?.data || [])]);
      }

      setHasMore((response?.data?.length ?? 0) === pageSize);
      if (type === "COMPANY") {
        const canAccess = await ProfileService.checkAccessCompany(params.id as string)
        setCanUploadCompany(canAccess.data.isAccess)
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  const canUpload =
    (type === "COMPANY" && canUploadCompany) || (type === "USER" && params?.id === currentUser?.userId);
  useEffect(() => {
    fetchPosts(1);
  }, [params.id]);

  if (loading) {
    return (
      <div>
        {canUpload && <UploadPostModal reload={fetchPosts} type={type} authorId={params.id as string} />}
        <div className="text-center py-10 text-gray-500">Đang tải bài viết...</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div>
        {canUpload && <UploadPostModal reload={fetchPosts} type={type} authorId={params.id as string} />}
        <div className="text-center py-10 text-gray-400">Chưa có bài viết nào.</div>
      </div>
    );
  }

  return (
    <div>
      {canUpload && <UploadPostModal reload={fetchPosts} type={type} authorId={params.id as string} />}

      <InfiniteScroll
        dataLength={posts.length}
        next={() => {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }}
        hasMore={hasMore}
        loader={<h4 className="text-center py-4">Đang tải thêm...</h4>}
        endMessage={
          <p className="text-center py-4 text-gray-400">Không còn bài viết nào nữa.</p>
        }
      >
        <div className="flex flex-col gap-12">
          {posts.map((post) => (
            <Post key={post._id} post={post} reload={() => fetchPosts(1)} type={type} authorId={params.id as string} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Posts;
