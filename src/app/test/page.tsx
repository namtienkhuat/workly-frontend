import Posts from "@/components/posts/Posts";
import UploadPostModal from "@/components/UploadPost/UploadPost";

export default function Page() {
  return <>
    <UploadPostModal />
    <Posts />
  </>
}