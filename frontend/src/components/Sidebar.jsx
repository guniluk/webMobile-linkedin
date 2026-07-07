import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Home, Users, Bell } from "lucide-react";

const Sidebar = ({ user }) => {
  // Fetch Notifications
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notification");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch Connection Requests
  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => {
      const res = await fetch("/api/v1/connection/requests");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;
  const requestCount = connectionRequests?.length || 0;

  if (!user) return null;

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-xl sticky top-20 transition-all duration-200">
      {/* Banner */}
      <div
        className="h-20 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: user.bannerImg
            ? `url(${user.bannerImg})`
            : "linear-gradient(to right, #0a66c2, #004182)",
        }}
      />

      {/* Profile Pic & Info */}
      <div className="px-4 pb-4 pt-0 relative flex flex-col items-center border-b border-base-300">
        <Link to={`/profile/${user.username}`} className="relative -mt-10 mb-2">
          <div className="avatar ring ring-base-300 ring-offset-2 ring-offset-base-100 rounded-full bg-base-300 overflow-hidden w-20 h-20">
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
        <Link to={`/profile/${user.username}`} className="text-center group">
          <h2 className="text-base-content font-bold text-lg group-hover:text-[#0a66c2] group-hover:underline transition-all duration-200">
            {user.name}
          </h2>
          <p className="text-base-content/60 text-xs mt-0.5">@{user.username}</p>
        </Link>
        <p className="text-base-content/80 text-center text-xs mt-3 line-clamp-2 px-2">
          {user.headline || "LinkedIn 회원"}
        </p>
      </div>

      {/* Stats */}
      <div className="p-4 text-xs font-medium text-base-content/60 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span>인맥 수</span>
          <span className="text-[#0a66c2] font-semibold">
            {user.connections?.length || 0}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-base-300 pt-3">
          <span>프로필 조회자</span>
          <span className="text-base-content font-semibold">{user.profileViews || 0}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="px-4 py-3 border-t border-base-300 flex flex-col gap-1 text-slate-200">
        <Link
          to="/"
          className="flex items-center justify-between p-2 rounded-lg text-xs font-semibold hover:bg-base-200 text-base-content/85 hover:text-[#0a66c2] transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <Home className="w-4 h-4 text-base-content/60 group-hover:text-[#0a66c2] transition-colors" />
            <span>홈</span>
          </div>
        </Link>

        <Link
          to="/network"
          className="flex items-center justify-between p-2 rounded-lg text-xs font-semibold hover:bg-base-200 text-base-content/85 hover:text-[#0a66c2] transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-base-content/60 group-hover:text-[#0a66c2] transition-colors" />
            <span>인맥</span>
          </div>
          {requestCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-5 h-5 shadow-sm">
              {requestCount}
            </span>
          )}
        </Link>

        <Link
          to="/notifications"
          className="flex items-center justify-between p-2 rounded-lg text-xs font-semibold hover:bg-base-200 text-base-content/85 hover:text-[#0a66c2] transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-base-content/60 group-hover:text-[#0a66c2] transition-colors" />
            <span>알림</span>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-5 h-5 shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Action Footer */}
      <div className="bg-base-200/50 p-3 text-center border-t border-base-300">
        <Link
          to={`/profile/${user.username}`}
          className="text-[#0a66c2] hover:text-[#004182] font-semibold text-xs transition-colors duration-200 block w-full py-1.5 rounded-lg hover:bg-[#0a66c2]/10"
        >
          내 프로필 보기
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
