import React from 'react';
import { useError } from '@/context/ErrorContext';

export default function GlobalErrorModal() {
  const { error, clearError } = useError();
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
          onClick={clearError}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center mb-4">
          <div className="text-lg font-bold text-gray-800 mb-1">
            {error.message}
          </div>
          {error.solution && (
            <div className="text-gray-600 text-center mb-2">
              <span className="font-semibold">Solution:</span> {error.solution}
            </div>
          )}
          {error.link && (
            <a
              href={error.link}
              className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
              onClick={clearError}
            >
              {error.linkText || 'Learn More'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 