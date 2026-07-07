import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: signupMutate, isPending } = useMutation({
    mutationFn: async (userData) => {
      const res = await customFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "회원가입에 실패했습니다.");
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

  const handleSignup = () => {
    setErrorMsg("");

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setErrorMsg("모든 필드를 입력해 주세요.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMsg("유효한 이메일 주소를 입력해 주세요.");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    signupMutate(formData);
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
            <Text className="text-3xl font-bold text-white mt-4">LinkedIn 가입하기</Text>
            <Text className="text-base text-gray-400 mt-1">커리어를 쌓기 위한 첫 단계</Text>
          </View>

          {/* Form Card */}
          <View className="bg-[#242526] p-6 rounded-2xl shadow-lg border border-[#3a3b3c] space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-300 mb-2">이름</Text>
              <TextInput
                className="w-full bg-[#3a3b3c] text-white px-4 py-3 rounded-lg border border-transparent focus:border-[#0a66c2] text-base"
                placeholder="홍길동"
                placeholderTextColor="#b0b3b8"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View className="mt-3">
              <Text className="text-sm font-medium text-gray-300 mb-2">사용자 아이디 (username)</Text>
              <TextInput
                className="w-full bg-[#3a3b3c] text-white px-4 py-3 rounded-lg border border-transparent focus:border-[#0a66c2] text-base"
                placeholder="yourusername"
                placeholderTextColor="#b0b3b8"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                autoCapitalize="none"
              />
            </View>

            <View className="mt-3">
              <Text className="text-sm font-medium text-gray-300 mb-2">이메일 주소</Text>
              <TextInput
                className="w-full bg-[#3a3b3c] text-white px-4 py-3 rounded-lg border border-transparent focus:border-[#0a66c2] text-base"
                placeholder="username@example.com"
                placeholderTextColor="#b0b3b8"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mt-3">
              <Text className="text-sm font-medium text-gray-300 mb-2">비밀번호 (6자 이상)</Text>
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
              onPress={handleSignup}
              disabled={isPending}
              className="mt-6 bg-[#0a66c2] py-3.5 rounded-lg items-center justify-center active:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">동의 및 가입하기</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400 text-sm">이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-[#0a66c2] font-semibold text-sm">로그인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
