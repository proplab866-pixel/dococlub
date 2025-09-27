"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="text-2xl text-red-500 font-bold mb-2">Something went wrong</div>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-teal-500 text-white rounded shadow hover:bg-teal-600 transition"
      >
        Try Again
      </button>
    </div>
  );
} 