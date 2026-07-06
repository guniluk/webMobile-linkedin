import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const LogoutPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: logoutMutate } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "로그아웃에 실패했습니다.");
      }
      return data;
    },
    onSuccess: () => {
      // authUser 상태 무효화 및 로그인 페이지로 이동
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/login");
    },
    onError: (err) => {
      console.error("Logout Error:", err);
      // 에러가 발생해도 강제로 홈이나 로그인 페이지로 이동
      navigate("/login");
    },
  });

  useEffect(() => {
    logoutMutate();
  }, [logoutMutate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#090d16]">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-[#0a66c2]"></span>
        <p className="text-slate-400 font-medium animate-pulse text-sm">
          안전하게 로그아웃하는 중입니다...
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
