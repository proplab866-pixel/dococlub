"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-2 text-red-600">Something went wrong</h2>
      <p className="mb-4 text-gray-600">Unable to load your account details. Please try again.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
      >
        Retry
      </button>
    </div>
  );
} 