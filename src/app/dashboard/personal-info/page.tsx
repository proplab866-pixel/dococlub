"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaVenusMars,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { apiRequest } from "@/utils/api";

interface UserInfo {
  name: string;
  email: string;
  mobile?: string;
  country?: string;
  gender?: string;
}

export default function PersonalInfoPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<UserInfo>({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setErrorMsg] = useState<string | null>(null);

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
          user: UserInfo;
          error?: string;
        }>("get", "/api/v1/user/personal-info");
        if (!data.success)
          throw new Error(data.error || "Failed to fetch user info");
        setUser(data.data.user);
        setForm({
          name: data.data.user.name || "",
          email: data.data.user.email || "",
          mobile: data.data.user.mobile || "",
          country: data.data.user.country || "",
          gender: data.data.user.gender || "",
        });
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch user info";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccess(null);
    try {
      const data = await apiRequest<{
        success: boolean;
        user: UserInfo;
        error?: string;
      }>("patch", "/api/v1/user/update-personal-info", {
        data: {
          name: form.name,
          mobile: form.mobile,
          country: form.country,
          gender: form.gender,
        },
      });
      if (!data.success) throw new Error(data.error || "Failed to update info");
      setUser(data.data.user);
      setEditMode(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to update info";
      setErrorMsg(msg);
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
    <div className="w-full flex flex-col bg-gradient-to-br from-blue-50 to-yellow-50">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800 text-center tracking-tight drop-shadow-sm">
          Personal Information
        </h1>
        <div className="bg-white/90 rounded-3xl shadow-xl p-8 border border-blue-100">
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
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <FaUser className="text-blue-400 text-xl" />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Name</div>
                    <div className="font-bold text-lg text-gray-800">
                      {user?.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-yellow-500 text-xl" />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Email</div>
                    <div className="font-semibold text-gray-700">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-green-500 text-xl" />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Mobile</div>
                    <div className="font-semibold text-gray-700">
                      {user?.mobile || "-"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-blue-500 text-xl" />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Country</div>
                    <div className="font-semibold text-gray-700">
                      {user?.country || "-"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaVenusMars className="text-pink-400 text-xl" />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Gender</div>
                    <div className="font-semibold text-gray-700">
                      {user?.gender || "-"}
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-xl font-bold shadow hover:from-blue-600 hover:to-teal-500 transition flex items-center gap-2 mx-auto"
                onClick={() => setEditMode(true)}
              >
                <FaEdit /> Edit
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-blue-200 rounded-xl pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    disabled
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-gray-400 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Mobile
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-full border border-green-200 rounded-xl pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-green-300 focus:border-green-400 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Country
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full border border-blue-200 rounded-xl pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Gender
                </label>
                <div className="relative">
                  <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full border border-pink-200 rounded-xl pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-xl font-bold shadow hover:from-blue-600 hover:to-teal-500 transition flex items-center gap-2 disabled:opacity-60"
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold shadow hover:bg-gray-300 transition flex items-center gap-2"
                  onClick={() => {
                    setEditMode(false);
                    setForm({
                      name: user?.name || "",
                      email: user?.email || "",
                      mobile: user?.mobile || "",
                      country: user?.country || "",
                      gender: user?.gender || "",
                    });
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
