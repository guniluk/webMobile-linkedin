import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, Alert, ScrollView, Platform } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../../lib/api";
import PostCard from "../../components/PostCard";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../../components/Avatar";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Notifications() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // 1. Fetch Current User
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await customFetch("/auth/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  // 2. Fetch Notifications
  const { data: notifications, isLoading, refetch: refetchNotifications, isRefetching } = useQuery({
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
    }, [refetchNotifications])
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

  // 5. Fetch Active Post for Modal
  const { data: activePost, isLoading: isActivePostLoading } = useQuery({
    queryKey: ["activePost", selectedPostId],
    queryFn: async () => {
      if (!selectedPostId) return null;
      const res = await customFetch(`/post/${selectedPostId}`);
      if (!res.ok) throw new Error("포스트 상세 조회 실패");
      return res.json();
    },
    enabled: !!selectedPostId,
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.relatedPost) {
      const postId = notification.relatedPost._id || notification.relatedPost;
      setSelectedPostId(postId);
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
          <View className="bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20">
            <Ionicons name="chatbubble" size={18} color="#10b981" />
          </View>
        );
      case "connectionAccepted":
        return (
          <View className="bg-purple-500/10 p-2 rounded-full border border-purple-500/20">
            <Ionicons name="person-add" size={18} color="#a855f7" />
          </View>
        );
      default:
        return (
          <View className="bg-[#3a3b3c] p-2 rounded-full">
            <Ionicons name="bell" size={18} color="#a0a0a0" />
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
        <Text className="text-gray-400 text-xs">
          미확인 알림 {notifications?.filter((n: any) => !n.read).length || 0}개
        </Text>
      </View>

      {/* Notifications List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : notifications?.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6 text-center">
          <Ionicons name="notifications-off-outline" size={64} color="#505050" />
          <Text className="text-white font-bold text-lg mt-3">알림이 없습니다</Text>
          <Text className="text-gray-400 text-xs text-center mt-1">
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
                item.read ? "bg-transparent" : "bg-[#0a66c2]/5 border-l-4 border-[#0a66c2]"
              }`}
            >
              <View className="flex-row items-center flex-1 min-w-0 mr-2">
                {getNotificationIcon(item.type)}
                <TouchableOpacity
                  onPress={() => router.push(`/profile/${item.relatedUser?.username}`)}
                  className="mx-3"
                >
                  <Avatar user={item.relatedUser} size={40} />
                </TouchableOpacity>
                <View className="flex-1 min-w-0">
                  <Text className="text-gray-200 text-xs leading-relaxed" numberOfLines={2}>
                    {getNotificationText(item)}
                  </Text>
                  <Text className="text-gray-500 text-[9px] mt-1 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View className="flex-row space-x-1 items-center">
                {item.relatedPost && (
                  <TouchableOpacity onPress={() => handleNotificationClick(item)} className="p-1.5">
                    <Ionicons name="eye-outline" size={16} color="#a0a0a0" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteNotification(item._id)} className="p-1.5">
                  <Ionicons name="trash-outline" size={16} color="#f87171" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Related Post Modal */}
      <Modal visible={!!selectedPostId} animationType="slide" transparent={false}>
        <SafeAreaView className="flex-1 bg-[#1c1d1f]" edges={["bottom"]}>
          {/* Status Bar Spacer */}
          <View style={{ height: Platform.OS === "ios" ? 52 : 32, backgroundColor: "#1c1d1f" }} />

          {/* Modal Header */}
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-[#2d2e30] bg-[#1c1d1f]">
            <TouchableOpacity onPress={() => setSelectedPostId(null)} className="py-1 px-2">
              <Text className="text-gray-400 text-base font-medium">닫기</Text>
            </TouchableOpacity>
            <Text className="text-white font-bold text-lg">관련 게시물</Text>
            <View className="w-10" />
          </View>

          {/* Modal Content - Scrollable for long posts & comments */}
          <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {isActivePostLoading ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#0a66c2" />
              </View>
            ) : activePost ? (
              <PostCard post={activePost} authUser={authUser} />
            ) : (
              <Text className="text-gray-400 text-center mt-10">
                게시물이 삭제되었거나 권한이 없습니다.
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
