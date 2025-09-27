"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/api";
import { useError } from "@/context/ErrorContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatINR, formatDateTimeIndian } from "@/utils/api";

interface Deposit {
  _id: string;
  amount: number;
  date: string;
  status: string;
  transactionId: string;
  utrNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    availableBalance: number;
  };
}

export default function UserDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
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

  const [confirmingDeposit, setConfirmingDeposit] = useState<Deposit | null>(
    null
  );

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

  function shortTxId(id: string) {
    if (!id) return "-";
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  }

  useEffect(() => {
    const fetchDeposits = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await apiRequest<{
          success: boolean;
          transactions: Deposit[];
          pagination?: {
            currentPage: number;
            totalPages: number;
            total: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
          };
          error?: string;
        }>("get", `/api/v1/superadmin/deposits?page=${page}&limit=20`);

        if (data.success) {
          console.log(data.data.transactions);
          setDeposits(data.data.transactions || []);
          setPagination(data.data.pagination || null);
        } else {
          setErrorMsg(data.error || "Failed to fetch deposits");
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch deposits";
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

    fetchDeposits();
  }, [page, setError]);

  const approveDeposit = async (transactionId: string) => {
    setLoading(true); // show loader

    try {

      const res = await apiRequest<{
        success: boolean;
        message?: string;
        deposit?: Deposit;
        user?: { availableBalance: number };
        error?: string;
      }>(
        "post",
        "/api/v1/superadmin/approve-deposits",
        { data: { transactionId } }
      );

      if (res.success) {
        // Update deposit status in table
        const data = await apiRequest<{
          success: boolean;
          transactions: Deposit[];
          pagination?: {
            currentPage: number;
            totalPages: number;
            total: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
          };
          error?: string;
        }>("get", `/api/v1/superadmin/deposits?page=${page}&limit=20`);

        if (data.success) {
          setDeposits(data.data.transactions || []);
          setPagination(data.data.pagination || null);
        } else {
          setErrorMsg(data.error || "Failed to fetch deposits");
        }

      } else {
        console.log(res.error || "Failed to approve deposit");
      }
    } catch (err) {
      console.log("Error approving deposit");
    } finally {
      setConfirmingDeposit(null);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-4 md:px-8 py-4 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow mb-6 sm:mb-8">
        Deposits Request
      </h1>

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
          ) : deposits.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No deposits found.
            </div>
          ) : (
            <table className="min-w-full text-sm border-separate border-spacing-y-1">
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-indigo-50 to-indigo-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    User
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
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    UTR Number
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {deposits.map((deposit, i) => (
                  <tr
                    key={deposit._id}
                    className={i % 2 === 0 ? "bg-indigo-50" : ""}
                  >
                    <td className="py-3 px-4 font-semibold text-indigo-700 border-b border-indigo-100">
                      {deposit.userId?.name || "-"}
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-700 whitespace-nowrap border-b border-indigo-100">
                      ₹{formatINR(deposit.amount)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap border-b border-indigo-100">
                      {formatDateTimeIndian(deposit.date)}
                    </td>
                    <td className="py-3 px-4 border-b border-indigo-100">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${deposit.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : deposit.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {deposit.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap border-b border-indigo-100">
                      {deposit.transactionId?.slice(0, 6)}...
                      {deposit.transactionId?.slice(-4)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap border-b border-indigo-100">
                      {deposit.utrNumber || "-"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap border-b border-indigo-100">
                      {deposit.status === "pending" && (
                        <button
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-semibold"
                          onClick={() => setConfirmingDeposit(deposit)}
                        >
                          Accept
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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

      {/* Confirmation Modal */}
      {confirmingDeposit && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-indigo-700 text-center">
              Confirm Deposit
            </h2>
            <p className="mb-6 text-center">
              Approve deposit of ₹{formatINR(confirmingDeposit.amount)} for{" "}
              {confirmingDeposit.userId?.name}?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-semibold"
                onClick={() => setConfirmingDeposit(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
                onClick={() =>
                  approveDeposit(confirmingDeposit._id)
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
