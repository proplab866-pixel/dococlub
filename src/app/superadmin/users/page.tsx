"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaEye, FaTimes } from "react-icons/fa";
import { apiRequest, formatINR, formatDateTimeIndian } from "@/utils/api";
import { useError } from "@/context/ErrorContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  country?: string;
  gender?: string;
  availableBalance?: number;
  totalInvested?: number;
  referalCode?: string;
  referedBy?: string;
  isEmailVerified?: boolean;
  commissionRate?: number;
  createdAt?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function UserInfoModal({
  userId,
  open,
  onClose,
}: {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorMsg] = useState<string | null>(null);
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
    if (!userId || !open) return;
    setLoading(true);
    setErrorMsg(null);
    setUser(null);
    apiRequest<{
      success: boolean;
      user: User;
      error?: string;
    }>("get", `/api/v1/user/personal-info?id=${userId}`)
      .then((data) => {
        if (data.success) {
          setUser(data.data.user);
        } else {
          setErrorMsg(data.error || "Failed to fetch user info");
          setError({
            message: data.error || "Failed to fetch user info.",
            solution:
              "Please try refreshing the page or contact support if the issue persists.",
            link: "/contact",
            linkText: "Contact Support",
          });
        }
      })
      .catch((err: unknown) => {
        const msg = getErrorMessage(err) || "Failed to fetch user info";
        setErrorMsg(msg);
        setError({
          message: msg,
          solution:
            "Please try refreshing the page or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      })
      .finally(() => setLoading(false));
  }, [userId, open, setError]);

  if (!open) return null;

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
        <h2 className="text-2xl font-extrabold mb-4 text-blue-700 text-center">
          User Information
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : user ? (
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <span className="font-semibold text-gray-700">Name:</span>
              <span>{user.name}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-semibold text-gray-700">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-semibold text-gray-700">Mobile:</span>
              <span>{user.mobile}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-semibold text-gray-700">Role:</span>
              <span className="capitalize">{user.role}</span>
            </div>
            {user.country && (
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-700">Country:</span>
                <span>{user.country}</span>
              </div>
            )}
            {user.gender && (
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-700">Gender:</span>
                <span>{user.gender}</span>
              </div>
            )}
            {user.availableBalance !== undefined && (
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-700">
                  Available Balance:
                </span>
                <span>₹{formatINR(user.availableBalance)}</span>
              </div>
            )}
            {user.totalInvested !== undefined && (
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-700">
                  Total Invested:
                </span>
                <span>₹{formatINR(user.totalInvested)}</span>
              </div>
            )}
            {user.referalCode && (
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-700">
                  Referral Code:
                </span>
                <span>{user.referalCode}</span>
              </div>
            )}
            {user.referedBy && (
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-700">
                  Referred By:
                </span>
                <span>{user.referedBy}</span>
              </div>
            )}
            {user.isEmailVerified !== undefined && (
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-700">
                  Email Verified:
                </span>
                <span>{user.isEmailVerified ? "Yes" : "No"}</span>
              </div>
            )}
            {user.commissionRate !== undefined && (
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-700">
                  Commission Rate:
                </span>
                <span>{user.commissionRate}%</span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-700">Joined:</span>
                <span>{formatDateTimeIndian(user.createdAt)}</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SuperadminUsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setErrorMsg] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        params.append("page", page.toString());
        params.append("limit", "20");
        const data = await apiRequest<{
          success: boolean;
          users: User[];
          pagination?: Pagination;
          error?: string;
        }>("get", `/api/v1/superadmin/users?${params.toString()}`);
        if (data.success) {
          setUsers(data.data.users);
          setPagination(data.data.pagination || null);
        } else {
          setErrorMsg(data.error || "Failed to fetch users");
          setError({
            message: data.error || "Failed to fetch users.",
            solution:
              "Please try refreshing the page or contact support if the issue persists.",
            link: "/contact",
            linkText: "Contact Support",
          });
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch users";
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
    fetchUsers();
  }, [search, page, setError]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-4 md:px-8 py-4 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow mb-6 sm:mb-8">
        All Users
      </h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center mb-6 w-full">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={handleSearchChange}
            className="px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:border-indigo-400 bg-white shadow-sm w-full pr-10"
          />
          <FaSearch className="text-indigo-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>
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
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, i) => (
                    <tr
                      key={user._id}
                      className={i % 2 === 0 ? "bg-indigo-50" : ""}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap border-b border-indigo-100">
                        {user.name}
                      </td>
                      <td className="py-3 px-4 text-indigo-700 whitespace-nowrap border-b border-indigo-100">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap border-b border-indigo-100">
                        {user.mobile}
                      </td>
                      <td className="py-3 px-4 capitalize border-b border-indigo-100">
                        {user.role}
                      </td>
                      <td className="py-3 px-4 border-b border-indigo-100">
                        <button
                          className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold text-xs hover:bg-indigo-200 transition mr-2 mb-1"
                          onClick={() => handleViewUser(user._id)}
                        >
                          <FaEye className="inline mr-1" /> View
                        </button>
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
      {/* User Info Modal */}
      <UserInfoModal
        userId={selectedUserId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
