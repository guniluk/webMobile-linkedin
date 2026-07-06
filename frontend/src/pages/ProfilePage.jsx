import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  UserPlus,
  UserCheck,
  UserMinus,
  Clock,
  X,
  Loader2,
} from "lucide-react";

const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();

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

  // 1. Fetch Current User (My Auth State)
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const isOwnProfile = authUser?.username === username;

  // 2. Fetch Target User Profile
  const { data: profile, isLoading: isProfileLoading, isError } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`/api/v1/user/profile/${username}`);
      if (!res.ok) throw new Error("프로필을 불러오는데 실패했습니다.");
      return res.json();
    },
  });

  // 3. Fetch Connection Status with Target User
  const { data: connStatus, isLoading: isConnStatusLoading } = useQuery({
    queryKey: ["connectionStatus", profile?._id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/connection/status/${profile._id}`);
      if (!res.ok) throw new Error("연결 상태 조회 실패");
      return res.json();
    },
    enabled: !!profile && !isOwnProfile,
  });

  // 4. Mutations
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedData) => {
      const res = await fetch("/api/v1/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("프로필 업데이트 실패");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["userProfile", username]);
      if (isOwnProfile) {
        queryClient.setQueryData(["authUser"], data);
      }
      setIsInfoModalOpen(false);
      setIsAboutModalOpen(false);
      setIsExpModalOpen(false);
      setIsEduModalOpen(false);
    },
    onError: (err) => alert(err.message),
  });

  // Connection Request Mutations
  const { mutate: sendConnRequest, isPending: isSendingReq } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/connection/request/${profile._id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("요청 실패");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["connectionStatus", profile._id]),
    onError: (err) => alert(err.message),
  });

  const { mutate: acceptConnRequest } = useMutation({
    mutationFn: async (requestId) => {
      const res = await fetch(`/api/v1/connection/accept/${requestId}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("수락 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["connectionStatus", profile._id]);
      queryClient.invalidateQueries(["userProfile", username]);
    },
    onError: (err) => alert(err.message),
  });

  const { mutate: rejectConnRequest } = useMutation({
    mutationFn: async (requestId) => {
      const res = await fetch(`/api/v1/connection/reject/${requestId}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("거절 실패");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["connectionStatus", profile._id]),
    onError: (err) => alert(err.message),
  });

  const { mutate: removeConn } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/connection/${profile._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["connectionStatus", profile._id]);
      queryClient.invalidateQueries(["userProfile", username]);
    },
    onError: (err) => alert(err.message),
  });

  // Image Upload handler (Base64)
  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Open & Init modals
  const openInfoModal = () => {
    setInfoForm({
      name: profile.name || "",
      headline: profile.headline || "",
      location: profile.location || "",
    });
    setIsInfoModalOpen(true);
  };

  const openAboutModal = () => {
    setAboutForm(profile.about || "");
    setIsAboutModalOpen(true);
  };

  // Experience handlers
  const handleAddExperience = (e) => {
    e.preventDefault();
    const updatedExp = [...(profile.experience || []), expForm];
    updateProfile({ experience: updatedExp });
    setExpForm({ title: "", company: "", description: "", startDate: "", endDate: "" });
  };

  const handleRemoveExperience = (expId) => {
    const updatedExp = profile.experience.filter((exp) => exp._id !== expId);
    updateProfile({ experience: updatedExp });
  };

  // Education handlers
  const handleAddEducation = (e) => {
    e.preventDefault();
    const updatedEdu = [...(profile.education || []), eduForm];
    updateProfile({ education: updatedEdu });
    setEduForm({ school: "", fieldOfStudy: "", startYear: "", endYear: "" });
  };

  const handleRemoveEducation = (eduId) => {
    const updatedEdu = profile.education.filter((edu) => edu._id !== eduId);
    updateProfile({ education: updatedEdu });
  };

  // Skill handlers
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (profile.skills?.includes(newSkill.trim())) return;
    const updatedSkills = [...(profile.skills || []), newSkill.trim()];
    updateProfile({ skills: updatedSkills });
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = profile.skills.filter((s) => s !== skillToRemove);
    updateProfile({ skills: updatedSkills });
  };

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#0a66c2]" />
        <p className="text-slate-400 text-sm">프로필을 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="bg-[#111827] border border-slate-800 p-8 rounded-xl flex flex-col items-center text-center gap-3 max-w-lg mx-auto">
        <X className="w-10 h-10 text-red-500" />
        <h3 className="text-white font-semibold">사용자를 찾을 수 없습니다</h3>
        <p className="text-slate-400 text-xs">
          요청하신 프로필을 찾을 수 없습니다. 올바른 주소인지 확인해주세요.
        </p>
      </div>
    );
  }

  const renderConnectionButton = () => {
    if (isConnStatusLoading) {
      return (
        <button disabled className="btn btn-sm bg-slate-800 border border-slate-700 px-4 rounded-full">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        </button>
      );
    }

    const { status, requestId } = connStatus || {};

    switch (status) {
      case "connected":
        return (
          <button
            onClick={() => {
              if (window.confirm("정말로 1촌을 끊으시겠습니까?")) removeConn();
            }}
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none flex items-center gap-1.5 px-4 rounded-full"
          >
            <UserMinus className="w-4 h-4" />
            <span>1촌 끊기</span>
          </button>
        );
      case "pending":
        return (
          <button
            disabled
            className="btn btn-sm bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed flex items-center gap-1.5 px-4 rounded-full"
          >
            <Clock className="w-4 h-4" />
            <span>요청 대기 중</span>
          </button>
        );
      case "received":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => acceptConnRequest(requestId)}
              className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none flex items-center gap-1.5 px-3 rounded-full"
            >
              <UserCheck className="w-4 h-4" />
              <span>수락</span>
            </button>
            <button
              onClick={() => rejectConnRequest(requestId)}
              className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 px-3 rounded-full"
            >
              <X className="w-4 h-4" />
              <span>거절</span>
            </button>
          </div>
        );
      case "not_connected":
      default:
        return (
          <button
            onClick={() => sendConnRequest()}
            disabled={isSendingReq}
            className="btn btn-sm bg-[#0a66c2] hover:bg-[#004182] text-white border-none flex items-center gap-1.5 px-4 rounded-full shadow-lg shadow-[#0a66c2]/10"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSendingReq ? "전송 중" : "1촌 맺기"}</span>
          </button>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header Card (Banner & Avatar & Meta) */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl relative">
        {/* Banner Area */}
        <div
          className="h-48 md:h-64 bg-cover bg-center relative"
          style={{
            backgroundImage: profile.bannerImg
              ? `url(${profile.bannerImg})`
              : "linear-gradient(to right, #0a66c2, #004182)",
          }}
        >
          {isOwnProfile && (
            <label className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/50 p-2 rounded-full cursor-pointer text-slate-300 hover:text-white transition-all">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "bannerImg")}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Profile Details Area */}
        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="relative -mt-20 md:-mt-24 mb-4 inline-block">
            <div className="avatar ring-4 ring-[#111827] rounded-full overflow-hidden w-32 h-32 md:w-36 md:h-36 bg-slate-800 border border-slate-700">
              <img
                src={
                  profile.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    profile.name
                  )}&background=0a66c2&color=fff`
                }
                alt={profile.name}
              />
            </div>
            {isOwnProfile && (
              <label className="absolute bottom-1.5 right-1.5 bg-[#0a66c2] hover:bg-[#004182] p-2 rounded-full cursor-pointer text-white shadow-lg border border-slate-900 transition-all">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "profilePicture")}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-white font-extrabold text-xl md:text-2xl">
                  {profile.name}
                </h1>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-medium">
                  @{profile.username}
                </span>
              </div>
              <p className="text-slate-300 text-sm md:text-base mt-1.5 font-medium">
                {profile.headline || "LinkedIn 회원"}
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>{profile.location || "위치 비공개"}</span>
              </div>
              <div className="text-xs text-[#0a66c2] font-semibold mt-2.5">
                1촌 {profile.connections?.length || 0}명
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <button
                  onClick={openInfoModal}
                  className="btn btn-sm bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 text-[#0a66c2] border border-[#0a66c2]/30 flex items-center gap-1.5 px-4 rounded-full font-semibold"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>정보 수정</span>
                </button>
              ) : (
                renderConnectionButton()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. About Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl relative">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
          <h2 className="text-white font-bold text-base md:text-lg">소개</h2>
          {isOwnProfile && (
            <button
              onClick={openAboutModal}
              className="text-[#0a66c2] hover:text-[#004182] p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {profile.about || "소개글이 없습니다. 프로필을 작성해보세요!"}
        </p>
      </div>

      {/* 3. Experience Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
          <h2 className="text-white font-bold text-base md:text-lg">경력</h2>
          {isOwnProfile && (
            <button
              onClick={() => setIsExpModalOpen(true)}
              className="text-[#0a66c2] hover:text-[#004182] p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {profile.experience?.length === 0 ? (
          <p className="text-slate-500 text-xs py-2">등록된 경력이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {profile.experience.map((exp) => (
              <div
                key={exp._id}
                className="flex gap-3 justify-between items-start pb-4 border-b border-slate-800/40 last:border-b-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <div className="bg-slate-800 p-2.5 rounded-lg text-slate-400 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-semibold">{exp.title}</h3>
                    <p className="text-slate-300 text-xs mt-0.5">{exp.company}</p>
                    <p className="text-slate-500 text-[10px] mt-1">
                      {new Date(exp.startDate).toLocaleDateString()} ~{" "}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString()
                        : "재직 중"}
                    </p>
                    {exp.description && (
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => handleRemoveExperience(exp._id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Education Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
          <h2 className="text-white font-bold text-base md:text-lg">학력</h2>
          {isOwnProfile && (
            <button
              onClick={() => setIsEduModalOpen(true)}
              className="text-[#0a66c2] hover:text-[#004182] p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {profile.education?.length === 0 ? (
          <p className="text-slate-500 text-xs py-2">등록된 학력이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {profile.education.map((edu) => (
              <div
                key={edu._id}
                className="flex gap-3 justify-between items-start pb-4 border-b border-slate-800/40 last:border-b-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <div className="bg-slate-800 p-2.5 rounded-lg text-slate-400 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-semibold">{edu.school}</h3>
                    <p className="text-slate-300 text-xs mt-0.5">
                      {edu.fieldOfStudy}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-1">
                      {edu.startYear}년 ~ {edu.endYear || "재학 중"}년
                    </p>
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => handleRemoveEducation(edu._id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Skills Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="mb-4 pb-2 border-b border-slate-800">
          <h2 className="text-white font-bold text-base md:text-lg">기술 및 역량</h2>
        </div>

        {isOwnProfile && (
          <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="새로운 보유 기술 추가..."
              className="flex-1 bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg px-3 py-2 text-xs text-white outline-none transition-all duration-200"
            />
            <button
              type="submit"
              className="btn btn-sm bg-[#0a66c2] hover:bg-[#004182] border-none text-white rounded-lg flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>추가</span>
            </button>
          </form>
        )}

        {profile.skills?.length === 0 ? (
          <p className="text-slate-500 text-xs py-2">등록된 기술이 없습니다.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-slate-800 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200"
              >
                {skill}
                {isOwnProfile && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-500 hover:text-red-400 rounded-full hover:bg-slate-700 p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          MODALS
         ======================================================== */}

      {/* A. Info Modal (Name, Headline, Location) */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full relative shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-[#111827]">
              <h3 className="text-white font-bold text-sm">기본 정보 수정</h3>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfile(infoForm);
              }}
              className="p-4 space-y-4 text-xs font-semibold text-slate-400"
            >
              <div className="flex flex-col gap-1">
                <label className="text-slate-300">이름</label>
                <input
                  type="text"
                  required
                  value={infoForm.name}
                  onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                  className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">헤드라인</label>
                <input
                  type="text"
                  value={infoForm.headline}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, headline: e.target.value })
                  }
                  className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">위치</label>
                <input
                  type="text"
                  value={infoForm.location}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, location: e.target.value })
                  }
                  className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInfoModalOpen(false)}
                  className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg px-4"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-sm bg-[#0a66c2] hover:bg-[#004182] text-white border-none rounded-lg px-4 flex items-center gap-1"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. About Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full relative shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-[#111827]">
              <h3 className="text-white font-bold text-sm">소개 수정</h3>
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfile({ about: aboutForm });
              }}
              className="p-4 space-y-4 text-xs font-semibold text-slate-400"
            >
              <div className="flex flex-col gap-1">
                <label className="text-slate-300">소개글</label>
                <textarea
                  value={aboutForm}
                  onChange={(e) => setAboutForm(e.target.value)}
                  className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs resize-none min-h-37.5 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg px-4"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-sm bg-[#0a66c2] hover:bg-[#004182] text-white border-none rounded-lg px-4 flex items-center gap-1"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. Experience Add Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full relative shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-[#111827]">
              <h3 className="text-white font-bold text-sm">경력 추가</h3>
              <button
                onClick={() => setIsExpModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleAddExperience}
              className="p-4 space-y-4 text-xs font-semibold text-slate-400"
            >
              <div className="flex flex-col gap-1">
                <label className="text-slate-300">직무 (Title)</label>
                <input
                  type="text"
                  required
                  value={expForm.title}
                  onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                  placeholder="예: 프론트엔드 개발자"
                  className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">회사명</label>
                <input
                  type="text"
                  required
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  placeholder="예: Google"
                  className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">시작일</label>
                  <input
                    type="date"
                    required
                    value={expForm.startDate}
                    onChange={(e) =>
                      setExpForm({ ...expForm, startDate: e.target.value })
                    }
                    className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">종료일 (비워둘 시 재직 중)</label>
                  <input
                    type="date"
                    value={expForm.endDate}
                    onChange={(e) =>
                      setExpForm({ ...expForm, endDate: e.target.value })
                    }
                    className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">설명 (선택사항)</label>
                <textarea
                  value={expForm.description}
                  onChange={(e) =>
                    setExpForm({ ...expForm, description: e.target.value })
                  }
                  placeholder="업무 내용을 간략하게 기술하세요..."
                  className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs resize-none min-h-22.5 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg px-4"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-sm bg-[#0a66c2] hover:bg-[#004182] text-white border-none rounded-lg px-4 flex items-center gap-1"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. Education Add Modal */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full relative shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-[#111827]">
              <h3 className="text-white font-bold text-sm">학력 추가</h3>
              <button
                onClick={() => setIsEduModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleAddEducation}
              className="p-4 space-y-4 text-xs font-semibold text-slate-400"
            >
              <div className="flex flex-col gap-1">
                <label className="text-slate-300">학교명</label>
                <input
                  type="text"
                  required
                  value={eduForm.school}
                  onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })}
                  placeholder="예: 서울대학교"
                  className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">전공 / 학과</label>
                <input
                  type="text"
                  required
                  value={eduForm.fieldOfStudy}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, fieldOfStudy: e.target.value })
                  }
                  placeholder="예: 컴퓨터공학과"
                  className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">입학년도</label>
                  <input
                    type="number"
                    required
                    value={eduForm.startYear}
                    onChange={(e) =>
                      setEduForm({ ...eduForm, startYear: e.target.value })
                    }
                    placeholder="예: 2020"
                    className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">졸업년도 (또는 예정)</label>
                  <input
                    type="number"
                    value={eduForm.endYear}
                    onChange={(e) =>
                      setEduForm({ ...eduForm, endYear: e.target.value })
                    }
                    placeholder="예: 2024"
                    className="w-full bg-[#1f2937]/50 border border-slate-800 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-2.5 text-white outline-none text-xs transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEduModalOpen(false)}
                  className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg px-4"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-sm bg-[#0a66c2] hover:bg-[#004182] text-white border-none rounded-lg px-4 flex items-center gap-1"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
