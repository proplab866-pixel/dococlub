"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { apiRequest, formatDateTimeIndian } from "@/utils/api";
import { useError } from "@/context/ErrorContext";

interface ContactQuery {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt?: string;
}

export default function SuperadminQueriesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [fetching, setFetching] = useState(true);
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
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "superadmin") {
        router.replace("/forbidden");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchQueries = async () => {
      setFetching(true);
      setErrorMsg(null);
      try {
        const data = await apiRequest<{
          success: boolean;
          queries: ContactQuery[];
          error?: string;
        }>("get", "/api/v1/superadmin/contact-query");
        if (data.success) {
          setQueries(data.data.queries);
        } else {
          setErrorMsg(data.error || "Failed to fetch queries");
          setError({
            message: data.error || "Failed to fetch queries.",
            solution:
              "Please try refreshing the page or contact support if the issue persists.",
            link: "/contact",
            linkText: "Contact Support",
          });
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch queries";
        setErrorMsg(msg);
        setError({
          message: msg,
          solution:
            "Please try refreshing the page or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      } finally {
        setFetching(false);
      }
    };
    fetchQueries();
  }, [setError]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== "superadmin") {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-8 py-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 sm:mb-8">
        Contact Queries
      </h1>
      {error ? (
        <div className="text-red-600 font-bold text-base sm:text-lg mb-4">{error}</div>
      ) : fetching ? (
        <div className="flex justify-center items-center py-12"><LoadingSpinner size="lg" /></div>
      ) : queries.length === 0 ? (
        <div className="text-gray-500 text-base sm:text-lg">No queries found.</div>
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl shadow-xl bg-white">
          <table className="min-w-full text-sm border-separate border-spacing-y-1">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {queries.map((q, i) => (
                <tr key={q._id} className={i % 2 === 0 ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap border-b border-blue-100">{q.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-blue-700 underline border-b border-blue-100">
                    <Link target="_blank" href={`mailto:${q.email}`} className="hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition break-all">{q.email}</Link>
                  </td>
                  <td className="px-4 py-3 whitespace-pre-line text-gray-700 max-w-xs break-words border-b border-blue-100">{q.message}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 border-b border-blue-100">{q.createdAt ? formatDateTimeIndian(q.createdAt) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
