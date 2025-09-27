"use client";

import { useState, useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { apiRequest, formatINR } from "@/utils/api";
import { useError } from "@/context/ErrorContext";

type Plan = {
  _id: string;
  name: string;
  invest: number;
  daily: number;
  total: number;
  days: number;
  roi?: number;
  benefits?: string[];
  badge?: string;
  isActive?: boolean;
};

function PlanModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (plan: Plan) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    invest: "",
    daily: "",
    total: "",
    days: "",
    roi: "",
    benefits: "",
    badge: "",
    isActive: true,
  });
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.invest ||
      !form.daily ||
      !form.total ||
      !form.days
    ) {
      setError("Please fill all required fields.");
      return;
    }
    onCreate({
      _id: Math.random().toString(36).slice(2),
      name: form.name,
      invest: Number(form.invest),
      daily: Number(form.daily),
      total: Number(form.total),
      days: Number(form.days),
      roi: form.roi ? Number(form.roi) : undefined,
      benefits: form.benefits
        ? form.benefits
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean)
        : undefined,
      badge: form.badge,
      isActive: form.isActive,
    });
    setForm({
      name: "",
      invest: "",
      daily: "",
      total: "",
      days: "",
      roi: "",
      benefits: "",
      badge: "",
      isActive: true,
    });
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-gradient-to-br from-white via-indigo-50 to-teal-50 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn border-t-4 border-teal-400">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-extrabold mb-6 text-center text-indigo-700 drop-shadow">
          Add New Plan
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border-2 border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400 bg-white shadow-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Invest Amount *
              </label>
              <input
                name="invest"
                type="number"
                value={form.invest}
                onChange={handleChange}
                className="w-full border-2 border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400 bg-white shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Daily Return *
              </label>
              <input
                name="daily"
                type="number"
                value={form.daily}
                onChange={handleChange}
                className="w-full border-2 border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400 bg-white shadow-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Total Return *
              </label>
              <input
                name="total"
                type="number"
                value={form.total}
                onChange={handleChange}
                className="w-full border-2 border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400 bg-white shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Days *
              </label>
              <input
                name="days"
                type="number"
                value={form.days}
                onChange={handleChange}
                className="w-full border-2 border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400 bg-white shadow-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                ROI (%)
              </label>
              <input
                name="roi"
                type="number"
                value={form.roi}
                onChange={handleChange}
                className="w-full border-2 border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400 bg-white shadow-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Badge
              </label>
              <input
                name="badge"
                value={form.badge}
                onChange={handleChange}
                className="w-full border-2 border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400 bg-white shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Benefits (comma separated)
            </label>
            <input
              name="benefits"
              value={form.benefits}
              onChange={handleChange}
              className="w-full border-2 border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
            />
            <label className="font-semibold text-gray-700">Active</label>
          </div>
          {error && (
            <div className="text-red-600 font-semibold text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow hover:from-indigo-600 hover:to-teal-600 transition text-lg mt-2"
          >
            Add Plan
          </button>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  planName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fadeIn border-t-4 border-red-400">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-center text-red-600">
          Confirm Delete
        </h2>
        <p className="text-gray-700 text-center mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{planName || "this plan"}</span>? This
          action cannot be undone.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperadminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorMsg] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name?: string;
  } | null>(null);
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

  // Fetch all plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await apiRequest<{
          success: boolean;
          plans: Plan[];
          error?: string;
        }>("get", "/api/v1/get-investment-plans");
        if (data.success) {
          setPlans(data.data.plans);
        } else {
          setErrorMsg(data.error || "Failed to fetch plans");
          setError({
            message: data.error || "Failed to fetch plans.",
            solution: "Please try refreshing the page or contact support if the issue persists.",
            link: "/contact",
            linkText: "Contact Support",
          });
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch plans";
        setErrorMsg(msg);
        setError({
          message: msg,
          solution: "Please try refreshing the page or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [setError]);

  // Delete plan
  const handleDelete = async (id: string) => {
    setDeleting(id);
    setErrorMsg("");
    try {
      const data = await apiRequest<{
        success: boolean;
        message?: string;
        error?: string;
      }>("delete", "/api/v1/superadmin/delete-investment-plan", {
        data: { id },
      });
      if (data.success) {
        setPlans((prev) => prev.filter((p) => p._id !== id));
      } else {
        setErrorMsg(data.error || "Failed to delete plan");
        setError({
          message: data.error || "Failed to delete plan.",
          solution: "Please try again or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to delete plan";
      setErrorMsg(msg);
      setError({
        message: msg,
        solution: "Please try again or contact support if the issue persists.",
        link: "/contact",
        linkText: "Contact Support",
      });
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  // Create plan
  const handleCreate = async (plan: Plan) => {
    setCreating(true);
    setErrorMsg("");
    try {
      const data = await apiRequest<{
        success: boolean;
        plan: Plan;
        error?: string;
      }>("post", "/api/v1/superadmin/create-investment-plan", {
        data: plan,
      });
      if (data.success) {
        setPlans((prev) => [...prev, data.data.plan]);
      } else {
        setErrorMsg(data.error || "Failed to create plan");
        setError({
          message: data.error || "Failed to create plan.",
          solution: "Please try again or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to create plan";
      setErrorMsg(msg);
      setError({
        message: msg,
        solution: "Please try again or contact support if the issue persists.",
        link: "/contact",
        linkText: "Contact Support",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl w-full mx-auto px-2 sm:px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow">
            Business Plans
          </h1>
          <button
            className="flex items-center gap-2 bg-indigo-100 hover:bg-teal-100 text-indigo-700 font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-lg transition text-base sm:text-lg focus:outline-none"
            onClick={() => setShowModal(true)}
            disabled={creating}
          >
            <FaPlus className="text-lg sm:text-xl" />
            <span>{creating ? "Adding..." : "Add Plan"}</span>
          </button>
        </div>
        {error && (
          <div className="text-red-600 font-semibold mb-6 text-center">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-12 text-lg text-gray-500">
            Loading plans...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="relative group rounded-3xl shadow-xl p-4 sm:p-7 flex flex-col min-h-[240px] bg-white border border-indigo-100 hover:border-teal-400 transition-all overflow-hidden"
              >
                {/* Accent Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 via-teal-300 to-indigo-200 rounded-t-3xl" />
                {/* Delete Button */}
                <button
                  className="absolute top-4 right-4 bg-white/80 hover:bg-teal-100 text-gray-400 hover:text-red-500 rounded-full p-2 shadow transition z-10"
                  onClick={() =>
                    setConfirmDelete({ id: plan._id, name: plan.name })
                  }
                  disabled={deleting === plan._id}
                  title="Delete Plan"
                  style={{ backdropFilter: "blur(4px)" }}
                >
                  <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {/* Plan Badge (optional) */}
                {plan.badge && (
                  <span className="absolute top-4 left-4 bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full shadow">
                    {plan.badge}
                  </span>
                )}
                {/* Plan Name */}
                <div className="mt-6 mb-2 text-lg sm:text-2xl font-extrabold text-indigo-700 drop-shadow text-center tracking-wide">
                  {plan.name}
                </div>
                {/* Investment Amount */}
                <div className="text-2xl sm:text-3xl font-bold text-indigo-700 text-center mb-1">
                  ₹{formatINR(plan.invest)}
                </div>
                <div className="text-xs text-gray-500 text-center mb-4">
                  Investment Amount
                </div>
                {/* Plan Details Grid */}
                <div className="flex justify-center gap-4 mb-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">Days</span>
                    <span className="font-bold text-indigo-700 text-base sm:text-lg">
                      {plan.days}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">Daily</span>
                    <span className="font-bold text-indigo-700 text-base sm:text-lg">
                      ₹{formatINR(plan.daily)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="font-bold text-indigo-700 text-base sm:text-lg">
                      ₹{formatINR(plan.total)}
                    </span>
                  </div>
                </div>
                {/* ROI and Benefits */}
                {plan.roi !== undefined && (
                  <div className="text-xs text-teal-700 font-semibold text-center mb-2">
                    ROI: {plan.roi}%
                  </div>
                )}
                {plan.benefits && plan.benefits.length > 0 && (
                  <ul className="text-xs text-gray-600 mb-2 list-disc list-inside">
                    {plan.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
                {/* Active Status */}
                <div className="mt-auto flex justify-between items-center pt-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modals */}
      <PlanModal open={showModal} onClose={() => setShowModal(false)} onCreate={handleCreate} />
      {confirmDelete && (
        <ConfirmDeleteModal
          open={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
          planName={confirmDelete.name}
        />
      )}
    </>
  );
}
