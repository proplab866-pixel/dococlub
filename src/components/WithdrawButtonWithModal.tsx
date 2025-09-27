import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/utils/api";
import { useError } from "@/context/ErrorContext";

// Accept 'any' for user to support DashboardUser shape from dashboard page
interface WithdrawButtonWithModalProps {
  onRequestSuccess?: () => void;
  onClick?: () => boolean;
  availableBalance?: number;
  personalInfo?: {
    name?: string;
    mobile?: string;
    country?: string;
    gender?: string;
  };
  accountDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
    fullNameInBank?: string;
  };
  onBlock?: (msg: string) => void;
}

interface Withdrawal {
  amount: number;
  status: string;
  createdAt: string;
  // Add more fields if needed
}

const WithdrawButtonWithModal: React.FC<WithdrawButtonWithModalProps> = ({
  onRequestSuccess,
  onClick,
  availableBalance,
  personalInfo,
  accountDetails,
  onBlock,
}) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setError } = useError();

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

  const handleOpen = () => {
    if (typeof onClick === "function" && onClick() === false) {
      return;
    }
    setOpen(true);
    setErrorMsg(null);
    setSuccess(false);
    setAmount("");
    setRemarks("");
  };

  const handleClose = () => {
    setOpen(false);
    setErrorMsg(null);
    setSuccess(false);
    setAmount("");
    setRemarks("");
  };

  const isPersonalInfoComplete = (info?: {
    name?: string;
    mobile?: string;
    country?: string;
    gender?: string;
  }) => {
    return info && info.name && info.mobile && info.country && info.gender;
  };
  const isAccountDetailsComplete = (account?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
    fullNameInBank?: string;
  }) => {
    return (
      account &&
      account.accountNumber &&
      account.ifscCode &&
      account.bankName &&
      account.branch &&
      account.fullNameInBank
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccess(false);
    // Check info completeness
    if (!isPersonalInfoComplete(personalInfo)) {
      setOpen(false);
      if (onBlock)
        onBlock(
          "Please complete your personal information before requesting a withdrawal."
        );
      return;
    }
    if (!isAccountDetailsComplete(accountDetails)) {
      setOpen(false);
      if (onBlock)
        onBlock(
          "Please add your bank account details before requesting a withdrawal."
        );
      return;
    }
    // Check balance
    if (availableBalance !== undefined && Number(amount) > availableBalance) {
      setErrorMsg("Withdrawal amount exceeds available balance.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<{
        success: boolean;
        withdrawal?: Withdrawal;
        error?: string;
      }>("post", "/api/v1/user/withdrawal-request", {
        data: { amount: Number(amount), remarks },
      });
      if (!data.success) throw new Error(data.error || "Request failed");
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        if (onRequestSuccess) onRequestSuccess();
      }, 1000);
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Something went wrong";
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
    <>
      <button
        className="bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-xl shadow hover:bg-green-200 transition"
        onClick={handleOpen}
      >
        Withdraw
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-md z-10 flex flex-col gap-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 className="text-xl font-bold mb-2">Withdrawal Request</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="number"
                  min={1}
                  step={1}
                  required
                  placeholder="Amount (₹)"
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                />
                <textarea
                  placeholder="Remarks (optional)"
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={loading}
                  rows={2}
                />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && (
                  <div className="text-green-600 text-sm">
                    Request submitted!
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WithdrawButtonWithModal;
