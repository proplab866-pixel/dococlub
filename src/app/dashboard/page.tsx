"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  FaCheckCircle,
  FaUser,
  FaWallet,
  FaUsers,
  FaRegFileAlt,
  FaRegAddressCard,
  FaArrowRight,
  FaMoneyCheckAlt,
  FaExclamationCircle,
  FaCopy,
  FaShareAlt,
} from "react-icons/fa";
import { DepositButtonWithModal } from "@/components/DepositButtonWithModal";
import WithdrawButtonWithModal from "@/components/WithdrawButtonWithModal";
import { motion, AnimatePresence } from "framer-motion";
import { referralLevel1, referralLevel2, referralLevel3 } from "@/constants";
import { useRef } from "react";
import { apiRequest } from "@/utils/api";
import Link from "next/link";
import { formatDateTimeIndian } from "@/utils/api";

// Patch: Extend User type locally to include dashboard fields

type DashboardUser = ReturnType<typeof useAuth>["user"] & {
  plan?: string;
  commissionRate?: number;
  day?: number;
  dayMax?: number;
};

// Add type for withdrawal requests
interface WithdrawalRequest {
  amount: number;
  status: string;
  remarks?: string;
  createdAt: string;
}

// Add types for plan purchase history and available plans
interface Investment {
  planId: string;
  amount: number;
  startDate: string | Date;
  daysCompleted: number;
  isActive: boolean;
  plan?: {
    name: string;
    invest: number;
    daily: number;
    days: number;
    roi: number;
    badge?: string;
  } | null;
}
interface AvailablePlan {
  _id: string;
  name: string;
  invest: number;
  daily: number;
  days: number;
  roi: number;
  badge?: string;
}

interface AccountDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  fullNameInBank: string;
}

// Add rotating ads for the error modal
const ADS = [
  {
    text: "🎁 Refer friends and earn up to 28% commission on their investments!",
    color: "from-yellow-300 to-pink-300",
  },
  {
    text: "🚀 Invest now and unlock exclusive rewards!",
    color: "from-blue-400 to-teal-400",
  },
  {
    text: "💡 Secure, reliable, and rewarding investments only at DocoClub!",
    color: "from-green-300 to-blue-300",
  },
];

// Helper to format INR currency in Indian style
function formatINR(amount: number) {
  return amount.toLocaleString('en-IN');
}

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const {
    user,
    transactions,
    loading: dataLoading,
    error,
  } = useDashboardData();

  // Local state for balance to allow immediate UI update after deposit
  const [localBalance, setLocalBalance] = useState<number | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [investLoading, setInvestLoading] = useState<string | null>(null);
  const [investError, setInvestError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [adIndex, setAdIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<NodeJS.Timeout | null>(null);

  // State for account details and modal for withdrawal block
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(
    null
  );
  const [withdrawBlockModal, setWithdrawBlockModal] = useState<string | null>(
    null
  );

  // Rotate ads every 4 seconds in the modal
  useEffect(() => {
    if (!modalError) return;
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % ADS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [modalError]);

  // Show all dashboard API errors in the modal.
  useEffect(() => {
    if (error) setModalError(error);
  }, [error]);
  useEffect(() => {
    if (investError) setModalError(investError);
  }, [investError]);
  useEffect(() => {
    if (withdrawalError) setModalError(withdrawalError);
  }, [withdrawalError]);

  const fetchWithdrawalRequests = useCallback(async () => {
    setWithdrawalLoading(true);
    setWithdrawalError(null);
    try {
      const data = await apiRequest<{
        success: boolean;
        requests: WithdrawalRequest[];
        error?: string;
      }>("get", "/api/v1/user/withdrawal-request");
      setWithdrawalRequests(
        data.success && data.data.requests ? data.data.requests : []
      );
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to fetch withdrawal requests";
      setWithdrawalError(msg);
    } finally {
      setWithdrawalLoading(false);
    }
  }, []);

  // Invest in a plan
  const handleInvest = async (planId: string) => {
    setInvestLoading(planId);
    setInvestError(null);
    try {
      const data = await apiRequest<{
        success: boolean;
        error?: string;
        availableBalance?: number;
      }>("post", "/api/v1/user/invest-in-plan", {
        data: { planId },
      });
      if (data.success) {
        // Refresh plans and investments
        const [history, plans] = await Promise.all([
          apiRequest<{ success: boolean; investments: Investment[] }>(
            "get",
            "/api/v1/user/plan-purchase-history"
          ),
          apiRequest<{ success: boolean; plans: AvailablePlan[] }>(
            "get",
            "/api/v1/get-investment-plans"
          ),
        ]);
        if (history.success && history.data.investments)
          setInvestments(history.data.investments);
        if (plans.success && plans.data.plans)
          setAvailablePlans(plans.data.plans);
        if (typeof data.data?.availableBalance === "number")
          setLocalBalance(data.data.availableBalance);
      } else {
        setInvestError(data.error || "Investment failed");
      }
    } catch (err: unknown) {
      const msg =
        getErrorMessage(err) || "Investment failed. Please try again.";
      setInvestError(msg);
    } finally {
      setInvestLoading(null);
    }
  };

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [fetchWithdrawalRequests]);

  // Fetch plan purchase history and available plans
  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const [history, plans] = await Promise.all([
          apiRequest<{ success: boolean; investments: Investment[] }>(
            "get",
            "/api/v1/user/plan-purchase-history"
          ),
          apiRequest<{ success: boolean; plans: AvailablePlan[] }>(
            "get",
            "/api/v1/get-investment-plans"
          ),
        ]);
        if (history.success && history.data.investments)
          setInvestments(history.data.investments);
        if (plans.success && plans.data.plans)
          setAvailablePlans(plans.data.plans);
      } catch (err: unknown) {
        setModalError(getErrorMessage(err) || "Failed to fetch plans.");
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Fetch account details on mount
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const data = await apiRequest<{
          success: boolean;
          account: AccountDetails | null;
          error?: string;
        }>("get", "/api/v1/user/account-details");
        if (data.success && data.data.account)
          setAccountDetails(data.data.account);
      } catch (err: unknown) {
        setModalError(
          getErrorMessage(err) || "Failed to fetch account details."
        );
      }
    };
    fetchAccount();
  }, []);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (!authLoading && authUser && authUser.role === "superadmin") {
      router.replace("/superadmin/dashboard");
    }
  }, [authUser, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!authUser) {
    return null; // Will redirect to login
  }

  // Use real data from API with fallbacks
  const displayUser: DashboardUser = (user || authUser) as DashboardUser;
  const balance =
    localBalance !== null ? localBalance : displayUser?.availableBalance || 0;
  const balanceDate = formatDateTimeIndian(new Date());
  const commissionRate = displayUser?.commissionRate ?? 0;
  const referrals =
    (displayUser?.level1Referrals?.length || 0) +
    (displayUser?.level2Referrals?.length || 0) +
    (displayUser?.level3Referrals?.length || 0);
  const invitationCode = displayUser?.referalCode || "Not assigned";
  const referralLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/signup?ref=${invitationCode}`;

  // Navigation handlers
  const goTo = (path: string) => router.push(path);

  return (
    <div className="flex flex-col bg-[#f9f9fb]">
      {/* Floating Error Modal */}
      <AnimatePresence>
        {modalError && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full relative flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
                onClick={() => setModalError(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="flex flex-col items-center mb-4">
                <FaExclamationCircle className="text-red-500 text-4xl mb-2 animate-bounce" />
                <div className="text-lg font-bold text-gray-800 mb-1">
                  Oops! Something went wrong
                </div>
                <div className="text-gray-600 text-center mb-2">
                  {modalError}
                </div>
              </div>
              {/* Rotating Ad Banner */}
              <div
                className={`w-full rounded-xl py-2 px-4 text-center font-semibold text-base bg-gradient-to-r ${ADS[adIndex].color} text-teal-900 shadow mb-2 animate-pulse`}
              >
                {ADS[adIndex].text}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                If the problem persists, please try again later or contact
                support.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating modal for withdrawal block */}
      {withdrawBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full relative flex flex-col items-center"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setWithdrawBlockModal(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center mb-4">
              <FaExclamationCircle className="text-red-500 text-4xl mb-2 animate-bounce" />
              <div className="text-lg font-bold text-gray-800 mb-1">
                Withdrawal Blocked
              </div>
              <div className="text-gray-600 text-center mb-2">
                {withdrawBlockModal}
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                onClick={() => {
                  setWithdrawBlockModal(null);
                  router.push("/dashboard/personal-info");
                }}
              >
                Personal Info
              </button>
              <button
                className="px-6 py-2 bg-yellow-400 text-teal-900 rounded-lg font-bold shadow hover:bg-yellow-500 transition"
                onClick={() => {
                  setWithdrawBlockModal(null);
                  router.push("/dashboard/account-details");
                }}
              >
                Account Details
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Ad Banner */}
      <div className="w-full bg-gradient-to-r from-yellow-300 to-pink-300 text-center py-3 text-base md:text-lg font-semibold text-teal-900 shadow-md rounded-b-2xl mb-4">
        🎁{" "}
        <span className="font-bold">
          Refer friends and earn up to 28% commission on their investments!
        </span>
      </div>

      {/* Profile Section */}
      <section className="bg-[#f2f5f7] rounded-b-3xl pt-8 pb-4 px-4 flex flex-col items-center relative">
        <UserAvatar
          name={displayUser?.name || "User"}
          size="xl"
          className="border-4 border-white shadow-lg mb-2"
        />
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-800">
            {displayUser?.name || "User"}
          </span>
          <FaCheckCircle className="text-blue-500" title="Verified" />
        </div>
        <div className="text-xs text-gray-500 font-medium mt-1">
          {displayUser.email}
        </div>
      </section>
      <section className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {/* Balance Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-yellow-500 text-lg mb-1">
              <FaWallet />
              <span className="font-semibold">Available Balance</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">{balanceDate}</div>
            <div className="text-2xl font-bold text-gray-800">
              ₹ {formatINR(balance)}/-
            </div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <DepositButtonWithModal
              // user={displayUser}
              // onBalanceUpdate={setLocalBalance}
            />
            <WithdrawButtonWithModal
              onRequestSuccess={fetchWithdrawalRequests}
              availableBalance={balance}
              personalInfo={{
                name: displayUser?.name,
                mobile: displayUser?.mobile,
                country: displayUser?.country,
                gender: displayUser?.gender,
              }}
              accountDetails={accountDetails || undefined}
              onBlock={setWithdrawBlockModal}
            />
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-xs text-gray-400 mb-1">Invitation code</span>
            <span className="font-semibold text-gray-700 flex items-center gap-2">
              {invitationCode}
              <button
                className="ml-2 p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition relative"
                onClick={() => {
                  navigator.clipboard.writeText(invitationCode);
                  setCopied(true);
                  if (copyTimeout.current) clearTimeout(copyTimeout.current);
                  copyTimeout.current = setTimeout(
                    () => setCopied(false),
                    1200
                  );
                }}
                title="Copy code"
              >
                <FaCopy />
                {copied && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-xs rounded shadow z-10">
                    Copied!
                  </span>
                )}
              </button>
              <button
                className="ml-2 p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-green-600 transition relative"
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  setCopied(true);
                  if (copyTimeout.current) clearTimeout(copyTimeout.current);
                  copyTimeout.current = setTimeout(
                    () => setCopied(false),
                    1200
                  );
                }}
                title="Share referral link"
              >
                <FaShareAlt />
                {copied && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-xs rounded shadow z-10">
                    Copied!
                  </span>
                )}
              </button>
            </span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-xs text-gray-400 mb-1">Commision rate</span>
            <span className="flex items-center gap-1 font-semibold text-green-600">
              <FaCheckCircle className="text-green-400" size={16} />
              {commissionRate}%
            </span>
          </div>
          <Link
            href={"/dashboard/team-reports"}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-start"
          >
            <span className="text-xs text-gray-400 mb-1">Referrals</span>
            <span className="font-semibold text-blue-600">{referrals}</span>
          </Link>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-xs text-gray-400 mb-1">
              Total Daily Earnings
            </span>
            <span className="flex items-center gap-1 font-semibold text-purple-600">
              <FaRegFileAlt />₹
              {formatINR(
                investments
                  .filter((inv) => inv.isActive)
                  .reduce((sum, inv) => sum + (inv.plan?.daily || 0), 0)
              )}
            </span>
          </div>
          {/* Referral Commission Rates */}
          <div className="col-span-2 bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-xs text-gray-400 mb-1">
              Referral Commission Rates
            </span>
            <span className="text-sm text-gray-700">
              Level 1:{" "}
              <span className="font-semibold text-green-700">
                {referralLevel1}%
              </span>{" "}
              &nbsp;|&nbsp; Level 2:{" "}
              <span className="font-semibold text-blue-700">
                {referralLevel2}%
              </span>{" "}
              &nbsp;|&nbsp; Level 3:{" "}
              <span className="font-semibold text-yellow-700">
                {referralLevel3}%
              </span>
            </span>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="space-y-4 mb-8">
          <button
            className="w-full flex items-center gap-4 bg-yellow-50 hover:bg-yellow-100 transition rounded-2xl p-5 shadow text-left font-semibold text-yellow-700 text-lg"
            onClick={() => goTo("/dashboard/personal-info")}
          >
            <FaUser className="text-yellow-400" size={28} /> Personal
            Information
            <FaArrowRight className="ml-auto" />
          </button>
          <button
            className="w-full flex items-center gap-4 bg-teal-50 hover:bg-teal-100 transition rounded-2xl p-5 shadow text-left font-semibold text-teal-700 text-lg"
            onClick={() => goTo("/dashboard/transaction-history")}
          >
            <FaWallet className="text-teal-400" size={28} /> Transaction History
            <FaArrowRight className="ml-auto" />
          </button>
          <button
            className="w-full flex items-center gap-4 bg-blue-50 hover:bg-blue-100 transition rounded-2xl p-5 shadow text-left font-semibold text-blue-700 text-lg"
            onClick={() => goTo("/dashboard/account-details")}
          >
            <FaRegAddressCard className="text-blue-400" size={28} /> Account
            Details
            <FaArrowRight className="ml-auto" />
          </button>
          <button
            className="w-full flex items-center gap-4 bg-pink-50 hover:bg-pink-100 transition rounded-2xl p-5 shadow text-left font-semibold text-pink-700 text-lg"
            onClick={() => goTo("/dashboard/team-reports")}
          >
            <FaUsers className="text-pink-400" size={28} /> Team Reports
            <FaArrowRight className="ml-auto" />
          </button>
        </div>

        {/* Mid-page Ad Banner */}
        <div className="w-full bg-gradient-to-r from-blue-400 to-teal-400 text-center py-3 text-base md:text-lg font-semibold text-white shadow-md rounded-2xl mb-8">
          🚀{" "}
          <span className="font-bold">
            Invest now and unlock exclusive rewards!
          </span>
        </div>

        {/* Investment Section */}
        {plansLoading ? (
          <div className="text-center py-8 text-gray-500">Loading plans...</div>
        ) : investments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8 text-center">
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              No Active Investments
            </h2>
            <p className="mb-4 text-gray-600">
              You have not purchased any investment plan yet. Start your journey
              by choosing a plan below!
            </p>
            {availablePlans.length === 0 ? (
              <div className="text-gray-400">
                No plans available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePlans.map((plan, i) => (
                  <div
                    key={i}
                    className="border rounded-xl p-4 shadow flex flex-col items-start bg-yellow-50"
                  >
                    <div className="font-bold text-lg text-yellow-700 mb-1">
                      {plan.name}
                    </div>
                    <div className="text-gray-700 mb-1">
                      Invest:{" "}
                      <span className="font-semibold">₹{formatINR(plan.invest)}</span>
                    </div>
                    <div className="text-gray-700 mb-1">
                      Daily Return:{" "}
                      <span className="font-semibold">₹{formatINR(plan.daily)}</span>
                    </div>
                    <div className="text-gray-700 mb-1">
                      Duration:{" "}
                      <span className="font-semibold">{plan.days} days</span>
                    </div>
                    <div className="text-gray-700 mb-1">
                      ROI: <span className="font-semibold">{plan.roi}%</span>
                    </div>
                    {plan.badge && (
                      <div className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                        {plan.badge}
                      </div>
                    )}
                    <button
                      className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold shadow hover:bg-yellow-600 transition disabled:opacity-60"
                      onClick={() => handleInvest(plan._id)}
                      disabled={!!investLoading}
                    >
                      {investLoading === plan._id
                        ? "Processing..."
                        : "Invest Now"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              Your Active Investments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investments.map((inv, i) => (
                <div
                  key={i}
                  className="border rounded-xl p-4 shadow flex flex-col items-start bg-green-50"
                >
                  <div className="font-bold text-lg text-green-700 mb-1">
                    {inv.plan?.name || "Plan"}
                  </div>
                  <div className="text-gray-700 mb-1">
                    Invested:{" "}
                    <span className="font-semibold">₹{formatINR(inv.amount)}</span>
                  </div>
                  <div className="text-gray-700 mb-1">
                    Daily Return:{" "}
                    <span className="font-semibold">₹{formatINR(inv.plan?.daily || 0)}</span>
                  </div>
                  <div className="text-gray-700 mb-1">
                    Duration:{" "}
                    <span className="font-semibold">{inv.plan?.days} days</span>
                  </div>
                  <div className="text-gray-700 mb-1">
                    Progress:{" "}
                    <span className="font-semibold">
                      {inv.daysCompleted} / {inv.plan?.days} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (inv.daysCompleted / (inv.plan?.days || 1)) * 100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                  {inv.plan?.badge && (
                    <div className="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded mt-1">
                      {inv.plan.badge}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Started: {formatDateTimeIndian(inv.startDate)}
                  </div>
                  {!inv.isActive && (
                    <div className="text-xs text-red-500 mt-1">Completed</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaMoneyCheckAlt className="text-teal-500 mr-2" />
            <span className="font-semibold text-lg text-gray-800">
              Recent Transactions
            </span>
          </div>
          {transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-2 px-2 text-left">Type</th>
                    <th className="py-2 px-2 text-left">Amount</th>
                    <th className="py-2 px-2 text-left">Date</th>
                    <th className="py-2 px-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((tx, idx) => (
                    <tr
                      key={tx.transactionId || idx}
                      className="border-b last:border-0"
                    >
                      <td className="py-2 px-2 capitalize">{tx.type}</td>
                      <td className="py-2 px-2">
                        ₹ {formatINR(tx.amount)}
                      </td>
                      <td className="py-2 px-2">
                        {formatDateTimeIndian(tx.date)}
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold 
                          ${
                            tx.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : tx.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <FaExclamationCircle /> No recent transactions found.
            </div>
          )}
        </div>

        {/* Withdrawal Request History */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Withdrawal Request History</h3>
          {withdrawalLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : withdrawalError ? (
            <div className="text-red-500">{withdrawalError}</div>
          ) : withdrawalRequests.length === 0 ? (
            <div className="text-gray-500">No withdrawal requests found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Amount (₹)</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalRequests
                  .filter((req) => req.status === "pending")
                  .slice(0, 5)
                  .map((req, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 font-semibold">{req.amount}</td>
                      <td className="py-2">
                        {formatDateTimeIndian(req.createdAt)}
                      </td>
                      <td className="py-2 capitalize">
                        <span
                          className={
                            req.status === "pending"
                              ? "text-yellow-600"
                              : req.status === "approved"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-2">{req.remarks || "-"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
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
