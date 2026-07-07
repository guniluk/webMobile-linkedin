import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
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
