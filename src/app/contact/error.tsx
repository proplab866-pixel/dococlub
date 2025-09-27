"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-2xl font-bold text-red-600 mb-2">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-6">
        We couldn&apos;t load the Contact Us page. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow transition"
      >
        Retry
      </button>
    </div>
  );
}
