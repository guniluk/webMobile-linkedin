import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../../lib/api";
import PostCard from "../../components/PostCard";
import PostCreationModal from "../../components/PostCreationModal";
import Avatar from "../../components/Avatar";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);

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

  // 2. Fetch Feed Posts
  const {
    data: posts,
    isLoading: isPostsLoading,
    isError: isPostsError,
    refetch: refetchPosts,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await customFetch("/post");
      if (!res.ok) throw new Error("피드 데이터를 가져오는데 실패했습니다.");
      return res.json();
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetchPosts();
    }, [refetchPosts])
  );

  return (
    <View className="flex-1 bg-[#18191a]">
      {/* Header / Post Creation Starter */}
      <View className="bg-[#242526] p-4 border-b border-[#3a3b3c] flex-row items-center space-x-5">
        <Avatar user={authUser} size={36} />
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-1 bg-[#3a3b3c] rounded-full px-4 py-2 justify-center"
        >
          <Text className="text-gray-400 text-sm">나누고 싶은 생각을 공유하세요...</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="p-1">
          <Ionicons name="image-outline" size={24} color="#0a66c2" />
        </TouchableOpacity>
      </View>

      {/* Posts Feed */}
      {isPostsLoading ? (
        <LoadingSpinner />
      ) : isPostsError ? (
        <View className="flex-1 justify-center items-center p-6 text-center">
          <Ionicons name="alert-circle-outline" size={48} color="#f87171" />
          <Text className="text-white font-bold text-lg mt-2">오류 발생</Text>
          <Text className="text-gray-400 text-xs text-center mt-1">
            피드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </Text>
          <TouchableOpacity
            onPress={() => refetchPosts()}
            className="mt-4 bg-[#0a66c2] px-4 py-2 rounded-full"
          >
            <Text className="text-white font-semibold text-sm">다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : posts?.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8 text-center">
          <Ionicons name="people-outline" size={64} color="#505050" />
          <Text className="text-white font-bold text-lg mt-3">표시할 피드가 없습니다</Text>
          <Text className="text-gray-400 text-xs text-center mt-1 max-w-[260px]">
            아직 아무도 포스팅하지 않았거나 1촌이 없습니다. 새로운 1촌을 맺어 소식을 받아보세요!
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PostCard post={item} authUser={authUser} />}
          contentContainerStyle={{ padding: 12 }}
          onRefresh={refetchPosts}
          refreshing={isRefetching}
        />
      )}

      {/* Post Creation Modal */}
      <PostCreationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        user={authUser}
      />
    </View>
  );
}
