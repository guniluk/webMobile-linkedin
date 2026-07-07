import { Platform } from "react-native";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";

const getApiUrl = () => {
  // Expo Go 개발 서버 주소에서 IP 추출
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:3000/api/v1`;
  }
  
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api/v1";
  }
  return "http://localhost:3000/api/v1";
};

export const API_URL = getApiUrl();

export const customFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // 401 Unauthorized인 경우 세션 만료 처리
    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    
    return response;
  } catch (error) {
    console.error("customFetch network error:", error);
    throw error;
  }
};
