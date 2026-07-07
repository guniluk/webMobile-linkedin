import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PostCreation from '../components/PostCreation';
import PostCard from '../components/PostCard';
import SuggestedUserCard from '../components/SuggestedUserCard';
import { Users, AlertCircle, Loader2, UserCheck } from 'lucide-react';

const HomePage = () => {
  const queryClient = useQueryClient();

  // 1. Fetch Current User
  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await fetch('/api/v1/auth/me');
      if (res.status === 401) return null;
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
  });

  // 2. Fetch Feed Posts
  const {
    data: posts,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/v1/post');
      if (!res.ok) throw new Error('피드 데이터를 가져오는데 실패했습니다.');
      return res.json();
    },
  });

  // 3. Fetch Suggested Connections
  const { data: suggestedUsers, isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ['suggestedConnections'],
    queryFn: async () => {
      const res = await fetch('/api/v1/user/suggestions');
      if (!res.ok) throw new Error('추천 친구를 가져오는데 실패했습니다.');
      return res.json();
    },
  });

  // 4. Fetch Connection Requests (Incoming)
  const { data: connectionRequests } = useQuery({
    queryKey: ['connectionRequests'],
    queryFn: async () => {
      const res = await fetch('/api/v1/connection/requests');
      if (!res.ok) throw new Error('1촌 요청을 가져오는데 실패했습니다.');
      return res.json();
    },
  });

  // 5. Connection Actions Mutations
  const { mutate: acceptRequest } = useMutation({
    mutationFn: async (requestId) => {
      const res = await fetch(`/api/v1/connection/accept/${requestId}`, {
        method: 'PUT',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || '수락 실패');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['connectionRequests']);
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['authUser']);
      queryClient.invalidateQueries(['suggestedConnections']);
    },
    onError: (err) => alert(err.message),
  });

  const { mutate: rejectRequest } = useMutation({
    mutationFn: async (requestId) => {
      const res = await fetch(`/api/v1/connection/reject/${requestId}`, {
        method: 'PUT',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || '거절 실패');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['connectionRequests']);
    },
    onError: (err) => alert(err.message),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {/* Left Column: Mini Profile Sidebar */}
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      {/* Middle Column: Post Creation & Post Feed */}
      <div className="col-span-1 lg:col-span-2">
        <PostCreation user={authUser} />

        {isPostsLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
            <p className="text-base-content/60 text-sm">피드를 불러오는 중...</p>
          </div>
        ) : isPostsError ? (
          <div className="bg-base-100 border border-red-500/20 p-6 rounded-xl flex flex-col items-center text-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h3 className="text-base-content font-semibold">오류 발생</h3>
            <p className="text-base-content/60 text-xs">
              피드를 불러오지 못했습니다.
            </p>
          </div>
        ) : posts?.length === 0 ? (
          <div className="bg-base-100 border border-base-300 p-8 rounded-xl flex flex-col items-center text-center gap-3">
            <Users className="w-10 h-10 text-base-content/40" />
            <h3 className="text-base-content font-semibold">표시할 피드가 없습니다</h3>
            <p className="text-base-content/60 text-xs max-w-70">
              아직 아무도 포스팅하지 않았거나 일촌이 없습니다. 새로운 1촌을 맺어
              소식을 받아보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} authUser={authUser} />
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Connection Requests & Suggested Connections */}
      <div className="col-span-1 lg:col-span-1 space-y-4">
        {/* Connection Requests (Only show if there are pending requests) */}
        {connectionRequests && connectionRequests.length > 0 && (
          <div className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-xl transition-colors duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-base-300">
              <h3 className="text-base-content font-bold text-sm">
                받은 1촌 요청 ({connectionRequests.length})
              </h3>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="space-y-3">
              {connectionRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex flex-col gap-2.5 p-3 rounded-lg bg-base-200 border border-base-300/40 hover:border-base-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Link to={`/profile/${req.sender?.username}`}>
                      <div className="avatar rounded-full bg-base-300 overflow-hidden w-9 h-9 border border-base-300">
                        <img
                          src={
                            req.sender?.profilePicture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              req.sender?.name || 'User',
                            )}&background=0a66c2&color=fff`
                          }
                          alt={req.sender?.name}
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col min-w-0">
                      <Link
                        to={`/profile/${req.sender?.username}`}
                        className="text-base-content text-xs font-semibold hover:text-[#0a66c2] hover:underline truncate"
                      >
                        {req.sender?.name}
                      </Link>
                      <p className="text-base-content/60 text-[10px] truncate max-w-32.5">
                        {req.sender?.headline || 'LinkedIn 회원'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req._id)}
                      className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white border-none flex-1 rounded-full font-semibold whitespace-nowrap shrink-0"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => rejectRequest(req._id)}
                      className="btn btn-xs bg-base-200 hover:bg-base-300 text-base-content border border-base-300 flex-1 rounded-full font-semibold whitespace-nowrap shrink-0"
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Connections */}
        <div className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-xl transition-colors duration-200">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-base-300">
            <h3 className="text-base-content font-bold text-sm">인맥 추천</h3>
            <Users className="w-4 h-4 text-base-content/40" />
          </div>

          {isSuggestionsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#0a66c2]" />
            </div>
          ) : suggestedUsers?.length === 0 ? (
            <p className="text-base-content/45 text-xs text-center py-4">
              추천할 인맥이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {suggestedUsers?.map((user) => (
                <SuggestedUserCard key={user._id} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
