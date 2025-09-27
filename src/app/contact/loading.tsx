import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
      <span className="mt-4 text-teal-700 font-semibold text-lg animate-pulse">Loading Contact Us...</span>
    </div>
  );
} 