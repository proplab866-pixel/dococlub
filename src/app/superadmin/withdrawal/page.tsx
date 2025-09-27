"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import { apiRequest, formatINR, formatDateTimeIndian } from "@/utils/api";
import { useError } from "@/context/ErrorContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Withdrawal {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
  };
  amount: number;
  status: string;
  remarks?: string;
  createdAt: string;
}

function ConfirmActionModal({
  open,
  onClose,
  onConfirm,
  action,
  withdrawal,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "approve" | "reject" | null;
  withdrawal: Withdrawal | null;
  loading: boolean;
}) {
  if (!open || !withdrawal || !action) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-extrabold mb-4 text-teal-700 text-center">
          {action === "approve" ? "Approve" : "Reject"} Withdrawal Request
        </h2>
        <div className="mb-4 text-gray-700 text-center">
          Are you sure you want to{" "}
          <span
            className={
              action === "approve"
                ? "text-green-600 font-bold"
                : "text-red-600 font-bold"
            }
          >
            {action}
          </span>{" "}
          this withdrawal request?
        </div>
        <div className="mb-4 text-sm text-gray-500 text-center">
          <div>
            User:{" "}
            <span className="font-semibold text-gray-800">
              {withdrawal.user?.name}
            </span>
          </div>
          <div>
            Email:{" "}
            <span className="font-semibold text-gray-800">
              {withdrawal.user?.email}
            </span>
          </div>
          <div>
            Amount:{" "}
            <span className="font-semibold text-teal-700">
              ₹{formatINR(withdrawal.amount)}
            </span>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-semibold text-white ${
              action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? action === "approve"
                ? "Approving..."
                : "Rejecting..."
              : action === "approve"
              ? "Approve"
              : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperadminWithdrawalPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: "approve" | "reject" | null;
    withdrawal: Withdrawal | null;
  }>({ open: false, action: null, withdrawal: null });

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

  // Fetch withdrawals from API
  useEffect(() => {
    const fetchWithdrawals = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (statusFilter) params.append("status", statusFilter);
        params.append("page", page.toString());
        params.append("limit", "20");
        const data = await apiRequest<{
          success: boolean;
          withdrawals: Withdrawal[];
          pagination?: {
            currentPage: number;
            totalPages: number;
            total: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
          };
          error?: string;
        }>("get", `/api/v1/superadmin/withdrawals?${params.toString()}`);
        if (data.success) {
          setWithdrawals(data.data.withdrawals);
          setPagination(data.data.pagination || null);
        } else {
          setErrorMsg(data.error || "Failed to fetch withdrawal requests");
          setError({
            message: data.error || "Failed to fetch withdrawal requests.",
            solution:
              "Please try refreshing the page or contact support if the issue persists.",
            link: "/contact",
            linkText: "Contact Support",
          });
        }
      } catch (err: unknown) {
        const msg =
          getErrorMessage(err) || "Failed to fetch withdrawal requests";
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
    fetchWithdrawals();
  }, [search, statusFilter, page, setError]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleAction = (
    withdrawal: Withdrawal,
    action: "approve" | "reject"
  ) => {
    setConfirmModal({ open: true, action, withdrawal });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.withdrawal || !confirmModal.action) return;
    const { _id } = confirmModal.withdrawal;
    const action = confirmModal.action;
    setActionLoading(_id + action);
    try {
      const data = await apiRequest<{
        success: boolean;
        withdrawal: Withdrawal;
        error?: string;
      }>("patch", "/api/v1/superadmin/withdrawals", {
        data: { id: _id, action },
      });
      if (data.success) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w._id === _id
              ? {
                  ...w,
                  status: data.data.withdrawal.status,
                  remarks: data.data.withdrawal.remarks,
                }
              : w
          )
        );
        setConfirmModal({ open: false, action: null, withdrawal: null });
      } else {
        setErrorMsg(data.error || `Failed to ${action} withdrawal request`);
        setError({
          message: data.error || `Failed to ${action} withdrawal request`,
          solution:
            "Please try again or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      }
    } catch (err: unknown) {
      const msg =
        getErrorMessage(err) || `Failed to ${action} withdrawal request`;
      setErrorMsg(msg);
      setError({
        message: msg,
        solution: "Please try again or contact support if the issue persists.",
        link: "/contact",
        linkText: "Contact Support",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-4 md:px-8 py-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-teal-700 drop-shadow mb-6 sm:mb-8">
        Withdrawal Requests
      </h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by user name, email, or mobile..."
            value={search}
            onChange={handleSearchChange}
            className="px-4 py-2 rounded-lg border border-teal-200 focus:outline-none focus:border-teal-400 bg-white shadow-sm w-full pr-10"
          />
          <FaSearch className="text-teal-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-3 py-2 rounded-lg border border-teal-200 focus:outline-none focus:border-teal-400 bg-white shadow-sm w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="w-full overflow-x-auto rounded-2xl shadow-xl bg-white">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-lg text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-sm border-separate border-spacing-y-1">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-teal-50 to-teal-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                  User
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Amount (₹)
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w, i) => (
                  <tr key={w._id} className={i % 2 === 0 ? "bg-teal-50" : ""}>
                    <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap border-b border-teal-100">
                      {w.user?.name}
                    </td>
                    <td className="py-3 px-4 text-teal-700 whitespace-nowrap border-b border-teal-100">
                      {w.user?.email}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap border-b border-teal-100">
                      {w.user?.mobile}
                    </td>
                    <td className="py-3 px-4 font-bold text-teal-700 border-b border-teal-100">
                      ₹{formatINR(w.amount)}
                    </td>
                    <td className="py-3 px-4 border-b border-teal-100">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          w.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : w.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap border-b border-teal-100">
                      {formatDateTimeIndian(w.createdAt)}
                    </td>
                    <td className="py-3 px-4 flex gap-2 sm:gap-3 items-center border-b border-teal-100">
                      {w.status === "pending" && (
                        <>
                          <button
                            className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-400"
                            title="Approve"
                            onClick={() => handleAction(w, "approve")}
                          >
                            <FaCheck className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-400"
                            title="Reject"
                            onClick={() => handleAction(w, "reject")}
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-8">
          <button
            className="px-4 py-2 rounded-lg bg-teal-100 text-teal-700 font-semibold disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="font-semibold text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            className="px-4 py-2 rounded-lg bg-teal-100 text-teal-700 font-semibold disabled:opacity-50"
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
      {/* Confirm Action Modal */}
      <ConfirmActionModal
        open={confirmModal.open}
        onClose={() =>
          setConfirmModal({ open: false, action: null, withdrawal: null })
        }
        onConfirm={handleConfirmAction}
        action={confirmModal.action}
        withdrawal={confirmModal.withdrawal}
        loading={!!actionLoading}
      />
    </div>
  );
}
