"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { referralLevel1, referralLevel2, referralLevel3 } from "@/constants";
import { apiRequest } from "@/utils/api";
import { useError } from "@/context/ErrorContext";
import { formatINR, formatDateTimeIndian } from "@/utils/api";

interface ReferralUser {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  totalInvested?: number;
}
interface UserWithReferrals {
  level1Referrals?: string[];
  level2Referrals?: string[];
  level3Referrals?: string[];
}

interface ReferralCommissionTx {
  amount: number;
  date: string;
  planId?: string;
  userId?: string;
  transactionId: string;
  status: string;
  sourceUserId?: string; // Added sourceUserId
}

export default function TeamReportsPage() {
  const { loading: authLoading } = useAuth();
  const [user, setUser] = useState<UserWithReferrals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErrorMsg] = useState<string | null>(null);
  const [commissionTxs, setCommissionTxs] = useState<ReferralCommissionTx[]>(
    []
  );
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

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await apiRequest<{
          success: boolean;
          user: UserWithReferrals;
          error?: string;
        }>("get", "/api/v1/user/personal-info");
        if (!data.success)
          throw new Error(data.error || "Failed to fetch user info");
        setUser(data.data.user);
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch user info";
        setErrorMsg(msg);
        setError({
          message: msg,
          solution:
            "Please try refreshing the page or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [setError]);

  useEffect(() => {
    // Fetch all referral_commission transactions for this user
    const fetchCommissions = async () => {
      try {
        const data = await apiRequest<{
          success: boolean;
          transactions: ReferralCommissionTx[];
          error?: string;
        }>(
          "get",
          "/api/v1/user/transac-history?type=referral_commission&limit=1000"
        );
        if (data.success) setCommissionTxs(data.data.transactions || []);
      } catch (err: unknown) {
        setError({
          message:
            getErrorMessage(err) || "Failed to fetch referral commissions.",
          solution:
            "Please try refreshing the page or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      }
    };
    fetchCommissions();
  }, [setError]);

  // Helper to get total commission for a level
  const getLevelCommission = (referrals: string[] | undefined) => {
    if (!referrals) return 0;
    return commissionTxs
      .filter((tx) => referrals.includes(String(tx.sourceUserId)))
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  // Helper to get total team size
  const getTeamSize = () => {
    return (
      (user?.level1Referrals?.length || 0) +
      (user?.level2Referrals?.length || 0) +
      (user?.level3Referrals?.length || 0)
    );
  };

  // Helper to get total commission
  const getTotalCommission = () => {
    return commissionTxs.reduce((sum, tx) => sum + tx.amount, 0);
  };

  const renderReferralList = (
    referrals: string[] | undefined,
    level: number,
    commissionRate: number
  ) => {
    if (!referrals || referrals.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2 text-gray-800">
          Level {level} Referrals
          <span className="ml-2 text-xs font-normal text-gray-500">
            (Commission Rate: {commissionRate}%)
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white rounded-xl shadow">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 px-2 text-left">Name</th>
                <th className="py-2 px-2 text-left">Email</th>
                <th className="py-2 px-2 text-left">Join Date</th>
                <th className="py-2 px-2 text-left">Total Invested</th>
                <th className="py-2 px-2 text-left">Commission Earned</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((refId) => (
                <ReferralRow key={refId} userId={refId} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-right text-xs text-gray-500 mt-1">
          Total Level {level} Commission: ₹
          {formatINR(getLevelCommission(referrals))}
        </div>
      </div>
    );
  };

  function ReferralRow({ userId }: { userId: string }) {
    const [refUser, setRefUser] = useState<ReferralUser | null>(null);
    useEffect(() => {
      const fetchRefUser = async () => {
        try {
          const data = await apiRequest<{
            success: boolean;
            user: ReferralUser;
            error?: string;
          }>("get", `/api/v1/user/personal-info?id=${userId}`);
          if (data.success) setRefUser(data.data.user);
        } catch (err: unknown) {
          setError({
            message:
              getErrorMessage(err) || "Failed to fetch referral user info.",
            solution:
              "Please try refreshing the page or contact support if the issue persists.",
            link: "/contact",
            linkText: "Contact Support",
          });
        }
      };
      fetchRefUser();
    }, [userId]);
    if (!refUser)
      return (
        <tr>
          <td colSpan={5}>
            <LoadingSpinner size="sm" />
          </td>
        </tr>
      );
    return (
      <tr>
        <td className="py-2 px-2 font-semibold text-gray-700">
          {refUser.name}
        </td>
        <td className="py-2 px-2 text-gray-500">{refUser.email}</td>
        <td className="py-2 px-2 text-gray-500">
          {refUser.createdAt ? formatDateTimeIndian(refUser.createdAt) : "-"}
        </td>
        <td className="py-2 px-2 text-gray-500">
          ₹{formatINR(refUser.totalInvested ?? 0)}
        </td>
        <td className="py-2 px-2 text-gray-500">
          ₹
          {formatINR(
            commissionTxs
              .filter((tx) => String(tx.sourceUserId) === String(userId))
              .reduce((sum, tx) => sum + tx.amount, 0)
          )}
        </td>
      </tr>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="text-red-500 font-bold mb-2">{error}</div>
            <div className="text-gray-500">Please try again later.</div>
          </div>
        </main>
      </div>
    );
  }

  const hasReferrals =
    !!user &&
    ((user.level1Referrals && user.level1Referrals.length > 0) ||
      (user.level2Referrals && user.level2Referrals.length > 0) ||
      (user.level3Referrals && user.level3Referrals.length > 0));

  return (
    <div className="w-full flex flex-col bg-[#f9f9fb]">
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Team Reports</h1>
        {!user || !hasReferrals ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
            You have no referrals yet. Share your invitation code to grow your
            team!
          </div>
        ) : (
          <>
            {/* Summary Section */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-gray-800 mb-1">
                  Team Summary
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Total Team Size:{" "}
                  <span className="font-semibold text-blue-700">
                    {getTeamSize()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Total Referral Earnings:{" "}
                  <span className="font-semibold text-green-700">
                    ₹{formatINR(getTotalCommission())}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
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
              </div>
            </div>
            {/* Level 1 Referrals */}
            {renderReferralList(user.level1Referrals, 1, referralLevel1)}
            {/* Level 2 Referrals */}
            {renderReferralList(user.level2Referrals, 2, referralLevel2)}
            {/* Level 3 Referrals */}
            {renderReferralList(user.level3Referrals, 3, referralLevel3)}
          </>
        )}
      </main>
    </div>
  );
}
