"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import OTPInput from "@/components/ui/OTPInput";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/utils/validation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { apiRequest } from "@/utils/api";

type Step = "email" | "reset";

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // local error state for form
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-clear OTP sent success message after 3 seconds
  useEffect(() => {
    if (success && !error) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Invalid email");
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{
        success: boolean;
        error?: string;
      }>("post", "/api/v1/auth/resend-otp", {
        data: { email, purpose: "reset-password" },
      });

      if (data.success) {
        setSuccess("OTP sent to your email successfully!");
        setCurrentStep("reset");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    const confirmPasswordValidation = validateConfirmPassword(
      newPassword,
      confirmPassword
    );

    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || "Invalid password");
      return;
    }

    if (!confirmPasswordValidation.isValid) {
      setError(confirmPasswordValidation.error || "Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest<{
        success: boolean;
        error?: string;
      }>("post", "/api/v1/auth/reset-password", {
        data: { email, otp, newPassword },
      });

      if (data.success) {
        setSuccess(
          "Password reset successful! You can now login with your new password."
        );
        // Reset form
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setCurrentStep("email");
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<{
        success: boolean;
        error?: string;
      }>("post", "/api/v1/auth/resend-otp", {
        data: { email, purpose: "reset-password" },
      });

      if (data.success) {
        setSuccess("New OTP sent to your email!");
        setOtp("");
      } else {
        setError(data.error || "Failed to resend OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center w-full items-center px-2 py-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="card w-full max-w-xl mx-auto p-6 md:p-10"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold text-center mb-10 gradient-text tracking-wide"
        >
          Forgot Password
        </motion.h1>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="relative flex items-center w-64 max-w-full">
            {/* Progress Bar */}
            <motion.div className="absolute top-1/2 left-0 h-1 w-full bg-gray-200 rounded-full -translate-y-1/2 z-0" />
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full -translate-y-1/2 z-10"
              initial={{ width: "0%" }}
              animate={{ width: currentStep === "email" ? "0%" : "100%" }}
              transition={{ duration: 0.5 }}
              style={{ height: 6 }}
            />
            {/* Step 1 */}
            <motion.div
              animate={{
                scale: currentStep === "email" ? 1.15 : 1,
                boxShadow:
                  currentStep === "email" ? "0 0 0 6px #5eead4aa" : "none",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`relative z-20 w-12 h-12 flex flex-col items-center justify-center rounded-full border-4 ${
                currentStep === "email"
                  ? "bg-gradient-to-br from-teal-400 to-blue-400 text-white border-teal-300"
                  : "bg-gray-200 text-gray-600 border-gray-300"
              } font-bold text-lg shadow-lg`}
            >
              1
              <span className="absolute top-full mt-2 text-xs font-medium text-gray-700 w-max left-1/2 -translate-x-1/2">
                Email
              </span>
            </motion.div>
            {/* Connector */}
            <div className="flex-1 h-1" />
            {/* Step 2 */}
            <motion.div
              animate={{
                scale: currentStep === "reset" ? 1.15 : 1,
                boxShadow:
                  currentStep === "reset" ? "0 0 0 6px #60a5fa99" : "none",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`relative z-20 w-12 h-12 flex flex-col items-center justify-center rounded-full border-4 ${
                currentStep === "reset"
                  ? "bg-gradient-to-br from-teal-400 to-blue-400 text-white border-blue-300"
                  : "bg-gray-200 text-gray-600 border-gray-300"
              } font-bold text-lg shadow-lg`}
            >
              2
              <span className="absolute top-full mt-2 text-xs font-medium text-gray-700 w-max left-1/2 -translate-x-1/2">
                Reset
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Error/Success messages */}
        <AnimatePresence>
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
            >
              {error}
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded"
            >
              {success}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Step 1: Email Input */}
        <AnimatePresence mode="wait">
          {currentStep === "email" && (
            <motion.form
              key="step-email"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSendOTP}
              className="space-y-8"
            >
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white/80 glass border-2 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-gray-800 placeholder-gray-400 text-base transition-all duration-200 shadow"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 text-white font-bold text-lg shadow hover:from-teal-500 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Step 2: OTP + New Password */}
        <AnimatePresence mode="wait">
          {currentStep === "reset" && (
            <motion.form
              key="step-reset"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleResetPassword}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Enter the 6-digit OTP sent to <strong>{email}</strong>
                </p>
                <OTPInput onChange={setOtp} disabled={loading} />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white/80 glass border-2 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-gray-800 placeholder-gray-400 text-base transition-all duration-200 shadow pr-12"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white/70 rounded-full border border-gray-200 shadow hover:bg-gray-100 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Image
                    src="/eye.svg"
                    alt={showPassword ? "Hide password" : "Show password"}
                    width={22}
                    height={22}
                  />
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white/80 glass border-2 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-gray-800 placeholder-gray-400 text-base transition-all duration-200 shadow pr-12"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white/70 rounded-full border border-gray-200 shadow hover:bg-gray-100 transition"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  <Image
                    src="/eye.svg"
                    alt={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    width={22}
                    height={22}
                  />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                type="submit"
                disabled={
                  loading ||
                  otp.length !== 6 ||
                  !newPassword ||
                  !confirmPassword
                }
                className="w-full mt-2 py-3 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 text-white font-bold text-lg shadow hover:from-teal-500 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </motion.button>

              <div className="text-center space-y-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.03 }}
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-teal-600 hover:text-blue-600 underline disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </motion.button>
                <div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                    type="button"
                    onClick={() => setCurrentStep("email")}
                    className="text-teal-600 hover:text-blue-600 underline"
                  >
                    Change Email
                  </motion.button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-center text-gray-400 text-base"
        >
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-teal-700 font-semibold hover:underline"
          >
            Log In
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
