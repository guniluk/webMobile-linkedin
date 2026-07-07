import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { UserPlus, Clock } from "lucide-react";

const SuggestedUserCard = ({ user }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("idle"); // idle, pending, sent

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/connection/request/${user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "요청 전송 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      setStatus("sent");
      queryClient.invalidateQueries(["suggestedConnections"]);
    },
    onError: (err) => {
      console.error(err);
      alert(err.message || "오류가 발생했습니다.");
    },
  });

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200 transition-colors duration-200 border border-transparent hover:border-base-300">
      <div className="flex items-center gap-2.5 min-w-0">
        <Link to={`/profile/${user.username}`} className="shrink-0">
          <div className="avatar rounded-full bg-base-300 overflow-hidden w-9 h-9 border border-base-300">
            <img
              src={
                user.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=0a66c2&color=fff`
              }
              alt={user.name}
            />
          </div>
        </Link>
        <div className="flex flex-col min-w-0">
          <Link
            to={`/profile/${user.username}`}
            className="text-base-content text-xs font-semibold hover:text-[#0a66c2] hover:underline truncate"
          >
            {user.name}
          </Link>
          <p className="text-base-content/60 text-[10px] truncate max-w-32.5">
            {user.headline || "LinkedIn 회원"}
          </p>
        </div>
      </div>

      <div className="shrink-0 ml-2">
        {status === "sent" ? (
          <button
            disabled
            className="btn btn-xs bg-base-300 text-base-content/40 border border-base-300 flex items-center gap-1 px-2 py-1 rounded-full cursor-not-allowed whitespace-nowrap text-[10px] font-semibold"
          >
            <Clock className="w-3 h-3" />
            <span>대기 중</span>
          </button>
        ) : (
          <button
            onClick={() => sendRequest()}
            disabled={isPending}
            className="btn btn-xs bg-transparent hover:bg-[#0a66c2]/10 text-[#0a66c2] hover:text-[#0a66c2] border border-[#0a66c2] flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200 disabled:opacity-50 whitespace-nowrap text-[10px] font-semibold"
          >
            <UserPlus className="w-3 h-3" />
            <span>{isPending ? "전송 중" : "1촌 맺기"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SuggestedUserCard;
