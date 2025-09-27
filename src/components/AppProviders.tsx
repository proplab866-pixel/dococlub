"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorProvider } from "@/context/ErrorContext";
import GlobalErrorModal from "@/components/GlobalErrorModal";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorProvider>
      <GlobalErrorModal />
      <AuthProvider>{children}</AuthProvider>
    </ErrorProvider>
  );
} 