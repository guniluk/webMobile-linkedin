import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Trash2, Send, Loader2 } from "lucide-react";

// Helper for formatting comment creation date
const formatCommentDate = (dateString) => {
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

const CommentSection = ({ post, authUser }) => {
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();

  // Create Comment Mutation
  const { mutate: addComment, isPending: isAdding } = useMutation({
    mutationFn: async (content) => {
      const res = await fetch(`/api/v1/post/${post._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        throw new Error("댓글 작성 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (err) => {
      alert(err.message || "에러가 발생했습니다.");
    },
  });

  // Delete Comment Mutation
  const { mutate: removeComment } = useMutation({
    mutationFn: async (commentId) => {
      const res = await fetch(`/api/v1/post/${post._id}/comment/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("댓글 삭제 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (err) => {
      alert(err.message || "에러가 발생했습니다.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(commentText);
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-800">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4 items-center">
        <div className="avatar rounded-full bg-slate-800 overflow-hidden w-8 h-8 border border-slate-700 shrink-0">
          <img
            src={
              authUser?.profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                authUser?.name || "Me"
              )}&background=0a66c2&color=fff`
            }
            alt="Me"
          />
        </div>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="flex-1 bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg px-3 py-2 text-xs text-white outline-none transition-all duration-200"
        />
        <button
          type="submit"
          disabled={isAdding || !commentText.trim()}
          className="btn btn-sm bg-[#0a66c2] hover:bg-[#004182] disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800 text-white rounded-lg flex items-center border-none font-semibold transition-all duration-200"
        >
          {isAdding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Comment List */}
      <div className="space-y-3 max-h-75 overflow-y-auto pr-1">
        {post.comments?.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-2">
            첫 번째 댓글을 남겨보세요.
          </p>
        ) : (
          post.comments.map((comment) => {
            const isCommentAuthor =
              comment.user?._id?.toString() === authUser?._id?.toString();
            const isPostAuthor =
              post.author?._id?.toString() === authUser?._id?.toString();

            return (
              <div
                key={comment._id}
                className="flex gap-2.5 items-start p-2 rounded-lg bg-slate-900/40 border border-slate-800/30"
              >
                <Link to={`/profile/${comment.user?.username}`}>
                  <div className="avatar rounded-full bg-slate-800 overflow-hidden w-7 h-7 border border-slate-700 shrink-0 mt-0.5">
                    <img
                      src={
                        comment.user?.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          comment.user?.name || "User"
                        )}&background=0a66c2&color=fff`
                      }
                      alt={comment.user?.name}
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        to={`/profile/${comment.user?.username}`}
                        className="text-white text-xs font-semibold hover:text-[#0a66c2] hover:underline"
                      >
                        {comment.user?.name}
                      </Link>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[10px] text-slate-500">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>

                    {(isCommentAuthor || isPostAuthor) && (
                      <button
                        onClick={() => removeComment(comment._id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap break-all">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;
