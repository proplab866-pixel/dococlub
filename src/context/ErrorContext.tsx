"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type GlobalError = {
  message: string;
  solution?: string;
  link?: string;
  linkText?: string;
};

interface ErrorContextType {
  error: GlobalError | null;
  setError: (err: GlobalError) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setErrorState] = useState<GlobalError | null>(null);

  const setError = (err: GlobalError) => setErrorState(err);
  const clearError = () => setErrorState(null);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useError must be used within an ErrorProvider");
  return ctx;
}

// Example usage:
// const { setError } = useError();
// setError({
//   message: 'Session expired. Please log in again.',
//   solution: 'Go to the login page and re-authenticate.',
//   link: '/login',
//   linkText: 'Login',
// });
