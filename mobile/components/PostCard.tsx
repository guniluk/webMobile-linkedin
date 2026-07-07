import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Share } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../lib/api";
import CommentSection from "./CommentSection";
import Avatar from "./Avatar";

const formatPostDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHr < 24) return `${diffHr}시간 전`;
  return `${diffDay}일 전`;
};

interface PostCardProps {
  post: any;
  authUser: any;
}

export default function PostCard({ post, authUser }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const isAuthor = post.author?._id?.toString() === authUser?._id?.toString();
  const isLiked = post.likes?.includes(authUser?._id);

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await customFetch(`/post/${post._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("포스트 삭제 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err: any) => {
      Alert.alert("오류", err.message || "오류가 발생했습니다.");
    },
  });

  const { mutate: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await customFetch(`/post/${post._id}/likeUnlike`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("좋아요 변경 실패");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err: any) => {
      Alert.alert("오류", err.message || "오류가 발생했습니다.");
    },
  });

  const handleDelete = () => {
    Alert.alert("포스트 삭제", "정말로 이 포스트를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => deletePost() },
    ]);
  };

  const handleShare = async () => {
    try {
      const authorName = post.author?.name || "LinkedIn 회원";
      const message = `[LinkedIn] ${authorName}님의 게시글:\n\n${post.content}\n\n더 많은 내용 보기: http://localhost:5173/profile/${post.author?.username}`;
      await Share.share({ message });
    } catch (error) {
      console.log("Error sharing: ", error);
    }
  };

  return (
    <View className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-4 mb-4 shadow-sm">
      {/* Post Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center flex-1 min-w-0">
          <TouchableOpacity onPress={() => router.push(`/profile/${post.author?.username}`)}>
            <Avatar user={post.author} size={44} className="mr-3" />
          </TouchableOpacity>
          <View className="flex-1 min-w-0">
            <TouchableOpacity onPress={() => router.push(`/profile/${post.author?.username}`)}>
              <Text className="text-white text-sm font-semibold hover:text-[#0a66c2] truncate">
                {post.author?.name}
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-400 text-xs truncate">
              {post.author?.headline || "LinkedIn 회원"}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-500 text-[10px] font-medium mr-1.5">
                {formatPostDate(post.createdAt)}
              </Text>
              <Ionicons name="globe-outline" size={10} color="#808080" />
            </View>
          </View>
        </View>

        {isAuthor && (
          <TouchableOpacity onPress={handleDelete} disabled={isDeleting} className="p-1">
            {isDeleting ? (
              <ActivityIndicator size="small" color="#808080" />
            ) : (
              <Ionicons name="trash-outline" size={18} color="#f87171" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Post Content */}
      <Text className="text-gray-200 text-sm leading-relaxed mb-3">
        {post.content}
      </Text>

      {/* Post Image */}
      {post.image && (
        <View className="rounded-lg overflow-hidden border border-[#3a3b3c] max-h-80 mb-3 bg-black">
          <Image
            source={post.image}
            style={{ width: "100%", height: 320 }}
            contentFit="cover"
          />
        </View>
      )}

      {/* Post Stats */}
      <View className="flex-row justify-between items-center text-xs text-gray-400 pb-3 border-b border-[#3a3b3c]">
        <View className="flex-row items-center">
          <View className="bg-[#0a66c2] p-1 rounded-full w-4.5 h-4.5 justify-center items-center mr-1">
            <Ionicons name="thumbs-up" size={10} color="white" />
          </View>
          <Text className="text-gray-400 text-xs">{post.likes?.length || 0}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowComments(!showComments)}>
          <Text className="text-gray-400 text-xs">댓글 {post.comments?.length || 0}개</Text>
        </TouchableOpacity>
      </View>

      {/* Post Actions */}
      <View className="flex-row justify-around items-center pt-2">
        <TouchableOpacity
          onPress={() => toggleLike()}
          disabled={isLiking}
          className="flex-row items-center py-2 px-3 space-x-1.5"
        >
          <Ionicons
            name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
            size={18}
            color={isLiked ? "#0a66c2" : "#a0a0a0"}
          />
          <Text className={`text-xs font-semibold ${isLiked ? "text-[#0a66c2]" : "text-gray-400"}`}>
            좋아요
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowComments(!showComments)}
          className="flex-row items-center py-2 px-3 space-x-1.5"
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={showComments ? "#0a66c2" : "#a0a0a0"}
          />
          <Text className={`text-xs font-semibold ${showComments ? "text-[#0a66c2]" : "text-gray-400"}`}>
            댓글
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          className="flex-row items-center py-2 px-3 space-x-1.5"
        >
          <Ionicons name="share-social-outline" size={18} color="#a0a0a0" />
          <Text className="text-gray-400 text-xs font-semibold">공유</Text>
        </TouchableOpacity>
      </View>

      {/* Comment Section */}
      {showComments && <CommentSection post={post} authUser={authUser} />}
    </View>
  );
}
