import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await customFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "로그인에 실패했습니다.");
      }
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      router.replace("/(tabs)");
    },
    onError: (err: any) => {
      setErrorMsg(err.message);
    },
  });

  const handleLogin = () => {
    setErrorMsg("");
    if (!formData.username || !formData.password) {
      setErrorMsg("사용자 아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }
    loginMutate(formData);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#18191a]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo & Header */}
          <View className="items-center mb-8">
            <Ionicons name="logo-linkedin" size={64} color="#0a66c2" />
            <Text className="text-3xl font-bold text-white mt-4">LinkedIn</Text>
            <Text className="text-base text-gray-400 mt-1">로그인하여 계속 진행하세요</Text>
          </View>

          {/* Form Card */}
          <View className="bg-[#242526] p-6 rounded-2xl shadow-lg border border-[#3a3b3c]">
            <View>
              <Text className="text-sm font-medium text-gray-300 mb-2">사용자 아이디 (username)</Text>
              <TextInput
                className="w-full bg-[#3a3b3c] text-white px-4 py-3 rounded-lg border border-transparent focus:border-[#0a66c2] text-base"
                placeholder="Username"
                placeholderTextColor="#b0b3b8"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                autoCapitalize="none"
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-300 mb-2">비밀번호</Text>
              <TextInput
                className="w-full bg-[#3a3b3c] text-white px-4 py-3 rounded-lg border border-transparent focus:border-[#0a66c2] text-base"
                placeholder="••••••••"
                placeholderTextColor="#b0b3b8"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                autoCapitalize="none"
              />
            </View>

            {errorMsg ? (
              <View className="mt-4 bg-red-950/30 border border-red-900/50 p-3 rounded-lg flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#f87171" style={{ marginRight: 8 }} />
                <Text className="text-red-400 text-sm flex-1">{errorMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isPending}
              className="mt-6 bg-[#0a66c2] py-3.5 rounded-lg items-center justify-center active:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">로그인</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400 text-sm">계정이 없으신가요? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-[#0a66c2] font-semibold text-sm">회원가입하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
