import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Send, X, Loader2 } from "lucide-react";

const PostCreation = ({ user }) => {
  const [content, setContent] = useState("");
  const [, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { mutate: publishPost, isPending } = useMutation({
    mutationFn: async (postData) => {
      const res = await fetch("/api/v1/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      if (!res.ok) {
        throw new Error("포스트 생성에 실패했습니다.");
      }
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      setImage(null);
      setImagePreview(null);
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (err) => {
      alert(err.message || "에러가 발생했습니다.");
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !imagePreview) return;

    publishPost({
      content,
      image: imagePreview, // base64 string
    });
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-xl mb-6 transition-colors duration-200">
      <div className="flex gap-3">
        {/* User avatar */}
        <div className="avatar rounded-full bg-base-300 overflow-hidden w-11 h-11 border border-base-300 shrink-0">
          <img
            src={
              user?.profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User",
              )}&background=0a66c2&color=fff`
            }
            alt={user?.name}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="나누고 싶은 생각을 공유하세요..."
            className="w-full bg-base-200/50 border border-base-300 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] rounded-lg p-3 text-base-content text-sm outline-none resize-none min-h-22.5 transition-all duration-200 placeholder-base-content/40"
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-3 rounded-lg overflow-hidden border border-base-300">
              <img
                src={imagePreview}
                alt="Upload Preview"
                className="w-full max-h-87.5 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-base-300/80 hover:bg-base-300 p-1.5 rounded-full text-base-content/80 hover:text-base-content transition-colors border border-base-300/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-base-300">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-base-content/65 hover:text-base-content transition-colors duration-200 text-xs font-semibold py-2 px-3 rounded-lg hover:bg-base-200"
            >
              <ImageIcon className="w-5 h-5 text-[#0a66c2]" />
              사진 추가
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="submit"
              disabled={isPending || (!content.trim() && !imagePreview)}
              className="btn btn-sm bg-[#0a66c2] hover:bg-[#004182] disabled:bg-base-300 disabled:text-base-content/30 disabled:border-base-300 text-white rounded-full px-4 flex items-center gap-1.5 border-none font-semibold transition-all duration-200 shadow-lg shadow-[#0a66c2]/10"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isPending ? "올리는 중" : "게시"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreation;
