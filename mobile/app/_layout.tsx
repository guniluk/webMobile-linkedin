import { useEffect } from "react";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import "../global.css";

const queryClient = new QueryClient();

function AuthProtection() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    const performNavigation = () => {
      if (!token && !inAuthGroup) {
        router.replace("/(auth)/login");
      } else if (token && inAuthGroup) {
        router.replace("/(tabs)");
      }
    };

    const timer = setTimeout(performNavigation, 1);
    return () => clearTimeout(timer);
  }, [token, hasHydrated, segments, router, rootNavigationState]);

  return null;
}

export default function RootLayout() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <AuthProtection />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: "Back" }} />
        <Stack.Screen
        name="profile/[username]"
        options={{
          headerShown: true,
          title: "프로필",
          headerTransparent: true,
          headerBackTitle: "Back",
          headerBackTitleVisible: true,
          headerStyle: {
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            color: "white",
            fontWeight: "bold",
          },
          headerTintColor: "white",
          contentStyle: {
            backgroundColor: "#18191a",
          },
        }}
      />
      </Stack>

      {!hasHydrated && (
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "center", alignItems: "center", backgroundColor: "#18191a", zIndex: 999 }}>
          <ActivityIndicator size="large" color="#0a66c2" />
        </View>
      )}
    </QueryClientProvider>
  );
}

