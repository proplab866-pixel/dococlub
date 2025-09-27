"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { validateOTP } from "@/utils/validation";
import OTPInput from "@/components/ui/OTPInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

/**
 * VerifyOTPPage - OTP verification UI for DocoClub
 * Responsive, modern, accessible form with state management
 */
export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP, resendOTP } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Get email from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-clear resend success message after 3 seconds
  useEffect(() => {
    if (success === "New OTP sent to your email!") {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    if (error) setError("");
  };

  const handleOTPComplete = async (value: string) => {
    setOtp(value);
    await handleVerify(value);
  };

  const handleVerify = async (otpValue?: string) => {
    const otpToCheck = otpValue !== undefined ? otpValue : otp;
    if (!email) {
      setError("Email is required");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    // Validate OTP
    const validation = validateOTP(otpToCheck);
    if (!validation.isValid) {
      setError(validation.error || "Please enter a valid OTP");
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOTP(email, otpToCheck);

      if (result.success) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.error || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setError("");
    setResendLoading(true);

    try {
      const result = await resendOTP(email, "verify-email");

      if (result.success) {
        setSuccess("New OTP sent to your email!");
        setCountdown(60); // 60 seconds countdown
      } else {
        setError(result.error || "Failed to resend OTP");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleVerify();
  };

  return (
    <div className="flex flex-col justify-center w-full items-center px-2 py-4">
      <motion.div
        className="card w-full max-w-xl mx-auto p-6 md:p-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.h1
          className="text-3xl md:text-4xl font-extrabold text-center mb-10 gradient-text tracking-wide"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          Verify Email
        </motion.h1>

        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
            >
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded"
            >
              <p className="text-sm">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
            >
              <motion.p
                className="text-center text-gray-600 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                We&apos;ve sent a verification code to <strong>{email}</strong>.
                <br />
                Please enter the 6-digit code below.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <OTPInput
                  length={6}
                  onChange={handleOTPChange}
                  onComplete={handleOTPComplete}
                  disabled={loading}
                  autoFocus={true}
                />
              </motion.div>
            </motion.div>
            <motion.button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full mt-2 py-3 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 text-white font-bold text-lg shadow hover:from-teal-500 hover:to-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </motion.button>
          </div>
        </form>
        <div className="mt-8 text-center text-gray-400 text-base">
          Didn&apos;t receive the code?{" "}
          {countdown > 0 ? (
            <span className="text-gray-500">Resend in {countdown}s</span>
          ) : (
            <motion.button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="text-teal-700 font-semibold hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {resendLoading ? (
                <>
                  <LoadingSpinner size="sm" className="inline mr-1" />
                  Sending...
                </>
              ) : (
                "Resend Code"
              )}
            </motion.button>
          )}
        </div>
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            href="/login"
            className="text-teal-700 hover:underline text-sm font-semibold"
          >
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
