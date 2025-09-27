"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { apiRequest } from "@/utils/api";
import { useError } from "@/context/ErrorContext";

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  country?: string;
  gender?: string;
  availableBalance?: number;
  totalInvested?: number;
  referalCode?: string;
  referedBy?: string;
  isEmailVerified?: boolean;
  level1Referrals?: string[];
  level2Referrals?: string[];
  level3Referrals?: string[];
  role?: "user" | "superadmin";
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  referalCode?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; error?: string }>;
  resendOTP: (
    email: string,
    purpose: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setError } = useError();

  // Updated checkAuth: Only escalate errors if escalateError=true (for protected pages)
  const checkAuth = useCallback(
    async (escalateError: boolean = false) => {
      try {
        const data = await apiRequest<{
          success: boolean;
          user: User;
          error?: string;
        }>("get", "/api/v1/user/personal-info", { withCredentials: true });
        if (data.success) {
          setUser(data.data.user);
        } else {
          setUser(null);
          if (escalateError) {
            setError({
              message: data.error || "Failed to check authentication.",
              solution:
                "Please log in again or contact support if the issue persists.",
              link: "/login",
              linkText: "Login",
            });
          }
        }
      } catch (err: unknown) {
        setUser(null);
        if (escalateError) {
          setError({
            message: getErrorMessage(err) || "Failed to check authentication.",
            solution:
              "Please log in again or contact support if the issue persists.",
            link: "/login",
            linkText: "Login",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError]
  ); // include all dependencies used inside checkAuth

  useEffect(() => {
    // By default, do not escalate auth errors in public context (e.g., header)
    checkAuth(false);
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiRequest<{
        success: boolean;
        user?: User;
        error?: string;
      }>("post", "/api/v1/auth/login", {
        data: { email, password },
        withCredentials: true,
      });
      if (data.success) {
        setUser(data.data.user!);
        return { success: true };
      } else {
        // setError({
        //   message: data.error || "Login failed.",
        //   solution: "Please check your credentials or reset your password.",
        //   link: "/forgot-password",
        //   linkText: "Forgot Password?",
        // });
        return { success: false, error: data.error };
      }
    } catch (err: unknown) {
      // setError({
      //   message: getErrorMessage(err) || "Login failed.",
      //   solution: "Please check your credentials or reset your password.",
      //   link: "/forgot-password",
      //   linkText: "Forgot Password?",
      // });
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const data = await apiRequest<{ success: boolean; error?: string }>(
        "post",
        "/api/v1/auth/register",
        { data: registerData }
      );
      if (data.success) {
        return { success: true };
      } else {
        // setError({
        //   message: data.error || "Registration failed.",
        //   solution: "Please check your details or contact support.",
        //   link: "/contact",
        //   linkText: "Contact Support",
        // });
        return { success: false, error: data.error };
      }
    } catch (err: unknown) {
      // setError({
      //   message: getErrorMessage(err) || "Registration failed.",
      //   solution: "Please check your details or contact support.",
      //   link: "/contact",
      //   linkText: "Contact Support",
      // });
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const data = await apiRequest<{ success: boolean; error?: string }>(
        "post",
        "/api/v1/auth/verify-otp",
        { data: { email, otp } }
      );
      if (data.success) {
        return { success: true };
      } else {
        // setError({
        //   message: data.error || "OTP verification failed.",
        //   solution: "Please check the OTP or request a new one.",
        //   link: "/forgot-password",
        //   linkText: "Forgot Password?",
        // });
        return { success: false, error: data.error };
      }
    } catch (err: unknown) {
      // setError({
      //   message: getErrorMessage(err) || "OTP verification failed.",
      //   solution: "Please check the OTP or request a new one.",
      //   link: "/forgot-password",
      //   linkText: "Forgot Password?",
      // });
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const resendOTP = async (email: string, purpose: string) => {
    try {
      const data = await apiRequest<{ success: boolean; error?: string }>(
        "post",
        "/api/v1/auth/resend-otp",
        { data: { email, purpose } }
      );
      if (data.success) {
        return { success: true };
      } else {
        // setError({
        //   message: data.error || "Failed to resend OTP.",
        //   solution: "Please check your email or contact support.",
        //   link: "/contact",
        //   linkText: "Contact Support",
        // });
        return { success: false, error: data.error };
      }
    } catch (err: unknown) {
      // setError({
      //   message: getErrorMessage(err) || "Failed to resend OTP.",
      //   solution: "Please check your email or contact support.",
      //   link: "/contact",
      //   linkText: "Contact Support",
      // });
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const logout = async () => {
    try {
      await apiRequest("post", "/api/v1/auth/logout", {
        withCredentials: true,
      });
    } catch {
      // setError({
      //   message: getErrorMessage(err) || "Logout failed.",
      //   solution: "Please try again or contact support.",
      //   link: "/contact",
      //   linkText: "Contact Support",
      // });
    } finally {
      setUser(null);
    }
  };

  // Method to update user's available balance
  const updateBalance = (newBalance: number) => {
    setUser((prev) => (prev ? { ...prev, availableBalance: newBalance } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        checkAuth,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper to extract error message from unknown
function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as Record<string, unknown>).message === "string"
  ) {
    return (err as Record<string, unknown>).message as string;
  }
  return "An unknown error occurred.";
}
