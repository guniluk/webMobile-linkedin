import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../lib/api";
import Avatar from "./Avatar";

const formatCommentDate = (dateString: string) => {
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

interface CommentSectionProps {
  post: any;
  authUser: any;
}

export default function CommentSection({ post, authUser }: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: addComment, isPending: isAdding } = useMutation({
    mutationFn: async (content: string) => {
      const res = await customFetch(`/post/${post._id}/comment`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        throw new Error("댓글 작성 실패");
      }
      return res.json();
    },
    onSuccess: (updatedPost: any) => {
      setCommentText("");
      queryClient.setQueryData<any[]>(["posts"], (oldPosts) => {
        if (!oldPosts) return [];
        return oldPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p));
      });
      queryClient.setQueryData(["post", post._id], updatedPost);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
    },
    onError: (err: any) => {
      Alert.alert("오류", err.message || "에러가 발생했습니다.");
    },
  });

  const { mutate: removeComment } = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await customFetch(`/post/${post._id}/comment/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("댓글 삭제 실패");
      }
      return res.json();
    },
    onSuccess: (updatedPost: any) => {
      queryClient.setQueryData<any[]>(["posts"], (oldPosts) => {
        if (!oldPosts) return [];
        return oldPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p));
      });
      queryClient.setQueryData(["post", post._id], updatedPost);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
    },
    onError: (err: any) => {
      Alert.alert("오류", err.message || "에러가 발생했습니다.");
    },
  });

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    addComment(commentText);
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert("댓글 삭제", "정말로 이 댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => removeComment(commentId) },
    ]);
  };

  return (
    <View className="mt-4 pt-4 border-t border-[#3a3b3c]">
      {/* Comment Form */}
      <View className="flex-row items-center mb-4 space-x-4">
        <Avatar user={authUser} size={32} />
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor="#b0b3b8"
          className="flex-1 bg-[#3a3b3c] text-white px-3 py-2 rounded-lg text-sm"
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isAdding || !commentText.trim()}
          className="bg-[#0a66c2] p-2 rounded-lg items-center justify-center disabled:opacity-50"
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* Comment List */}
      <View className="space-y-3">
        {post.comments?.length === 0 ? (
          <Text className="text-gray-500 text-xs text-center py-2">
            첫 번째 댓글을 남겨보세요.
          </Text>
        ) : (
          post.comments.map((comment: any) => {
            const isCommentAuthor =
              comment.user?._id?.toString() === authUser?._id?.toString();
            const isPostAuthor =
              post.author?._id?.toString() === authUser?._id?.toString();

            return (
              <View
                key={comment._id}
                className="flex-row items-start p-3 rounded-lg bg-[#242526] border border-[#3a3b3c]/40 mb-2"
              >
                <TouchableOpacity onPress={() => router.push(`/profile/${comment.user?.username}`)}>
                  <Avatar user={comment.user} size={32} className="mr-8" />
                </TouchableOpacity>

                <View className="flex-1 min-w-0">
                  <View className="flex-row justify-between items-center mb-1">
                    <View className="flex-row items-center flex-wrap">
                      <TouchableOpacity onPress={() => router.push(`/profile/${comment.user?.username}`)}>
                        <Text className="text-white text-xs font-semibold hover:text-[#0a66c2]">
                          {comment.user?.name}
                        </Text>
                      </TouchableOpacity>
                      <Text className="text-gray-500 text-[10px] mx-1.5">•</Text>
                      <Text className="text-gray-500 text-[10px]">
                        {formatCommentDate(comment.createdAt)}
                      </Text>
                    </View>

                    {(isCommentAuthor || isPostAuthor) && (
                      <TouchableOpacity
                        onPress={() => handleDeleteComment(comment._id)}
                        className="p-1"
                      >
                        <Ionicons name="trash-outline" size={14} color="#f87171" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="text-gray-300 text-xs leading-relaxed">
                    {comment.content}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
