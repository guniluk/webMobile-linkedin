import { Link } from "react-router-dom";

const Sidebar = ({ user }) => {
  if (!user) return null;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl sticky top-20">
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
      <div className="px-4 pb-4 pt-0 relative flex flex-col items-center border-b border-slate-800">
        <Link to={`/profile/${user.username}`} className="relative -mt-10 mb-2">
          <div className="avatar ring ring-slate-800 ring-offset-2 ring-offset-slate-900 rounded-full bg-slate-800 overflow-hidden w-20 h-20">
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
          <h2 className="text-white font-bold text-lg group-hover:text-[#0a66c2] group-hover:underline transition-all duration-200">
            {user.name}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">@{user.username}</p>
        </Link>
        <p className="text-slate-300 text-center text-xs mt-3 line-clamp-2 px-2">
          {user.headline || "LinkedIn 회원"}
        </p>
      </div>

      {/* Stats */}
      <div className="p-4 text-xs font-medium text-slate-400 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span>인맥 수</span>
          <span className="text-[#0a66c2] font-semibold">
            {user.connections?.length || 0}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-800 pt-3">
          <span>프로필 조회자</span>
          <span className="text-white font-semibold">12</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-[#1f2937]/50 p-3 text-center border-t border-slate-800">
        <Link
          to={`/profile/${user.username}`}
          className="text-[#0a66c2] hover:text-white font-semibold text-xs transition-colors duration-200 block w-full py-1.5 rounded-lg hover:bg-[#0a66c2]/10"
        >
          내 프로필 보기
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
