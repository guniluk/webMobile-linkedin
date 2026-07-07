import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Bell,
  ThumbsUp,
  MessageSquare,
  UserPlus,
  Trash2,
  Eye,
  Loader2,
  X,
} from 'lucide-react';
import PostCard from '../components/PostCard';

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Fetch Current User
  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await fetch('/api/v1/auth/me');
      if (res.status === 401) return null;
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
  });

  // Fetch Notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/v1/notification');
      if (!res.ok) throw new Error('알림 데이터를 가져오는데 실패했습니다.');
      return res.json();
    },
  });

  // Mark as Read Mutation
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/v1/notification/${id}/read`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('알림 읽음 처리 실패');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  // Delete Notification Mutation
  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/v1/notification/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('알림 삭제 실패');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  // Fetch Related Post details when selected
  const { data: activePost, isLoading: isActivePostLoading } = useQuery({
    queryKey: ['activePost', selectedPostId],
    queryFn: async () => {
      if (!selectedPostId) return null;
      const res = await fetch(`/api/v1/post/${selectedPostId}`);
      if (!res.ok) throw new Error('포스트 상세 조회 실패');
      return res.json();
    },
    enabled: !!selectedPostId,
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.relatedPost) {
      setSelectedPostId(
        notification.relatedPost._id || notification.relatedPost,
      );
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return (
          <div className="bg-[#0a66c2]/10 p-2 rounded-full border border-[#0a66c2]/20">
            <ThumbsUp className="w-5 h-5 text-[#0a66c2] fill-current" />
          </div>
        );
      case 'comment':
        return (
          <div className="bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
          </div>
        );
      case 'connectionAccepted':
        return (
          <div className="bg-purple-500/10 p-2 rounded-full border border-purple-500/20">
            <UserPlus className="w-5 h-5 text-purple-500" />
          </div>
        );
      default:
        return (
          <div className="bg-base-200 p-2 rounded-full">
            <Bell className="w-5 h-5 text-base-content/40" />
          </div>
        );
    }
  };

  const getNotificationMessage = (notification) => {
    const name = notification.relatedUser?.name || '누군가';
    switch (notification.type) {
      case 'like':
        return (
          <span>
            <strong className="text-base-content font-bold">{name}</strong>님이 회원님의 게시글을
            좋아합니다.
          </span>
        );
      case 'comment':
        return (
          <span>
            <strong className="text-base-content font-bold">{name}</strong>님이 회원님의
            게시글물에 댓글을 달았습니다.
          </span>
        );
      case 'connectionAccepted':
        return (
          <span>
            <strong className="text-base-content font-bold">{name}</strong>님과 일촌(커넥션)이
            되었습니다!
          </span>
        );
      default:
        return '새로운 알림이 있습니다.';
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-base-100 border border-base-300 rounded-xl shadow-xl overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-base-300">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#0a66c2]" />
          <h2 className="text-base-content font-bold text-lg">알림 센터</h2>
        </div>
        <span className="text-xs text-base-content/60 font-medium bg-base-200 px-2.5 py-1 rounded-full">
          미확인 {notifications?.filter((n) => !n.read).length || 0}개
        </span>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
          <p className="text-base-content/60 text-sm">알림을 로딩하는 중...</p>
        </div>
      ) : notifications?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Bell className="w-12 h-12 text-base-content/40" />
          <h3 className="text-base-content font-semibold">알림이 없습니다</h3>
          <p className="text-base-content/60 text-xs">
            아직 새로운 활동이나 일촌 변경 소식이 없습니다.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-base-300">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex justify-between items-center p-4 transition-all duration-200 cursor-pointer ${
                notification.read
                  ? 'bg-transparent hover:bg-base-200'
                  : 'bg-[#0a66c2]/5 hover:bg-[#0a66c2]/10 border-l-4 border-[#0a66c2]'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {getNotificationIcon(notification.type)}

                <div className="flex items-center gap-3 min-w-0">
                  <Link
                    to={`/profile/${notification.relatedUser?.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  >
                    <div className="avatar rounded-full bg-base-300 overflow-hidden w-10 h-10 border border-base-300">
                      <img
                        src={
                          notification.relatedUser?.profilePicture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            notification.relatedUser?.name || 'User',
                          )}&background=0a66c2&color=fff`
                        }
                        alt="Sender"
                      />
                    </div>
                  </Link>

                  <div className="flex flex-col min-w-0">
                    <p className="text-base-content/80 text-sm leading-relaxed">
                      {getNotificationMessage(notification)}
                    </p>
                    <span className="text-[10px] text-base-content/40 mt-1 font-medium">
                      {new Date(notification.createdAt).toLocaleDateString()}{' '}
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {notification.relatedPost && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                    className="text-base-content/60 hover:text-base-content p-2 rounded-lg hover:bg-base-200 transition-colors"
                    title="게시물 보기"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="text-base-content/50 hover:text-red-400 p-2 rounded-lg hover:bg-base-200 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {selectedPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-base-100 border border-base-300 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl transition-colors duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
              <h3 className="text-base-content font-bold text-sm">관련 게시물</h3>
              <button
                onClick={() => setSelectedPostId(null)}
                className="text-base-content/60 hover:text-base-content p-1.5 rounded-lg hover:bg-base-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {isActivePostLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
                </div>
              ) : activePost ? (
                <PostCard post={activePost} authUser={authUser} />
              ) : (
                <p className="text-base-content/40 text-center py-10">
                  해당 게시물이 삭제되었거나 권한이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
