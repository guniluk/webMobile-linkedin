import { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../../lib/api";
import Avatar from "../../components/Avatar";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Network() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // 1. Fetch My Connections
  const { data: connections, isLoading: isConnLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await customFetch("/connection");
      if (!res.ok) throw new Error("1촌 목록을 가져오는데 실패했습니다.");
      return res.json();
    },
  });

  // 2. Fetch Connection Requests (Incoming)
  const { data: connectionRequests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => {
      const res = await customFetch("/connection/requests");
      if (!res.ok) throw new Error("1촌 요청을 가져오는데 실패했습니다.");
      return res.json();
    },
  });

  // 3. Fetch Suggested Connections
  const { data: suggestedUsers, isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ["suggestedConnections"],
    queryFn: async () => {
      const res = await customFetch("/user/suggestions");
      if (!res.ok) throw new Error("추천 친구를 가져오는데 실패했습니다.");
      return res.json();
    },
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedConnections"] });
    }, [queryClient])
  );

  // Mutations
  const { mutate: acceptRequest } = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await customFetch(`/connection/accept/${requestId}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("수락 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedConnections"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  const { mutate: rejectRequest } = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await customFetch(`/connection/reject/${requestId}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("거절 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  const { mutate: removeConn } = useMutation({
    mutationFn: async (userId: string) => {
      const res = await customFetch(`/connection/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("1촌 끊기 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  const { mutate: sendRequest, variables: pendingSendId } = useMutation({
    mutationFn: async (userId: string) => {
      const res = await customFetch(`/connection/request/${userId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("요청 전송 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestedConnections"] });
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  const handleDisconnect = (userId: string, name: string) => {
    Alert.alert("1촌 끊기", `${name}님과 1촌을 끊으시겠습니까?`, [
      { text: "취소", style: "cancel" },
      { text: "끊기", style: "destructive", onPress: () => removeConn(userId) },
    ]);
  };

  const isLoadingAll = isConnLoading && isRequestsLoading && isSuggestionsLoading;

  if (isLoadingAll) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView className="flex-1 bg-[#18191a]" contentContainerStyle={{ paddingBottom: 30 }}>
      {/* 1. Connection Requests Section */}
      {connectionRequests && connectionRequests.length > 0 && (
        <View className="bg-[#242526] p-4 border-b border-[#3a3b3c] mb-3">
          <Text className="text-white font-bold text-sm mb-3">
            받은 1촌 요청 ({connectionRequests.length})
          </Text>
          <View className="space-y-3">
            {connectionRequests.map((req: any) => (
              <View
                key={req._id}
                className="bg-[#18191a] border border-[#3a3b3c]/50 p-3 rounded-xl flex-row justify-between items-center mb-2"
              >
                <TouchableOpacity
                  onPress={() => router.push(`/profile/${req.sender?.username}`)}
                  className="flex-row items-center flex-1 min-w-0"
                >
                  <Avatar user={req.sender} size={40} className="mr-2.5" />
                  <View className="flex-1 min-w-0">
                    <Text className="text-white text-xs font-bold truncate">
                      {req.sender?.name}
                    </Text>
                    <Text className="text-gray-400 text-[10px] truncate">
                      {req.sender?.headline || "LinkedIn 회원"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View className="flex-row space-x-1.5 ml-2">
                  <TouchableOpacity
                    onPress={() => acceptRequest(req._id)}
                    className="bg-emerald-600 px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-white text-[11px] font-semibold">수락</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => rejectRequest(req._id)}
                    className="bg-[#3a3b3c] px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-gray-300 text-[11px] font-semibold">거절</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 2. Suggested Connections Section */}
      {suggestedUsers && suggestedUsers.length > 0 && (
        <View className="bg-[#242526] p-4 border-b border-[#3a3b3c] mb-3">
          <Text className="text-white font-bold text-sm mb-3">인맥 추천</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-3 mb-2">
            {suggestedUsers.map((user: any) => (
              <View
                key={user._id}
                className="bg-[#18191a] border border-[#3a3b3c]/50 p-3 rounded-xl items-center w-36 mr-3"
              >
                <TouchableOpacity onPress={() => router.push(`/profile/${user.username}`)}>
                  <Avatar user={user} size={56} className="mb-2" />
                </TouchableOpacity>
                <Text className="text-white text-xs font-bold truncate w-full text-center" numberOfLines={1}>
                  {user.name}
                </Text>
                <Text className="text-gray-400 text-[9px] text-center h-7 mt-0.5 truncate w-full" numberOfLines={2}>
                  {user.headline || "LinkedIn 회원"}
                </Text>
                <TouchableOpacity
                  onPress={() => sendRequest(user._id)}
                  disabled={pendingSendId === user._id}
                  className="bg-transparent border border-[#0a66c2] px-3 py-1 mt-2.5 rounded-full w-full items-center"
                >
                  <Text className="text-[#0a66c2] text-[10px] font-bold">1촌 맺기</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 3. My Connections List */}
      <View className="bg-[#242526] p-4">
        <Text className="text-white font-bold text-sm mb-3">
          내 1촌 목록 ({connections?.length || 0})
        </Text>
        {connections?.length === 0 ? (
          <View className="py-8 items-center justify-center">
            <Ionicons name="people-outline" size={40} color="#808080" />
            <Text className="text-gray-400 text-xs mt-2">아직 1촌이 없습니다.</Text>
          </View>
        ) : (
          connections?.map((conn: any) => (
            <View
              key={conn._id}
              className="flex-row justify-between items-center py-2.5 border-b border-[#3a3b3c]/50"
            >
              <TouchableOpacity
                onPress={() => router.push(`/profile/${conn.username}`)}
                className="flex-row items-center flex-1 min-w-0"
              >
                <Avatar user={conn} size={44} className="mr-3" />
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center flex-wrap">
                    <Text className="text-white text-xs font-semibold truncate mr-2">
                      {conn.name}
                    </Text>
                    <Text className="text-[9px] text-[#0a66c2] bg-[#0a66c2]/10 px-1 py-0.25 rounded font-bold">
                      1촌
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-[10px] truncate mt-0.5">
                    {conn.headline || "LinkedIn 회원"}
                  </Text>
                </View>
              </TouchableOpacity>

              <View className="flex-row space-x-2 ml-2">
                <TouchableOpacity
                  onPress={() => router.push(`/profile/${conn.username}`)}
                  className="bg-[#3a3b3c] p-2 rounded-full"
                >
                  <Ionicons name="eye-outline" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDisconnect(conn._id, conn.name)}
                  className="bg-[#3a3b3c] p-2 rounded-full"
                >
                  <Ionicons name="person-remove-outline" size={16} color="#f87171" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
