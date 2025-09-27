"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  FaUniversity,
  FaHashtag,
  FaCodeBranch,
  FaUser,
  FaRegIdCard,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { apiRequest } from "@/utils/api";
import { useError } from "@/context/ErrorContext";

interface AccountDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  fullNameInBank: string;
}

export default function AccountDetailsPage() {
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<AccountDetails>({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
    fullNameInBank: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
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
    const fetchAccount = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await apiRequest<{
          success: boolean;
          account: AccountDetails | null;
          error?: string;
        }>("get", "/api/v1/user/account-details");
        if (!data.success)
          throw new Error(data.error || "Failed to fetch account details");
        if (data.data.account) {
          setAccount(data.data.account);
          setForm({
            accountNumber: data.data.account.accountNumber || "",
            ifscCode: data.data.account.ifscCode || "",
            bankName: data.data.account.bankName || "",
            branch: data.data.account.branch || "",
            fullNameInBank: data.data.account.fullNameInBank || "",
          });
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch account details";
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
    fetchAccount();
  }, [setError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "ifscCode" ? value.toUpperCase() : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccess(null);
    try {
      const data = await apiRequest<{
        success: boolean;
        account: AccountDetails;
        error?: string;
      }>("patch", "/api/v1/user/account-details", {
        data: form,
      });
      if (!data.success)
        throw new Error(data.error || "Failed to update account details");
      setAccount(data.data.account);
      setEditMode(false);
      setSuccess("Account details updated successfully!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to update account details";
      setErrorMsg(msg);
      setError({
        message: msg,
        solution: "Please try again or contact support if the issue persists.",
        link: "/contact",
        linkText: "Contact Support",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col bg-gradient-to-br from-yellow-50 to-blue-50">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800 text-center tracking-tight drop-shadow-sm">
          Bank Account Details
        </h1>
        <div className="bg-white/90 rounded-3xl shadow-xl p-8 border border-yellow-100">
          {error && (
            <div className="text-red-500 mb-4 font-semibold text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 mb-4 font-semibold text-center">
              {success}
            </div>
          )}
          {!editMode ? (
            <>
              {account ? (
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <FaRegIdCard className="text-blue-400 text-xl" />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        Account Number
                      </div>
                      <div className="font-bold text-lg text-gray-800">
                        {account.accountNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaHashtag className="text-yellow-500 text-xl" />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        IFSC Code
                      </div>
                      <div className="font-semibold text-gray-700">
                        {account.ifscCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUniversity className="text-green-500 text-xl" />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        Bank Name
                      </div>
                      <div className="font-semibold text-gray-700">
                        {account.bankName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCodeBranch className="text-blue-500 text-xl" />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Branch</div>
                      <div className="font-semibold text-gray-700">
                        {account.branch}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUser className="text-pink-400 text-xl" />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        Full Name in Bank
                      </div>
                      <div className="font-semibold text-gray-700">
                        {account.fullNameInBank}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center mb-6">
                  No account details found. Please add your bank account
                  information.
                </div>
              )}
              <button
                className="mt-2 px-6 py-2 bg-gradient-to-r from-yellow-500 to-blue-400 text-white rounded-xl font-bold shadow hover:from-yellow-600 hover:to-blue-500 transition flex items-center gap-2 mx-auto"
                onClick={() => setEditMode(true)}
              >
                <FaEdit /> {account ? "Edit" : "Add"}
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Account Number
                </label>
                <div className="relative">
                  <FaRegIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input
                    type="text"
                    name="accountNumber"
                    value={form.accountNumber}
                    onChange={handleChange}
                    className="w-full border border-blue-200 rounded-xl pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  IFSC Code
                </label>
                <div className="relative">
                  <FaHashtag className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                  <input
                    type="text"
                    name="ifscCode"
                    value={form.ifscCode}
                    onChange={handleChange}
                    className="w-full border border-yellow-200 rounded-xl pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Bank Name
                </label>
                <div className="relative">
                  <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                  <input
                    type="text"
                    name="bankName"
                    value={form.bankName}
                    onChange={handleChange}
                    className="w-full border border-green-200 rounded-xl pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-green-300 focus:border-green-400 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Branch
                </label>
                <div className="relative">
                  <FaCodeBranch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    className="w-full border border-blue-200 rounded-xl pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Full Name in Bank
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                  <input
                    type="text"
                    name="fullNameInBank"
                    value={form.fullNameInBank}
                    onChange={handleChange}
                    className="w-full border border-pink-200 rounded-xl pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-blue-400 text-white rounded-xl font-bold shadow hover:from-yellow-600 hover:to-blue-500 transition flex items-center gap-2 disabled:opacity-60"
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold shadow hover:bg-gray-300 transition flex items-center gap-2"
                  onClick={() => {
                    setEditMode(false);
                    setForm(
                      account || {
                        accountNumber: "",
                        ifscCode: "",
                        bankName: "",
                        branch: "",
                        fullNameInBank: "",
                      }
                    );
                  }}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
