import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import Avatar from "../../components/Avatar";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function UserProfile() {
  const { username } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);

  const isOwnProfile = authUser?.username === username;

  // 1. Fetch Target User Profile
  const { data: profile, isLoading: isProfileLoading, isError } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await customFetch(`/user/profile/${username}`);
      if (!res.ok) throw new Error("프로필을 불러오는데 실패했습니다.");
      return res.json();
    },
    enabled: !!username,
  });

  // 2. Fetch Connection Status with Target User
  const { data: connStatus, isLoading: isConnStatusLoading } = useQuery({
    queryKey: ["connectionStatus", profile?._id],
    queryFn: async () => {
      const res = await customFetch(`/connection/status/${profile._id}`);
      if (!res.ok) throw new Error("연결 상태 조회 실패");
      return res.json();
    },
    enabled: !!profile && !isOwnProfile,
  });

  // Connection Request Mutations
  const { mutate: sendConnRequest, isPending: isSendingReq } = useMutation({
    mutationFn: async () => {
      const res = await customFetch(`/connection/request/${profile._id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("요청 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", profile._id] });
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  const { mutate: acceptConnRequest } = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await customFetch(`/connection/accept/${requestId}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("수락 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", profile._id] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  const { mutate: rejectConnRequest } = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await customFetch(`/connection/reject/${requestId}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("거절 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", profile._id] });
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  const { mutate: removeConn } = useMutation({
    mutationFn: async () => {
      const res = await customFetch(`/connection/${profile._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", profile._id] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  const handleDisconnect = () => {
    Alert.alert("1촌 끊기", "정말로 1촌을 끊으시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "끊기", style: "destructive", onPress: () => removeConn() },
    ]);
  };

  const renderConnectionButton = () => {
    if (isConnStatusLoading) {
      return (
        <ActivityIndicator size="small" color="#0a66c2" />
      );
    }

    const { status, requestId } = connStatus || {};

    switch (status) {
      case "connected":
        return (
          <TouchableOpacity
            onPress={handleDisconnect}
            className="bg-red-600/90 px-4 py-2.5 rounded-full flex-row items-center space-x-1.5 active:opacity-85 shadow-sm"
          >
            <Ionicons name="person-remove" size={14} color="white" />
            <Text className="text-white font-semibold text-xs">1촌 끊기</Text>
          </TouchableOpacity>
        );
      case "pending":
        return (
          <View className="bg-[#3a3b3c] px-4 py-2.5 rounded-full flex-row items-center space-x-1.5 border border-gray-600">
            <Ionicons name="time-outline" size={14} color="#a0a0a0" />
            <Text className="text-gray-400 font-semibold text-xs">요청 대기 중</Text>
          </View>
        );
      case "received":
        return (
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => acceptConnRequest(requestId)}
              className="bg-emerald-600 px-4 py-2.5 rounded-full flex-row items-center space-x-1.5 active:opacity-85 shadow-sm"
            >
              <Ionicons name="checkmark" size={14} color="white" />
              <Text className="text-white font-semibold text-xs">수락</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => rejectConnRequest(requestId)}
              className="bg-[#3a3b3c] px-4 py-2.5 rounded-full flex-row items-center space-x-1.5 active:opacity-85 border border-gray-600"
            >
              <Ionicons name="close" size={14} color="white" />
              <Text className="text-gray-300 font-semibold text-xs">거절</Text>
            </TouchableOpacity>
          </View>
        );
      case "not_connected":
      default:
        return (
          <TouchableOpacity
            onPress={() => sendConnRequest()}
            disabled={isSendingReq}
            className="bg-[#0a66c2] px-5 py-2.5 rounded-full flex-row items-center space-x-1.5 active:opacity-85 shadow-sm shadow-[#0a66c2]/20"
          >
            <Ionicons name="person-add" size={14} color="white" />
            <Text className="text-white font-semibold text-xs">
              {isSendingReq ? "전송 중" : "1촌 맺기"}
            </Text>
          </TouchableOpacity>
        );
    }
  };

  if (isProfileLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-[#18191a] p-6 text-center">
        <Ionicons name="close-circle-outline" size={64} color="#f87171" />
        <Text className="text-white font-bold text-lg mt-3">사용자를 찾을 수 없습니다</Text>
        <Text className="text-gray-400 text-xs text-center mt-1">
          요청하신 프로필을 찾을 수 없습니다. 올바른 주소인지 확인해주세요.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#18191a]" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 1. Header Card (Banner & Profile Details) */}
      <View className="bg-[#242526] border-b border-[#3a3b3c] pb-6">
        <View className="h-40 bg-slate-800 relative">
          <Image
            source={profile.bannerImg || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>

        <View className="px-5 relative">
          <View className="relative -mt-14 mb-3 inline-block w-28 h-28 rounded-full border-4 border-[#242526] bg-[#18191a] overflow-hidden shadow-md">
            <Avatar user={profile} size={104} />
          </View>

          <View className="flex-row justify-between items-start flex-wrap">
            <View className="flex-1 min-w-[200px]">
              <View className="flex-row items-center flex-wrap">
                <Text className="text-white font-extrabold text-xl mr-2">{profile.name}</Text>
                <Text className="text-gray-400 text-xs">@{profile.username}</Text>
              </View>
              <Text className="text-gray-200 text-sm mt-1">{profile.headline || "LinkedIn 회원"}</Text>
              <View className="flex-row items-center mt-2.5 space-x-1">
                <Ionicons name="location-outline" size={12} color="#a0a0a0" />
                <Text className="text-gray-400 text-xs">{profile.location || "위치 비공개"}</Text>
              </View>
              <Text className="text-[#0a66c2] text-xs font-bold mt-2">
                1촌 {profile.connections?.length || 0}명
              </Text>
            </View>

            <View className="mt-4 w-full items-end">
              {isOwnProfile ? (
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/profile")}
                  className="bg-[#3a3b3c] px-4 py-2 rounded-full border border-gray-600"
                >
                  <Text className="text-white font-semibold text-xs">내 프로필 편집</Text>
                </TouchableOpacity>
              ) : (
                renderConnectionButton()
              )}
            </View>
          </View>
        </View>
      </View>

      {/* 2. About Card */}
      <View className="bg-[#242526] border border-[#3a3b3c] mx-4 mt-4 p-5 rounded-2xl shadow-sm">
        <Text className="text-white font-bold text-base mb-3">소개</Text>
        <Text className="text-gray-300 text-sm leading-relaxed">
          {profile.about || "소개글이 없습니다."}
        </Text>
      </View>

      {/* 3. Experience Card */}
      <View className="bg-[#242526] border border-[#3a3b3c] mx-4 mt-4 p-5 rounded-2xl shadow-sm">
        <Text className="text-white font-bold text-base mb-4">경력</Text>
        {profile.experience?.length === 0 ? (
          <Text className="text-gray-500 text-xs py-2">등록된 경력이 없습니다.</Text>
        ) : (
          <View className="space-y-4">
            {profile.experience.map((exp: any) => (
              <View key={exp._id} className="flex-row items-start border-b border-[#3a3b3c]/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                <View className="bg-[#3a3b3c] p-2 rounded-lg justify-center items-center h-10 w-10 mr-3">
                  <Ionicons name="briefcase-outline" size={18} color="#a0a0a0" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-white text-sm font-semibold truncate">{exp.title}</Text>
                  <Text className="text-gray-300 text-xs mt-0.5">{exp.company}</Text>
                  <Text className="text-gray-500 text-[10px] mt-1">
                    {new Date(exp.startDate).toLocaleDateString()} ~{" "}
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "재직 중"}
                  </Text>
                  {exp.description ? (
                    <Text className="text-gray-400 text-xs mt-2 leading-relaxed">{exp.description}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 4. Education Card */}
      <View className="bg-[#242526] border border-[#3a3b3c] mx-4 mt-4 p-5 rounded-2xl shadow-sm">
        <Text className="text-white font-bold text-base mb-4">학력</Text>
        {profile.education?.length === 0 ? (
          <Text className="text-gray-500 text-xs py-2">등록된 학력이 없습니다.</Text>
        ) : (
          <View className="space-y-4">
            {profile.education.map((edu: any) => (
              <View key={edu._id} className="flex-row items-start border-b border-[#3a3b3c]/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                <View className="bg-[#3a3b3c] p-2 rounded-lg justify-center items-center h-10 w-10 mr-3">
                  <Ionicons name="school-outline" size={18} color="#a0a0a0" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-white text-sm font-semibold truncate">{edu.school}</Text>
                  <Text className="text-gray-300 text-xs mt-0.5">{edu.fieldOfStudy}</Text>
                  <Text className="text-gray-500 text-[10px] mt-1">
                    {edu.startYear}년 ~ {edu.endYear || "재학 중"}년
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 5. Skills Card */}
      <View className="bg-[#242526] border border-[#3a3b3c] mx-4 mt-4 mb-6 p-5 rounded-2xl shadow-sm">
        <Text className="text-white font-bold text-base mb-4">기술 및 역량</Text>
        {profile.skills?.length === 0 ? (
          <Text className="text-gray-500 text-xs py-2">등록된 기술이 없습니다.</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {profile.skills.map((skill: string, index: number) => (
              <View key={index} className="bg-[#3a3b3c] px-3.5 py-2 rounded-full border border-gray-600">
                <Text className="text-gray-200 text-xs font-medium">{skill}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
