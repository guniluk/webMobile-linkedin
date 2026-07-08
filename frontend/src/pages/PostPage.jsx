import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import { Loader2, ArrowLeft } from "lucide-react";

const PostPage = () => {
  const { id } = useParams();

  // Fetch Current User for Sidebar
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/v1/auth/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  // Fetch Post details
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/post/${id}`);
      if (!res.ok) throw new Error("게시글을 가져오는데 실패했습니다.");
      return res.json();
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto transition-colors duration-200">
      {/* Left Column: Sidebar (Desktop only) */}
      <div className="col-span-1 lg:col-span-1 hidden lg:block">
        <Sidebar user={authUser} />
      </div>

      {/* Right Column: Post details */}
      <div className="col-span-1 lg:col-span-3 space-y-4">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-base-content/60 hover:text-[#0a66c2] text-sm font-semibold transition-colors duration-200 bg-base-100 border border-base-300 rounded-xl px-4 py-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          피드로 돌아가기
        </Link>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-base-100 border border-base-300 rounded-xl shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
            <p className="text-base-content/60 text-sm">게시글을 불러오는 중...</p>
          </div>
        ) : isError || !post ? (
          <div className="bg-base-100 border border-base-300 p-12 rounded-xl text-center flex flex-col items-center gap-4 shadow-xl">
            <h3 className="text-base-content font-bold text-base">게시글을 찾을 수 없습니다</h3>
            <p className="text-base-content/60 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
              삭제된 게시글이거나, 잘못된 경로로 접근하셨을 수 있습니다.
            </p>
          </div>
        ) : (
          <PostCard post={post} authUser={authUser} />
        )}
      </div>
    </div>
  );
};

export default PostPage;
