import Image from "next/image";

interface UserAvatarProps {
  name: string;
  profileImg?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function UserAvatar({
  name,
  profileImg,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-xl",
  };

  if (profileImg) {
    return (
      <Image
        src={profileImg}
        alt={`${name}'s profile`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        width={parseInt(sizeClasses[size].split(" ")[0])}
        height={parseInt(sizeClasses[size].split(" ")[1])}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        bg-gradient-to-br from-blue-500 to-purple-600 
        flex items-center justify-center 
        text-white font-semibold 
        shadow-lg
        ${className}
      `}
    >
      {getInitials(name)}
    </div>
  );
}
