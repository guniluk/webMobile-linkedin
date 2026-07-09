import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "../../lib/api";

export default function TabsLayout() {
  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => {
      const res = await customFetch("/connection/requests");
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000, // 15초마다 1촌 요청 수량 갱신하여 탭 배지 최신화
  });

  const requestCount = connectionRequests?.length || 0;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#18191a",
          borderTopColor: "#3a3b3c",
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: "#0a66c2",
        tabBarInactiveTintColor: "#a0a0a0",
        headerStyle: {
          backgroundColor: "#18191a",
          borderBottomWidth: 1,
          borderBottomColor: "#3a3b3c",
        },
        headerTitleStyle: {
          color: "white",
          fontWeight: "bold",
        },
        headerTintColor: "white",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          headerTitle: "LinkedIn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: "인맥",
          headerTitle: "인맥 관리",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          tabBarBadge: requestCount > 0 ? requestCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#e11d48",
            color: "white",
            fontSize: 10,
            lineHeight: 14,
          },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "알림",
          headerTitle: "알림",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          headerTitle: "내 프로필",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
