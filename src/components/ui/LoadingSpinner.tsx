interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={`inline-block ${sizeClasses[size]} ${className} ${
        size === "lg" ? "glass" : ""
      }`}
    >
      <div
        className="animate-spin rounded-full h-full w-full border-2 border-t-2 border-b-2 border-transparent border-t-blue-400 border-b-teal-400"
        style={{ borderImage: "linear-gradient(90deg, #14b8a6, #2563eb) 1" }}
      ></div>
    </div>
  );
}
