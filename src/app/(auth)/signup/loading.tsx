export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500 mb-4" />
      <span className="text-gray-500">Loading...</span>
    </div>
  );
} 