"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiRequest } from "@/utils/api";
import { FaCopy } from "react-icons/fa";
import { formatDateTimeIndian } from "@/utils/api";

interface Transaction {
  transactionId: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

interface WithdrawalRequest {
  amount: number;
  status: string;
  remarks?: string;
  createdAt: string;
}

// Helper to shorten transaction ID
function shortTxId(id: string) {
  if (id.length <= 10) return id;
  return id.slice(0, 4) + "..." + id.slice(-4);
}

// Helper to format INR currency in Indian style
function formatINR(amount: number) {
  return amount.toLocaleString("en-IN");
}

export default function TransactionHistoryPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: "all",
    status: "all",
    date: "",
  });
  const [txPage, setTxPage] = useState(1);
  const [txHasMore, setTxHasMore] = useState(false);
  const [wdPage, setWdPage] = useState(1);
  const [wdHasMore, setWdHasMore] = useState(false);
  const TX_LIMIT = 10;
  const WD_LIMIT = 10;
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fetchTransactions = async (page = 1, append = false) => {
    try {
      const baseUrl = `/api/v1/user/transac-history?page=${page}&limit=${TX_LIMIT}`;
      const params = [];
      if (filter.type !== "all") params.push(`type=${filter.type}`);
      if (filter.status !== "all") params.push(`status=${filter.status}`);
      if (filter.date) params.push(`date=${filter.date}`);
      const url = params.length ? `${baseUrl}&${params.join("&")}` : baseUrl;
      const data = await apiRequest<{
        success: boolean;
        transactions: Transaction[];
        pagination?: { hasNextPage: boolean };
        error?: string;
      }>("get", url);
      if (!data.success)
        throw new Error(data.error || "Failed to fetch transactions");
      setTransactions((prev) =>
        append
          ? [...prev, ...(data.data.transactions || [])]
          : data.data.transactions || []
      );
      setTxHasMore(data.data.pagination?.hasNextPage || false);
    } catch (err: unknown) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const fetchWithdrawals = async (page = 1, append = false) => {
    try {
      const url = `/api/v1/user/withdrawal-request?page=${page}&limit=${WD_LIMIT}`;
      const data = await apiRequest<{
        success: boolean;
        requests: WithdrawalRequest[];
        pagination?: { hasNextPage: boolean };
        error?: string;
      }>("get", url);
      if (!data.success)
        throw new Error(data.error || "Failed to fetch withdrawals");
      setWithdrawals((prev) =>
        append
          ? [...prev, ...(data.data.requests || [])]
          : data.data.requests || []
      );
      setWdHasMore(data.data.pagination?.hasNextPage || false);
    } catch (err: unknown) {
      console.error("Failed to fetch withdrawals:", err);
    }
  };

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    setLoading(true);
    setTxPage(1);
    setWdPage(1);
    // Optimize: fetch both transactions and withdrawals in parallel
    Promise.all([
      fetchTransactions(1, false),
      fetchWithdrawals(1, false),
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [filter]);

  const handleShowMoreTx = () => {
    const nextPage = txPage + 1;
    setTxPage(nextPage);
    fetchTransactions(nextPage, true);
  };
  const handleShowMoreWd = () => {
    const nextPage = wdPage + 1;
    setWdPage(nextPage);
    fetchWithdrawals(nextPage, true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-[#f9f9fb]">
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Transaction & Withdrawal History
        </h1>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 bg-white rounded-2xl shadow-md p-4">
          <select
            value={filter.type}
            onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="referral_commission">Referral Commission</option>
            <option value="daily_return">Daily Return</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) =>
              setFilter((f) => ({ ...f, status: e.target.value }))
            }
            className="border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="inline-block w-2 h-6 bg-blue-400 rounded-full mr-2" />
            <span className="font-semibold text-lg text-gray-800">
              All Transactions
            </span>
          </div>
          {transactions.length === 0 ? (
            <div className="text-gray-400 mb-6 text-center py-8">
              No transactions found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b">
                      <th className="py-2 px-2 text-left">Type</th>
                      <th className="py-2 px-2 text-left">Amount</th>
                      <th className="py-2 px-2 text-left">Date</th>
                      <th className="py-2 px-2 text-left">Status</th>
                      <th className="py-2 px-2 text-left">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => (
                      <tr
                        key={tx.transactionId || idx}
                        className="border-b last:border-0 hover:bg-blue-50 transition"
                      >
                        <td className="py-2 px-2 capitalize font-medium text-gray-700">
                          {tx.type}
                        </td>
                        <td className="py-2 px-2 font-semibold text-blue-700">
                          ₹ {formatINR(tx.amount)}
                        </td>
                        <td className="py-2 px-2 text-gray-500">
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
                                : tx.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : tx.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-500 font-mono break-all flex items-center gap-2">
                          {shortTxId(tx.transactionId)}
                          <button
                            className="ml-1 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition relative"
                            onClick={() => {
                              navigator.clipboard.writeText(tx.transactionId);
                              setCopiedIdx(idx);
                              setTimeout(() => setCopiedIdx(null), 1200);
                            }}
                            title="Copy Transaction ID"
                          >
                            <FaCopy />
                            {copiedIdx === idx && (
                              <span className="absolute min-w-fit left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-xs rounded shadow z-10">
                                Copied!
                              </span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {txHasMore && (
                <div className="flex justify-center mt-4">
                  <button
                    className="px-6 py-2 bg-blue-100 text-blue-700 font-semibold rounded-xl shadow hover:bg-blue-200 transition"
                    onClick={handleShowMoreTx}
                  >
                    Show More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {/* Withdrawals Table */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="inline-block w-2 h-6 bg-pink-400 rounded-full mr-2" />
            <span className="font-semibold text-lg text-pink-700">
              All Withdrawal Requests
            </span>
          </div>
          {withdrawals.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No withdrawal requests found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-600 border-b">
                      <th className="py-2 text-left">Amount (₹)</th>
                      <th className="py-2 text-left">Date</th>
                      <th className="py-2 text-left">Status</th>
                      <th className="py-2 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((req, idx) => (
                      <tr
                        key={idx}
                        className="border-b last:border-0 hover:bg-pink-50 transition"
                      >
                        <td className="py-2 font-semibold text-pink-700">
                          ₹ {formatINR(req.amount)}
                        </td>
                        <td className="py-2 text-gray-500">
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
              </div>
              {wdHasMore && (
                <div className="flex justify-center mt-4">
                  <button
                    className="px-6 py-2 bg-pink-100 text-pink-700 font-semibold rounded-xl shadow hover:bg-pink-200 transition"
                    onClick={handleShowMoreWd}
                  >
                    Show More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
