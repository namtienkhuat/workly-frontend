"use client"
import { useEffect, useState } from "react";
import Post from "./Post";
import { PostResponse } from "@/models/profileModel";
import ProfileService from "@/services/profile/profileService";
import { toast } from "sonner";

const Posts = () => {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // tránh set state khi component đã unmount

    const fetchPosts = async () => {
      try {
        const response = await ProfileService.getProfilePostPaging({});
        if (isMounted) {
          setPosts(response?.data || []); // tùy API của bạn
          toast.success("Tải bài viết thành công");
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải bài viết");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Đang tải bài viết...</div>;
  }

  if (posts.length === 0) {
    return <div className="text-center py-10 text-gray-400">Chưa có bài viết nào.</div>;
  }

  return (
    <div className="flex flex-col gap-12">
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
