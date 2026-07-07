import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sun, Moon } from "lucide-react";

const Navbar = ({ authUser, theme, toggleTheme }) => {
  const location = useLocation();
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notification");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!authUser,
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => {
      const res = await fetch("/api/v1/connection/requests");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!authUser,
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;
  const requestCount = connectionRequests?.length || 0;

  return (
    <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="shrink-0 flex items-center gap-2">
              <svg
                className="h-8 w-auto text-[#0a66c2] fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span className="text-base-content font-bold text-lg hidden sm:block tracking-wide">
                LinkedIn
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle text-base-content/80 hover:text-base-content focus:outline-none"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>

            {authUser ? (
              <>
                {/* Navigation Links */}
                <div className="flex items-center gap-6 mr-4">
                  <Link
                    to="/"
                    className="flex flex-col items-center text-base-content/75 hover:text-base-content transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium hidden md:block">
                      홈
                    </span>
                  </Link>

                  <Link
                    to="/network"
                    className="flex flex-col items-center text-base-content/75 hover:text-base-content transition-colors relative"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
                      />
                    </svg>
                    {requestCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-4 h-4 border border-base-100">
                        {requestCount}
                      </span>
                    )}
                    <span className="text-[10px] mt-1 font-medium hidden md:block">
                      인맥
                    </span>
                  </Link>

                  <Link
                    to="/notifications"
                    className="flex flex-col items-center text-base-content/75 hover:text-base-content transition-colors relative"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-4 h-4 border border-base-100">
                        {unreadCount}
                      </span>
                    )}
                    <span className="text-[10px] mt-1 font-medium hidden md:block">
                      알림
                    </span>
                  </Link>
                </div>

                {/* Profile Dropdown */}
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar border border-base-300 focus:outline-none"
                  >
                    <div className="w-10 rounded-full bg-base-300">
                      <img
                        alt="Profile"
                        src={
                          authUser.profilePicture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            authUser.name,
                          )}&background=0a66c2&color=fff`
                        }
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="mt-3 z-1 p-2 shadow-2xl menu menu-sm dropdown-content bg-base-200 border border-base-300 rounded-box w-52 text-base-content"
                  >
                    <li className="px-4 py-2 border-b border-base-300">
                      <div className="font-semibold text-base-content">
                        {authUser.name}
                      </div>
                      <div className="text-xs text-base-content/60">
                        @{authUser.username}
                      </div>
                    </li>
                    <li>
                      <Link
                        to={`/profile/${authUser.username}`}
                        className="py-2.5"
                      >
                        내 프로필
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/logout"
                        className="text-red-400 hover:text-red-300 py-2.5"
                      >
                        로그아웃
                      </Link>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location.pathname === "/login"
                      ? "bg-base-300 text-base-content shadow-sm"
                      : "text-base-content/80 hover:text-base-content hover:bg-base-200"
                  }`}
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location.pathname === "/signup"
                      ? "bg-base-300 text-base-content shadow-sm"
                      : "text-base-content/80 hover:text-base-content hover:bg-base-200"
                  }`}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
