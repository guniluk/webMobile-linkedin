import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../../lib/api";
import Avatar from "../../components/Avatar";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Notifications() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // 2. Fetch Notifications
  const {
    data: notifications,
    isLoading,
    refetch: refetchNotifications,
    isRefetching,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await customFetch("/notification");
      if (!res.ok) throw new Error("알림 데이터를 가져오는데 실패했습니다.");
      return res.json();
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetchNotifications();
    }, [refetchNotifications]),
  );

  // 3. Mark as Read Mutation
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (id: string) => {
      const res = await customFetch(`/notification/${id}/read`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("알림 읽음 처리 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // 4. Delete Notification Mutation
  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (id: string) => {
      const res = await customFetch(`/notification/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("알림 삭제 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.relatedPost) {
      const postId = notification.relatedPost._id || notification.relatedPost;
      router.push(`/post/${postId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <View className="bg-[#0a66c2]/10 p-2 rounded-full border border-[#0a66c2]/20">
            <Ionicons name="thumbs-up" size={18} color="#0a66c2" />
          </View>
        );
      case "comment":
        return (
          <View className="p-2 border rounded-full bg-emerald-500/10 border-emerald-500/20">
            <Ionicons name="chatbubble" size={18} color="#10b981" />
          </View>
        );
      case "connectionAccepted":
        return (
          <View className="p-2 border rounded-full bg-purple-500/10 border-purple-500/20">
            <Ionicons name="person-add" size={18} color="#a855f7" />
          </View>
        );
      default:
        return (
          <View className="bg-[#3a3b3c] p-2 rounded-full">
            <Ionicons name="notifications-outline" size={18} color="#a0a0a0" />
          </View>
        );
    }
  };

  const getNotificationText = (notification: any) => {
    const name = notification.relatedUser?.name || "누군가";
    switch (notification.type) {
      case "like":
        return `${name}님이 회원님의 게시글을 좋아합니다.`;
      case "comment":
        return `${name}님이 회원님의 게시글에 댓글을 달았습니다.`;
      case "connectionAccepted":
        return `${name}님과 1촌이 되었습니다!`;
      default:
        return "새로운 알림이 있습니다.";
    }
  };

  return (
    <View className="flex-1 bg-[#18191a]">
      {/* Header Info */}
      <View className="bg-[#242526] px-4 py-3 border-b border-[#3a3b3c] flex-row justify-between items-center">
        <Text className="text-xs text-gray-400">
          미확인 알림 {notifications?.filter((n: any) => !n.read).length || 0}개
        </Text>
      </View>

      {/* Notifications List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : notifications?.length === 0 ? (
        <View className="items-center justify-center flex-1 p-6 text-center">
          <Ionicons
            name="notifications-off-outline"
            size={64}
            color="#505050"
          />
          <Text className="mt-3 text-lg font-bold text-white">
            알림이 없습니다
          </Text>
          <Text className="mt-1 text-xs text-center text-gray-400">
            아직 새로운 활동이나 1촌 소식이 없습니다.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          onRefresh={refetchNotifications}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleNotificationClick(item)}
              className={`flex-row items-center justify-between p-4 border-b border-[#3a3b3c]/50 ${
                item.read
                  ? "bg-transparent"
                  : "bg-[#0a66c2]/5 border-l-4 border-[#0a66c2]"
              }`}
            >
              <View className="flex-row items-center flex-1 min-w-0 mr-2">
                {getNotificationIcon(item.type)}
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/profile/${item.relatedUser?.username}`)
                  }
                  className="ml-3 mr-8"
                >
                  <Avatar user={item.relatedUser} size={40} />
                </TouchableOpacity>
                <View className="flex-1 min-w-0">
                  <Text
                    className="text-xs leading-relaxed text-gray-200"
                    numberOfLines={2}
                  >
                    {getNotificationText(item)}
                  </Text>
                  <Text className="text-gray-500 text-[9px] mt-1 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center space-x-1">
                {item.relatedPost && (
                  <TouchableOpacity
                    onPress={() => handleNotificationClick(item)}
                    className="p-1.5"
                  >
                    <Ionicons name="eye-outline" size={16} color="#a0a0a0" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => deleteNotification(item._id)}
                  className="p-1.5"
                >
                  <Ionicons name="trash-outline" size={16} color="#f87171" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
