import { Image } from "expo-image";

interface AvatarProps {
  user: any;
  size?: number;
  className?: string;
}

export default function Avatar({ user, size = 40, className = "" }: AvatarProps) {
  const avatarUrl =
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=0a66c2&color=fff&size=${size * 2}`;

  return (
    <Image
      source={avatarUrl}
      style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}
      contentFit="contain"
      className={`bg-gray-700 ${className}`}
    />
  );
}
