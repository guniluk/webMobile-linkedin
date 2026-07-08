import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, UserMinus, ExternalLink, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";

const ConnectionsPage = () => {
  const queryClient = useQueryClient();

  // Fetch Current User
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/v1/auth/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  // 1. Fetch My Connections
  const { data: connections, isLoading, isError } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await fetch("/api/v1/connection");
      if (!res.ok) throw new Error("1촌 목록을 가져오는데 실패했습니다.");
      return res.json();
    },
  });

  // Fetch Connection Requests (Incoming)
  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => {
      const res = await fetch("/api/v1/connection/requests");
      if (!res.ok) throw new Error("1촌 요청을 가져오는데 실패했습니다.");
      return res.json();
    },
  });

  // Accept Connection Request Mutation
  const { mutate: acceptRequest } = useMutation({
    mutationFn: async (requestId) => {
      const res = await fetch(`/api/v1/connection/accept/${requestId}`, {
        method: "PUT",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "수락 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["connectionRequests"]);
      queryClient.invalidateQueries(["connections"]);
      queryClient.invalidateQueries(["suggestedConnections"]);
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["authUser"]);
    },
    onError: (err) => alert(err.message),
  });

  // Reject Connection Request Mutation
  const { mutate: rejectRequest } = useMutation({
    mutationFn: async (requestId) => {
      const res = await fetch(`/api/v1/connection/reject/${requestId}`, {
        method: "PUT",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "거절 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["connectionRequests"]);
    },
    onError: (err) => alert(err.message),
  });

  // 2. Remove Connection Mutation
  const { mutate: removeConn, isPending: isRemoving } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/v1/connection/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "1촌 끊기 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["connections"]);
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["authUser"]);
      queryClient.invalidateQueries(["suggestedConnections"]);
    },
    onError: (err) => alert(err.message),
  });

  const handleDisconnect = (userId, name) => {
    if (window.confirm(`정말로 ${name}님과 1촌을 끊으시겠습니까?`)) {
      removeConn(userId);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto transition-colors duration-200">
      {/* Left Column: Sidebar (Desktop only) */}
      <div className="col-span-1 lg:col-span-1 hidden lg:block">
        <Sidebar user={authUser} />
      </div>

      {/* Right Column: Connection content */}
      <div className="col-span-1 lg:col-span-3">
      {/* Page Header */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-6 shadow-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#0a66c2]/10 p-3 rounded-xl border border-[#0a66c2]/20">
            <Users className="w-6 h-6 text-[#0a66c2]" />
          </div>
          <div>
            <h2 className="text-base-content font-extrabold text-xl">내 인맥 네트워크</h2>
            <p className="text-base-content/60 text-xs mt-1">
              현재 맺어진 일촌들을 확인하고 연결을 관리하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Connection Requests (Only show if there are pending requests) */}
      {connectionRequests && connectionRequests.length > 0 && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-6 shadow-xl mb-6 transition-colors duration-200 animate-fadeIn">
          <h3 className="text-base-content font-bold text-sm mb-4 pb-2 border-b border-base-300">
            받은 1촌 요청 ({connectionRequests.length}개)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectionRequests.map((req) => (
              <div
                key={req._id}
                className="bg-base-200 border border-base-300/40 p-4 rounded-xl flex justify-between items-center hover:border-base-300 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Link to={`/profile/${req.sender?.username}`} className="shrink-0">
                    <div className="avatar rounded-full bg-base-300 overflow-hidden w-11 h-11 border border-base-300">
                      <img
                        src={
                          req.sender?.profilePicture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            req.sender?.name || "User"
                          )}&background=0a66c2&color=fff`
                        }
                        alt={req.sender?.name}
                      />
                    </div>
                  </Link>
                  <div className="flex flex-col min-w-0">
                    <Link
                      to={`/profile/${req.sender?.username}`}
                      className="text-base-content text-sm font-bold hover:text-[#0a66c2] hover:underline truncate"
                    >
                      {req.sender?.name}
                    </Link>
                    <p className="text-base-content/60 text-xs truncate max-w-40 md:max-w-50">
                      {req.sender?.headline || "LinkedIn 회원"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-2">
                  <button
                    onClick={() => acceptRequest(req._id)}
                    className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-full font-semibold px-3 py-1.5 h-auto whitespace-nowrap"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => rejectRequest(req._id)}
                    className="btn btn-xs bg-base-300 hover:bg-base-400 text-base-content border border-base-300 rounded-full font-semibold px-3 py-1.5 h-auto whitespace-nowrap"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-base-100 border border-base-300 rounded-xl shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
          <p className="text-base-content/60 text-sm">인맥 데이터를 불러오는 중...</p>
        </div>
      ) : isError ? (
        <div className="bg-base-100 border border-base-300 p-8 rounded-xl text-center text-base-content/60 shadow-xl">
          데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      ) : connections?.length === 0 ? (
        <div className="bg-base-100 border border-base-300 p-12 rounded-xl text-center flex flex-col items-center gap-4 shadow-xl">
          <Users className="w-12 h-12 text-base-content/40" />
          <div>
            <h3 className="text-base-content font-bold text-base">아직 1촌이 없습니다</h3>
            <p className="text-base-content/60 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
              인맥 추천 목록에서 다른 사용자에게 1촌 신청을 보내거나, 프로필을 방문해 네트워크를 확장해 보세요!
            </p>
          </div>
          <Link
            to="/"
            className="btn btn-sm bg-[#0a66c2] hover:bg-[#004182] text-white border-none rounded-full px-5 font-semibold text-xs mt-2"
          >
            추천 친구 찾기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((conn) => (
            <div
              key={conn._id}
              className="bg-base-100 border border-base-300 rounded-xl p-4 flex justify-between items-center hover:border-base-300 hover:shadow-lg transition-all duration-300 group"
            >
              {/* User Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <Link to={`/profile/${conn.username}`} className="shrink-0">
                  <div className="avatar rounded-full bg-base-300 overflow-hidden w-12 h-12 border border-base-300 group-hover:border-[#0a66c2] transition-colors">
                    <img
                      src={
                        conn.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          conn.name
                        )}&background=0a66c2&color=fff`
                      }
                      alt={conn.name}
                    />
                  </div>
                </Link>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/profile/${conn.username}`}
                      className="text-base-content text-sm font-bold hover:text-[#0a66c2] hover:underline truncate"
                    >
                      {conn.name}
                    </Link>
                    <span className="text-[10px] text-base-content/60 bg-base-200 px-1.5 py-0.5 rounded">
                      1촌
                    </span>
                  </div>
                  <p className="text-base-content/60 text-xs truncate max-w-50 mt-0.5">
                    {conn.headline || "LinkedIn 회원"}
                  </p>
                  <span className="text-[10px] text-base-content/40 mt-1">
                    인맥 {conn.connections?.length || 0}명
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0 ml-2">
                <Link
                  to={`/profile/${conn.username}`}
                  className="btn btn-xs bg-base-200 hover:bg-base-300 text-base-content border border-base-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all"
                  title="프로필 방문"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleDisconnect(conn._id, conn.name)}
                  disabled={isRemoving}
                  className="btn btn-xs bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  title="1촌 끊기"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default ConnectionsPage;
