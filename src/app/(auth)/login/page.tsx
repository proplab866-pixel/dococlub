"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { validateLoginForm } from "@/utils/validation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import { apiRequest } from "@/utils/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // local error state for form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "superadmin") {
        router.replace("/superadmin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const validation = validateLoginForm(formData.email, formData.password);
    if (!validation.isValid) {
      setError(validation.error || "Please check your input");
      setLoading(false);
      return;
    }
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Fetch user info to get the role
        const data = await apiRequest<{
          success: boolean;
          user?: { role?: string };
          error?: string;
        }>("get", "/api/v1/user/personal-info");
        if (data.success && data.data.user && data.data.user.role === "superadmin") {
          router.push("/superadmin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center w-full items-center px-2 py-4">
      {/* Form Card */}
      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl px-6 md:px-10 lg:px-16 py-10 md:py-14 flex flex-col items-center"
      >
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/Logo.svg"
            alt="DocoClub Logo"
            width={48}
            height={48}
            className="rounded-full border-2 border-white shadow mb-2"
          />
          <span className="font-extrabold text-2xl tracking-wide text-teal-700 drop-shadow">
            DocoClub
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-8 text-gray-800 tracking-wide">
          Welcome Back
        </h1>
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg w-full">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6 text-base md:text-lg lg:text-xl"
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none py-3 px-4 bg-white text-gray-800 placeholder-gray-400 text-base shadow-sm"
            required
            autoComplete="email"
            disabled={loading}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none py-3 px-4 bg-white text-gray-800 placeholder-gray-400 text-base pr-10 shadow-sm"
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
            >
              <Image
                src="/eye.svg"
                alt="Show Password"
                width={22}
                height={22}
              />
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-teal-500 text-white font-bold text-lg shadow hover:bg-teal-600 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-base md:text-lg gap-2 w-full">
          <div>
            New to DocoClub?{" "}
            <Link
              href="/signup"
              className="text-teal-700 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </div>
          <div>
            <Link
              href="/forgot-password"
              className="text-teal-700 font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
