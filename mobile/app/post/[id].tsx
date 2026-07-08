import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import PostCard from "../../components/PostCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);

  // Fetch Post details
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await customFetch(`/post/${id}`);
      if (!res.ok) throw new Error("게시글을 불러오는데 실패했습니다.");
      return res.json();
    },
    enabled: !!id,
  });

  return (
    <View className="flex-1 bg-[#18191a]">

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <LoadingSpinner />
        </View>
      ) : isError || !post ? (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color="#e11d48" />
          <Text className="text-gray-900 font-bold text-lg mt-4">게시글을 찾을 수 없습니다</Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            삭제되었거나 권한이 없는 게시글일 수 있습니다.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-[#0a66c2] px-6 py-2.5 rounded-full"
          >
            <Text className="text-white font-bold">뒤로 가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
          <PostCard post={post} authUser={authUser} />
        </ScrollView>
      )}
    </View>
  );
}
