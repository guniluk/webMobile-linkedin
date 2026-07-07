import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { customFetch } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import Avatar from "../../components/Avatar";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function MyProfile() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const authUser = useAuthStore((state) => state.user);

  // Modal states
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);

  // Form states
  const [infoForm, setInfoForm] = useState({ name: "", headline: "", location: "" });
  const [aboutForm, setAboutForm] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [expForm, setExpForm] = useState({
    title: "",
    company: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [eduForm, setEduForm] = useState({
    school: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
  });

  // 1. Fetch Target User Profile (Self)
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile", authUser?.username],
    queryFn: async () => {
      const res = await customFetch(`/user/profile/${authUser?.username}`);
      if (!res.ok) throw new Error("프로필을 불러오는데 실패했습니다.");
      return res.json();
    },
    enabled: !!authUser?.username,
  });

  // 2. Profile Update Mutation
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await customFetch("/user/profile", {
        method: "PUT",
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "프로필 업데이트 실패");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", authUser?.username] });
      queryClient.setQueryData(["authUser"], data);
      setIsInfoModalOpen(false);
      setIsAboutModalOpen(false);
      setIsExpModalOpen(false);
      setIsEduModalOpen(false);
    },
    onError: (err: any) => Alert.alert("오류", err.message),
  });

  // Image Upload handler (Base64 via ImagePicker)
  const handleImagePick = async (field: "profilePicture" | "bannerImg") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진첩 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      const base64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
      updateProfile({ [field]: base64Data });
    }
  };

  // Open & Init Modals
  const openInfoModal = () => {
    setInfoForm({
      name: profile?.name || "",
      headline: profile?.headline || "",
      location: profile?.location || "",
    });
    setIsInfoModalOpen(true);
  };

  const openAboutModal = () => {
    setAboutForm(profile?.about || "");
    setIsAboutModalOpen(true);
  };

  // Experience handlers
  const handleAddExperience = () => {
    if (!expForm.title || !expForm.company || !expForm.startDate) {
      Alert.alert("알림", "직무, 회사명, 시작일은 필수 입력 항목입니다.");
      return;
    }
    const updatedExp = [...(profile?.experience || []), expForm];
    updateProfile({ experience: updatedExp });
    setExpForm({ title: "", company: "", description: "", startDate: "", endDate: "" });
  };

  const handleRemoveExperience = (expId: string) => {
    Alert.alert("경력 삭제", "이 경력을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          const updatedExp = profile.experience.filter((exp: any) => exp._id !== expId);
          updateProfile({ experience: updatedExp });
        },
      },
    ]);
  };

  // Education handlers
  const handleAddEducation = () => {
    if (!eduForm.school || !eduForm.fieldOfStudy || !eduForm.startYear) {
      Alert.alert("알림", "학교명, 전공, 입학년도는 필수 입력 항목입니다.");
      return;
    }
    const updatedEdu = [...(profile?.education || []), eduForm];
    updateProfile({ education: updatedEdu });
    setEduForm({ school: "", fieldOfStudy: "", startYear: "", endYear: "" });
  };

  const handleRemoveEducation = (eduId: string) => {
    Alert.alert("학력 삭제", "이 학력을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          const updatedEdu = profile.education.filter((edu: any) => edu._id !== eduId);
          updateProfile({ education: updatedEdu });
        },
      },
    ]);
  };

  // Skill handlers
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (profile?.skills?.includes(newSkill.trim())) {
      setNewSkill("");
      return;
    }
    const updatedSkills = [...(profile?.skills || []), newSkill.trim()];
    updateProfile({ skills: updatedSkills });
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = profile.skills.filter((s: string) => s !== skillToRemove);
    updateProfile({ skills: updatedSkills });
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          clearAuth();
          queryClient.clear();
        },
      },
    ]);
  };

  if (isProfileLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView className="flex-1 bg-[#18191a]" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 1. Header Card (Banner, Avatar, Meta, Logout) */}
      <View className="bg-[#242526] border-b border-[#3a3b3c] pb-5">
        {/* Banner */}
        <TouchableOpacity onPress={() => handleImagePick("bannerImg")} className="h-40 bg-slate-800 bg-center bg-cover relative">
          <Image
            source={profile?.bannerImg || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
          <View className="absolute top-3 right-3 bg-black/60 p-2 rounded-full border border-gray-600">
            <Ionicons name="camera-outline" size={16} color="white" />
          </View>
        </TouchableOpacity>

        {/* Profile Info Area */}
        <View className="px-5 relative">
          {/* Avatar */}
          <TouchableOpacity
            onPress={() => handleImagePick("profilePicture")}
            className="relative -mt-14 mb-3 inline-block w-28 h-28 rounded-full border-4 border-[#242526] bg-[#18191a] overflow-hidden"
          >
            <Avatar user={profile} size={104} />
            <View className="absolute bottom-1 right-1 bg-[#0a66c2] p-1.5 rounded-full border border-white">
              <Ionicons name="camera-outline" size={12} color="white" />
            </View>
          </TouchableOpacity>

          <View className="flex-row justify-between items-start flex-wrap">
            <View className="flex-1 min-w-[200px]">
              <View className="flex-row items-center flex-wrap">
                <Text className="text-white font-extrabold text-xl mr-2">{profile?.name}</Text>
                <Text className="text-gray-400 text-xs">@{profile?.username}</Text>
              </View>
              <Text className="text-gray-200 text-sm mt-1">{profile?.headline || "LinkedIn 회원"}</Text>
              <View className="flex-row items-center mt-2.5 space-x-1">
                <Ionicons name="location-outline" size={12} color="#a0a0a0" />
                <Text className="text-gray-400 text-xs">{profile?.location || "위치 비공개"}</Text>
              </View>
              <Text className="text-[#0a66c2] text-xs font-bold mt-2">
                1촌 {profile?.connections?.length || 0}명
              </Text>
            </View>

            <View className="flex-row space-x-2 mt-3 w-full justify-end">
              <TouchableOpacity
                onPress={openInfoModal}
                className="bg-[#0a66c2]/10 border border-[#0a66c2]/30 px-4 py-2 rounded-full flex-row items-center space-x-1.5"
              >
                <Ionicons name="create-outline" size={14} color="#0a66c2" />
                <Text className="text-[#0a66c2] font-semibold text-xs">정보 수정</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-950/20 border border-red-900/40 px-4 py-2 rounded-full flex-row items-center space-x-1.5"
              >
                <Ionicons name="log-out-outline" size={14} color="#f87171" />
                <Text className="text-[#f87171] font-semibold text-xs">로그아웃</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* 2. About Section */}
      <View className="bg-[#242526] p-5 border-b border-[#3a3b3c] mt-3">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-bold text-base">소개</Text>
          <TouchableOpacity onPress={openAboutModal} className="p-1">
            <Ionicons name="create-outline" size={18} color="#0a66c2" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-300 text-sm leading-relaxed">
          {profile?.about || "소개글이 없습니다. 프로필을 작성해보세요!"}
        </Text>
      </View>

      {/* 3. Experience Section */}
      <View className="bg-[#242526] p-5 border-b border-[#3a3b3c] mt-3">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-bold text-base">경력</Text>
          <TouchableOpacity onPress={() => setIsExpModalOpen(true)} className="p-1">
            <Ionicons name="add-outline" size={22} color="#0a66c2" />
          </TouchableOpacity>
        </View>
        {profile?.experience?.length === 0 ? (
          <Text className="text-gray-500 text-xs py-2">등록된 경력이 없습니다.</Text>
        ) : (
          <View className="space-y-4">
            {profile?.experience.map((exp: any) => (
              <View key={exp._id} className="flex-row justify-between items-start border-b border-[#3a3b3c]/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                <View className="flex-row flex-1 mr-2">
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
                      <Text className="text-gray-400 text-xs mt-1.5 leading-relaxed">{exp.description}</Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveExperience(exp._id)} className="p-1">
                  <Ionicons name="trash-outline" size={16} color="#f87171" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 4. Education Section */}
      <View className="bg-[#242526] p-5 border-b border-[#3a3b3c] mt-3">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-bold text-base">학력</Text>
          <TouchableOpacity onPress={() => setIsEduModalOpen(true)} className="p-1">
            <Ionicons name="add-outline" size={22} color="#0a66c2" />
          </TouchableOpacity>
        </View>
        {profile?.education?.length === 0 ? (
          <Text className="text-gray-500 text-xs py-2">등록된 학력이 없습니다.</Text>
        ) : (
          <View className="space-y-4">
            {profile?.education.map((edu: any) => (
              <View key={edu._id} className="flex-row justify-between items-start border-b border-[#3a3b3c]/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                <View className="flex-row flex-1 mr-2">
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
                <TouchableOpacity onPress={() => handleRemoveEducation(edu._id)} className="p-1">
                  <Ionicons name="trash-outline" size={16} color="#f87171" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 5. Skills Section */}
      <View className="bg-[#242526] p-5 mt-3">
        <Text className="text-white font-bold text-base mb-3">기술 및 역량</Text>
        <View className="flex-row space-x-2 mb-3">
          <TextInput
            value={newSkill}
            onChangeText={setNewSkill}
            placeholder="새로운 보유 기술 추가..."
            placeholderTextColor="#808080"
            className="flex-1 bg-[#3a3b3c] text-white px-3 py-2 rounded-lg text-xs"
          />
          <TouchableOpacity onPress={handleAddSkill} className="bg-[#0a66c2] px-4 py-2 rounded-lg justify-center">
            <Text className="text-white text-xs font-semibold">추가</Text>
          </TouchableOpacity>
        </View>
        {profile?.skills?.length === 0 ? (
          <Text className="text-gray-500 text-xs py-2">등록된 기술이 없습니다.</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {profile?.skills.map((skill: string, index: number) => (
              <View key={index} className="flex-row items-center bg-[#3a3b3c] px-3 py-1.5 rounded-full border border-gray-600 mb-1.5">
                <Text className="text-gray-200 text-xs font-medium mr-1.5">{skill}</Text>
                <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                  <Ionicons name="close-circle" size={14} color="#f87171" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* =========================================
          MODALS
         ========================================= */}

      {/* A. Info Modal (Name, Headline, Location) */}
      <Modal visible={isInfoModalOpen} animationType="fade" transparent>
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-[#242526] border border-[#3a3b3c] w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <Text className="text-white font-bold text-lg mb-4">기본 정보 수정</Text>
            <View className="space-y-3">
              <View>
                <Text className="text-gray-400 text-xs mb-1.5">이름</Text>
                <TextInput
                  value={infoForm.name}
                  onChangeText={(t) => setInfoForm({ ...infoForm, name: t })}
                  className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm"
                />
              </View>
              <View className="mt-3">
                <Text className="text-gray-400 text-xs mb-1.5">헤드라인</Text>
                <TextInput
                  value={infoForm.headline}
                  onChangeText={(t) => setInfoForm({ ...infoForm, headline: t })}
                  className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm"
                />
              </View>
              <View className="mt-3">
                <Text className="text-gray-400 text-xs mb-1.5">위치</Text>
                <TextInput
                  value={infoForm.location}
                  onChangeText={(t) => setInfoForm({ ...infoForm, location: t })}
                  className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm"
                />
              </View>
            </View>
            <View className="flex-row justify-end space-x-2 mt-5">
              <TouchableOpacity onPress={() => setIsInfoModalOpen(false)} className="bg-[#3a3b3c] px-4 py-2 rounded-lg">
                <Text className="text-gray-300 text-xs font-semibold">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateProfile(infoForm)}
                disabled={isUpdating}
                className="bg-[#0a66c2] px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-xs font-semibold">저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* B. About Modal */}
      <Modal visible={isAboutModalOpen} animationType="fade" transparent>
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-[#242526] border border-[#3a3b3c] w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <Text className="text-white font-bold text-lg mb-4">소개 수정</Text>
            <TextInput
              multiline
              numberOfLines={6}
              value={aboutForm}
              onChangeText={setAboutForm}
              className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm h-32 text-left align-top"
              style={{ textAlignVertical: "top" }}
            />
            <View className="flex-row justify-end space-x-2 mt-5">
              <TouchableOpacity onPress={() => setIsAboutModalOpen(false)} className="bg-[#3a3b3c] px-4 py-2 rounded-lg">
                <Text className="text-gray-300 text-xs font-semibold">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateProfile({ about: aboutForm })}
                disabled={isUpdating}
                className="bg-[#0a66c2] px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-xs font-semibold">저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* C. Experience Modal */}
      <Modal visible={isExpModalOpen} animationType="fade" transparent>
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-[#242526] border border-[#3a3b3c] w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <Text className="text-white font-bold text-lg mb-4">경력 추가</Text>
            <View className="space-y-3">
              <TextInput
                placeholder="직무 (Title)"
                placeholderTextColor="#808080"
                value={expForm.title}
                onChangeText={(t) => setExpForm({ ...expForm, title: t })}
                className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm"
              />
              <TextInput
                placeholder="회사명"
                placeholderTextColor="#808080"
                value={expForm.company}
                onChangeText={(t) => setExpForm({ ...expForm, company: t })}
                className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm mt-3"
              />
              <TextInput
                placeholder="시작일 (예: 2023-01-01)"
                placeholderTextColor="#808080"
                value={expForm.startDate}
                onChangeText={(t) => setExpForm({ ...expForm, startDate: t })}
                className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm mt-3"
              />
              <TextInput
                placeholder="종료일 (비워둘 시 재직 중)"
                placeholderTextColor="#808080"
                value={expForm.endDate}
                onChangeText={(t) => setExpForm({ ...expForm, endDate: t })}
                className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm mt-3"
              />
              <TextInput
                placeholder="상세 설명"
                placeholderTextColor="#808080"
                multiline
                numberOfLines={3}
                value={expForm.description}
                onChangeText={(t) => setExpForm({ ...expForm, description: t })}
                className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm h-20 text-left align-top mt-3"
                style={{ textAlignVertical: "top" }}
              />
            </View>
            <View className="flex-row justify-end space-x-2 mt-5">
              <TouchableOpacity onPress={() => setIsExpModalOpen(false)} className="bg-[#3a3b3c] px-4 py-2 rounded-lg">
                <Text className="text-gray-300 text-xs font-semibold">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddExperience} className="bg-[#0a66c2] px-4 py-2 rounded-lg">
                <Text className="text-white text-xs font-semibold">추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* D. Education Modal */}
      <Modal visible={isEduModalOpen} animationType="fade" transparent>
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-[#242526] border border-[#3a3b3c] w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <Text className="text-white font-bold text-lg mb-4">학력 추가</Text>
            <View className="space-y-3">
              <TextInput
                placeholder="학교명"
                placeholderTextColor="#808080"
                value={eduForm.school}
                onChangeText={(t) => setEduForm({ ...eduForm, school: t })}
                className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm"
              />
              <TextInput
                placeholder="전공 및 학과"
                placeholderTextColor="#808080"
                value={eduForm.fieldOfStudy}
                onChangeText={(t) => setEduForm({ ...eduForm, fieldOfStudy: t })}
                className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm mt-3"
              />
              <TextInput
                placeholder="입학년도 (예: 2019)"
                placeholderTextColor="#808080"
                value={eduForm.startYear}
                onChangeText={(t) => setEduForm({ ...eduForm, startYear: t })}
                className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm mt-3"
              />
              <TextInput
                placeholder="졸업년도 (비워둘 시 재학 중)"
                placeholderTextColor="#808080"
                value={eduForm.endYear}
                onChangeText={(t) => setEduForm({ ...eduForm, endYear: t })}
                className="bg-[#3a3b3c] text-white px-3 py-2.5 rounded-lg text-sm mt-3"
              />
            </View>
            <View className="flex-row justify-end space-x-2 mt-5">
              <TouchableOpacity onPress={() => setIsEduModalOpen(false)} className="bg-[#3a3b3c] px-4 py-2 rounded-lg">
                <Text className="text-gray-300 text-xs font-semibold">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddEducation} className="bg-[#0a66c2] px-4 py-2 rounded-lg">
                <Text className="text-white text-xs font-semibold">추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
