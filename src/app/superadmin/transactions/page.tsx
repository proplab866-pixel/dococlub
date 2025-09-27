"use client";

import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FaRegCopy, FaCheck } from "react-icons/fa";
import { apiRequest } from "@/utils/api";
import { useError } from "@/context/ErrorContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatINR, formatDateTimeIndian } from "@/utils/api";

interface Transaction {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
  };
  type: string;
  amount: number;
  date: string;
  status: string;
  transactionId: string;
}

export default function SuperadminTransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setErrorMsg] = useState<string | null>(null);
  const { setError } = useError();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Helper to shorten transaction ID
  function shortTxId(id: string) {
    if (!id) return "-";
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  }

  // Copy to clipboard handler
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (typeFilter) params.append("type", typeFilter);
        if (statusFilter) params.append("status", statusFilter);
        params.append("page", page.toString());
        params.append("limit", "20");
        const data = await apiRequest<{
          success: boolean;
          transactions: Transaction[];
          pagination?: {
            currentPage: number;
            totalPages: number;
            total: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
          };
          error?: string;
        }>("get", `/api/v1/superadmin/transactions?${params.toString()}`);
        if (data.success) {
          setTransactions(data.data.transactions);
          setPagination(data.data.pagination || null);
        } else {
          setErrorMsg(data.error || "Failed to fetch transactions");
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch transactions";
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
    fetchTransactions();
  }, [search, typeFilter, statusFilter, page, setError]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
    setPage(1);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-4 md:px-8 py-4 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow mb-6 sm:mb-8">
        All Transactions
      </h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center mb-6 w-full">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by user name, email, or mobile..."
            value={search}
            onChange={handleSearchChange}
            className="px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:border-indigo-400 bg-white shadow-sm w-full pr-10"
          />
          <FaSearch className="text-indigo-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
        <select
          value={typeFilter}
          onChange={handleTypeChange}
          className="px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:border-indigo-400 bg-white shadow-sm w-full sm:w-auto"
        >
          <option value="all">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
          <option value="investment">Investment</option>
          <option value="daily_return">Daily Return</option>
          <option value="referral_commission">Referral Commission</option>
        </select>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:border-indigo-400 bg-white shadow-sm w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      {/* Only the table is horizontally scrollable */}
      <div className="rounded-2xl shadow-xl bg-white w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-lg text-red-500">
              {error}
            </div>
          ) : (
            <table className="min-w-full text-sm border-separate border-spacing-y-1">
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-indigo-50 to-indigo-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, i) => (
                    <tr
                      key={tx._id}
                      className={i % 2 === 0 ? "bg-indigo-50" : ""}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap border-b border-indigo-100">
                        {tx.userId?.name || "-"}
                      </td>
                      <td className="py-3 px-4 text-indigo-700 whitespace-nowrap border-b border-indigo-100">
                        {tx.userId?.email || "-"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap border-b border-indigo-100">
                        {tx.userId?.mobile || "-"}
                      </td>
                      <td className="py-3 px-4 capitalize whitespace-nowrap border-b border-indigo-100">
                        {tx.type.replace("_", " ")}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-700 whitespace-nowrap border-b border-indigo-100">
                        ₹{formatINR(tx.amount)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap border-b border-indigo-100">
                        {formatDateTimeIndian(tx.date)}
                      </td>
                      <td className="py-3 px-4 border-b border-indigo-100">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            tx.status === "completed" ||
                            tx.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : tx.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap border-b border-indigo-100">
                        <span className="inline-flex items-center gap-1">
                          {shortTxId(tx.transactionId)}
                          <button
                            className="ml-1 p-1 rounded hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            title="Copy Transaction ID"
                            onClick={() => handleCopy(tx.transactionId)}
                            type="button"
                          >
                            {copiedId === tx.transactionId ? (
                              <FaCheck className="text-green-600 w-4 h-4" />
                            ) : (
                              <FaRegCopy className="text-indigo-400 w-4 h-4" />
                            )}
                          </button>
                          {copiedId === tx.transactionId && (
                            <span className="ml-1 text-green-600 text-xs font-semibold">
                              Copied!
                            </span>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-8">
          <button
            className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="font-semibold text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold disabled:opacity-50"
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
