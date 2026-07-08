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
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!oldPosts) return [];
        return oldPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p));
      });
      queryClient.setQueryData(["post", post._id], updatedPost);
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["post", post._id]);
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

  const handleShareEmail = () => {
    const authorName = post.author?.name || "LinkedIn 회원";
    const authorUsername = post.author?.username || "";
    const postContent = post.content || "";
    const postImage = post.image || "";

    const subject = encodeURIComponent(
      `[LinkedIn] ${authorName}님의 게시글 공유`,
    );
    const profileUrl = authorUsername
      ? `${window.location.origin}/profile/${authorUsername}`
      : window.location.origin;

    let emailBody =
      `LinkedIn에서 공유된 게시글을 확인해보세요.\n\n` +
      `작성자: ${authorName} (@${authorUsername})\n` +
      `내용:\n${postContent}\n\n`;

    if (postImage) {
      emailBody += `첨부 이미지 보기: ${postImage}\n\n`;
    }

    emailBody += `작성자 프로필 보기: ${profileUrl}\n`;

    const body = encodeURIComponent(emailBody);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-xl mb-4 transition-all duration-300 hover:shadow-2xl hover:border-base-300/80">
      {/* Post Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-6">
          <Link to={`/profile/${post.author?.username}`}>
            <div className="avatar rounded-full bg-base-300 overflow-hidden w-11 h-11 border border-base-300">
              <img
                src={
                  post.author?.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    post.author?.name || "User",
                  )}&background=0a66c2&color=fff`
                }
                alt={post.author?.name}
              />
            </div>
          </Link>
          <div className="flex flex-col min-w-0">
            <Link
              to={`/profile/${post.author?.username}`}
              className="text-base-content text-sm font-semibold hover:text-[#0a66c2] hover:underline truncate"
            >
              {post.author?.name}
            </Link>
            <p className="text-base-content/60 text-xs truncate max-w-50 md:max-w-100">
              {post.author?.headline || "LinkedIn 회원"}
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-base-content/40 font-medium">
              <Link to={`/post/${post._id}`} className="hover:underline hover:text-[#0a66c2]">
                {formatPostDate(post.createdAt)}
              </Link>
              <span>•</span>
              <Globe className="w-3 h-3 text-base-content/40" />
            </div>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-base-content/50 hover:text-red-400 p-1.5 rounded-lg hover:bg-base-200 transition-all duration-200"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-base-content/40" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Post Content */}
      <p className="text-base-content/90 text-sm whitespace-pre-wrap leading-relaxed wrap-break-word mb-3">
        {post.content}
      </p>

      {/* Post Image */}
      {post.image && (
        <div className="rounded-lg overflow-hidden border border-base-300 max-h-112.5 mb-3">
          <img
            src={post.image}
            alt="Post Attachment"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="flex justify-between items-center text-xs text-base-content/60 pb-2.5 border-b border-base-300">
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
      <div className="flex justify-around items-center pt-2 text-xs font-semibold text-base-content/60">
        <button
          onClick={() => toggleLike()}
          disabled={isLiking}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-base-200 transition-colors duration-200 ${
            isLiked ? "text-[#0a66c2]" : ""
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          <span>좋아요</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-base-200 transition-colors duration-200 ${
            showComments ? "text-[#0a66c2]" : ""
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>댓글</span>
        </button>

        <button
          onClick={handleShareEmail}
          className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-base-200 transition-colors duration-200"
        >
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
