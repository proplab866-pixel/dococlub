"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { validateRegistrationForm } from "@/utils/validation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referalCode: "",
  });
  const [referralLocked, setReferralLocked] = useState(false);

  useEffect(() => {
    const referralCode = searchParams.get("ref");
    if (referralCode) {
      setFormData((prev) => ({
        ...prev,
        referalCode: referralCode.toUpperCase(),
      }));
      setReferralLocked(true);
    } else {
      setReferralLocked(false);
    }
  }, [searchParams]);

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
    setSuccess("");
    setFormLoading(true);
    const validation = validateRegistrationForm(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.referalCode
    );
    if (!validation.isValid) {
      setError(validation.error || "Please check your input");
      setFormLoading(false);
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      setFormLoading(false);
      return;
    }
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        referalCode: formData.referalCode || undefined,
      });
      if (result.success) {
        setSuccess(
          "Account created successfully! Please check your email for OTP verification."
        );
        setTimeout(() => {
          router.push(
            `/verify-otp?email=${encodeURIComponent(formData.email)}`
          );
        }, 2000);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setFormLoading(false);
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
          Create Account
        </h1>
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg w-full">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg w-full">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6 text-base md:text-lg lg:text-xl"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none py-3 px-4 bg-white text-gray-800 placeholder-gray-400 text-base shadow-sm"
            required
            autoComplete="name"
            disabled={formLoading}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none py-3 px-4 bg-white text-gray-800 placeholder-gray-400 text-base shadow-sm"
            required
            autoComplete="email"
            disabled={formLoading}
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
              autoComplete="new-password"
              disabled={formLoading}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={formLoading}
            >
              <Image
                src="/eye.svg"
                alt="Show Password"
                width={22}
                height={22}
              />
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none py-3 px-4 bg-white text-gray-800 placeholder-gray-400 text-base pr-10 shadow-sm"
              required
              autoComplete="new-password"
              disabled={formLoading}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              disabled={formLoading}
            >
              <Image
                src="/eye.svg"
                alt="Show Password"
                width={22}
                height={22}
              />
            </button>
          </div>
          <input
            type="text"
            name="referalCode"
            placeholder="Referral Code (Optional)"
            value={formData.referalCode}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none py-3 px-4 bg-white text-gray-800 placeholder-gray-400 text-base shadow-sm"
            autoComplete="off"
            disabled={formLoading || referralLocked}
            maxLength={8}
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              id="terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
              required
              disabled={formLoading}
            />
            <label
              htmlFor="terms"
              className="text-gray-400 text-sm select-none"
            >
              I have read and agreed to the Terms of Service and Privacy Policy
            </label>
          </div>
          <button
            type="submit"
            disabled={!agreed || formLoading}
            className="w-full mt-4 py-3 rounded-xl bg-teal-500 text-white font-bold text-lg shadow hover:bg-teal-600 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {formLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-base md:text-lg gap-2 w-full">
          <div>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-teal-700 font-semibold hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
