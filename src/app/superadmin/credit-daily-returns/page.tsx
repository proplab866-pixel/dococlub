"use client";

import { useState } from "react";
import { apiRequest } from "@/utils/api";
import { useError } from "@/context/ErrorContext";
import { motion, AnimatePresence } from "framer-motion";

interface CreditedInvestment {
  userEmail: string;
  planName: string;
  amount: number;
}

// Helper to format INR currency in Indian style
function formatINR(amount: number) {
  return amount.toLocaleString("en-IN");
}

export default function SuperadminCreditDailyReturnsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    totalUsers: number;
    totalCredits: number;
    creditedInvestments: CreditedInvestment[];
  } | null>(null);
  const [error, setErrorMsg] = useState<string | null>(null);
  const { setError } = useError();
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleCredit = async () => {
    setShowConfirm(false);
    setLoading(true);
    setErrorMsg(null);
    setSuccess(null);
    setResult(null);
    try {
      const data = await apiRequest<{
        success: boolean;
        totalUsers: number;
        totalCredits: number;
        creditedInvestments: CreditedInvestment[];
        error?: string;
      }>("post", "/api/v1/superadmin/credit-daily-returns");
      if (data.success) {
        setResult({
          totalUsers: data.data.totalUsers,
          totalCredits: data.data.totalCredits,
          creditedInvestments: data.data.creditedInvestments,
        });
        setSuccess(
          `Successfully credited daily returns to ${data.data.totalUsers} users. Total credits: ${data.data.totalCredits}`
        );
      } else {
        setErrorMsg(data.error || "Failed to credit daily returns");
        setError({
          message: data.error || "Failed to credit daily returns.",
          solution:
            "Please try again or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to credit daily returns";
      setErrorMsg(msg);
      setError({
        message: msg,
        solution: "Please try again or contact support if the issue persists.",
        link: "/contact",
        linkText: "Contact Support",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-2 sm:px-4 md:px-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-700 drop-shadow mb-8 mt-4 text-center">
        Credit Daily Returns
      </h1>
      <div className="flex flex-col items-center mb-8">
        <button
          className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg text-base sm:text-lg transition disabled:opacity-60"
          onClick={() => setShowConfirm(true)}
          disabled={loading}
        >
          {loading ? "Processing..." : "Credit Daily Returns to All Users"}
        </button>
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Confirm Credit Daily Returns
                </div>
                <div className="text-gray-600 mb-4 text-center">
                  Are you sure you want to credit daily returns to all users?
                  This action cannot be undone.
                </div>
                <div className="flex gap-4 mt-2">
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
                    onClick={handleCredit}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Yes, Credit"}
                  </button>
                  <button
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <div className="text-red-600 font-semibold mt-4 text-center text-sm sm:text-base">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-700 font-semibold mt-4 text-center text-sm sm:text-base">
            {success}
          </div>
        )}
      </div>
      {result && (
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 overflow-x-auto">
          <div className="mb-4 text-base sm:text-lg font-bold text-gray-800">
            Summary
          </div>
          <div className="mb-2 text-gray-700 text-sm sm:text-base">
            <span className="font-semibold">Total Users Credited:</span>{" "}
            {result.totalUsers}
          </div>
          <div className="mb-4 text-gray-700 text-sm sm:text-base">
            <span className="font-semibold">Total Credited Amount:</span> ₹{" "}
            {formatINR(result.creditedInvestments.reduce((sum, ci) => sum + ci.amount, 0))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2 px-4 text-left">User Email</th>
                  <th className="py-2 px-4 text-left">Plan Name</th>
                  <th className="py-2 px-4 text-left">Amount Credited (₹)</th>
                </tr>
              </thead>
              <tbody>
                {result.creditedInvestments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-gray-400">
                      No credits processed.
                    </td>
                  </tr>
                ) : (
                  result.creditedInvestments.slice(0, 50).map((ci, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 px-4 whitespace-nowrap">
                        {ci.userEmail}
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        {ci.planName}
                      </td>
                      <td className="py-2 px-4 font-semibold text-green-700 whitespace-nowrap">
                        ₹{formatINR(ci.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {result.creditedInvestments.length > 50 && (
              <div className="text-xs text-gray-400 mt-2">
                Showing first 50 records only.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
