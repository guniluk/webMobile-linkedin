import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "./Avatar";

interface PostCreationModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
}

export default function PostCreationModal({ visible, onClose, user }: PostCreationModalProps) {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate: publishPost, isPending } = useMutation({
    mutationFn: async (postData: { content: string; image: string | null }) => {
      const res = await customFetch("/post/create", {
        method: "POST",
        body: JSON.stringify(postData),
      });
      if (!res.ok) {
        throw new Error("포스트 생성에 실패했습니다.");
      }
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onClose();
    },
    onError: (err: any) => {
      Alert.alert("오류", err.message || "에러가 발생했습니다.");
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setImagePreview(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (!content.trim() && !imagePreview) return;
    publishPost({
      content,
      image: imagePreview,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-[#1c1d1f]" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-[#2d2e30] bg-[#1c1d1f]">
            <TouchableOpacity onPress={onClose} className="py-1 px-2">
              <Text className="text-gray-400 text-base font-medium">취소</Text>
            </TouchableOpacity>
            <Text className="text-white font-bold text-lg">게시물 작성</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending || (!content.trim() && !imagePreview)}
              className="bg-[#0a66c2] px-5 py-2 rounded-full disabled:opacity-40 active:opacity-80"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-sm">게시</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 pt-5" keyboardShouldPersistTaps="handled">
            {/* User Info & Visibility Badge */}
            <View className="flex-row items-center mb-6">
              <Avatar user={user} size={48} className="mr-3.5 border border-gray-600" />
              <View>
                <Text className="text-white font-extrabold text-base">{user?.name}</Text>
                {/* Visibility Badge */}
                <TouchableOpacity className="flex-row items-center bg-[#2d2e30] px-2.5 py-1 rounded-full mt-1 border border-gray-600/40">
                  <Ionicons name="earth" size={12} color="#808080" />
                  <Text className="text-gray-300 text-[10px] font-bold mx-1">누구나 공개</Text>
                  <Ionicons name="chevron-down" size={10} color="#808080" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Area */}
            <TextInput
              multiline
              value={content}
              onChangeText={setContent}
              placeholder="나누고 싶은 커리어 소식, 아이디어가 있으신가요?"
              placeholderTextColor="#808080"
              className="w-full text-white text-base outline-none min-h-[160px] text-left align-top leading-relaxed"
              style={{ textAlignVertical: "top" }}
            />

            {/* Image Preview */}
            {imagePreview && (
              <View className="relative mt-4 rounded-2xl overflow-hidden border border-[#2d2e30] bg-black mb-8">
                <Image source={imagePreview} style={{ width: "100%", height: 260 }} contentFit="contain" />
                <TouchableOpacity
                  onPress={handleRemoveImage}
                  className="absolute top-3 right-3 bg-black/70 p-2 rounded-full border border-gray-600"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Premium Bottom Toolbar */}
          <View className="border-t border-[#2d2e30] p-4 bg-[#242526]">
            <Text className="text-gray-400 text-xs font-semibold mb-3">게시물에 추가</Text>
            <View className="flex-row items-center justify-between">
              {/* Media Button */}
              <TouchableOpacity
                onPress={pickImage}
                className="flex-row items-center space-x-2 bg-[#2d2e30] px-4 py-2.5 rounded-full border border-gray-600/50"
              >
                <Ionicons name="image-outline" size={20} color="#0a66c2" />
                <Text className="text-gray-200 text-sm font-semibold">사진</Text>
              </TouchableOpacity>

              {/* Extra Dummy Icons for Design Completeness */}
              <View className="flex-row space-x-4">
                <TouchableOpacity className="p-2 bg-[#2d2e30] rounded-full border border-gray-600/30">
                  <Ionicons name="camera-outline" size={20} color="#808080" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-[#2d2e30] rounded-full border border-gray-600/30">
                  <Ionicons name="videocam-outline" size={20} color="#808080" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-[#2d2e30] rounded-full border border-gray-600/30">
                  <Ionicons name="bar-chart-outline" size={20} color="#808080" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-[#2d2e30] rounded-full border border-gray-600/30">
                  <Ionicons name="ellipsis-horizontal-outline" size={20} color="#808080" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
