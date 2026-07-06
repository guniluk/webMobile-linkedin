import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Trash2,
  Globe,
  Loader2,
} from "lucide-react";
import CommentSection from "./CommentSection";

// Helper for formatting post date
const formatPostDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHr < 24) return `${diffHr}시간 전`;
  return `${diffDay}일 전`;
};

const PostCard = ({ post, authUser }) => {
  const [showComments, setShowComments] = useState(false);
  const queryClient = useQueryClient();

  const isAuthor = post.author?._id?.toString() === authUser?._id?.toString();
  const isLiked = post.likes?.includes(authUser?._id);

  // Delete Post Mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/post/${post._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("포스트 삭제 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (err) => {
      alert(err.message || "오류가 발생했습니다.");
    },
  });

  // Like/Unlike Mutation
  const { mutate: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/post/${post._id}/likeUnlike`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("좋아요 변경 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (err) => {
      alert(err.message || "오류가 발생했습니다.");
    },
  });

  const handleDelete = () => {
    if (window.confirm("정말로 이 포스트를 삭제하시겠습니까?")) {
      deletePost();
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-xl mb-4 transition-all duration-300 hover:shadow-2xl hover:border-slate-700/60">
      {/* Post Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <Link to={`/profile/${post.author?.username}`}>
            <div className="avatar rounded-full bg-slate-800 overflow-hidden w-11 h-11 border border-slate-700">
              <img
                src={
                  post.author?.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    post.author?.name || "User"
                  )}&background=0a66c2&color=fff`
                }
                alt={post.author?.name}
              />
            </div>
          </Link>
          <div className="flex flex-col min-w-0">
            <Link
              to={`/profile/${post.author?.username}`}
              className="text-white text-sm font-semibold hover:text-[#0a66c2] hover:underline truncate"
            >
              {post.author?.name}
            </Link>
            <p className="text-slate-400 text-xs truncate max-w-50 md:max-w-100">
              {post.author?.headline || "LinkedIn 회원"}
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 font-medium">
              <span>{formatPostDate(post.createdAt)}</span>
              <span>•</span>
              <Globe className="w-3 h-3 text-slate-500" />
            </div>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-all duration-200"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Post Content */}
      <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed break-words mb-3">
        {post.content}
      </p>

      {/* Post Image */}
      {post.image && (
        <div className="rounded-lg overflow-hidden border border-slate-800 max-h-112.5 mb-3">
          <img
            src={post.image}
            alt="Post Attachment"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="flex justify-between items-center text-xs text-slate-400 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center bg-[#0a66c2]/80 p-1 rounded-full w-4 h-4">
            <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
          </div>
          <span>{post.likes?.length || 0}</span>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-[#0a66c2] hover:underline"
        >
          댓글 {post.comments?.length || 0}개
        </button>
      </div>

      {/* Post Actions */}
      <div className="flex justify-around items-center pt-2 text-xs font-semibold text-slate-400">
        <button
          onClick={() => toggleLike()}
          disabled={isLiking}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors duration-200 ${
            isLiked ? "text-[#0a66c2]" : ""
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          <span>좋아요</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors duration-200 ${
            showComments ? "text-[#0a66c2]" : ""
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>댓글</span>
        </button>

        <button className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors duration-200">
          <Share2 className="w-4 h-4" />
          <span>공유</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && <CommentSection post={post} authUser={authUser} />}
    </div>
  );
};

export default PostCard;
