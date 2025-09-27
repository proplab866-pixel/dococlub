"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import dynamic from "next/dynamic";
import { apiRequest } from "@/utils/api";
import { useError } from "@/context/ErrorContext";
import { formatINR, formatDateTimeIndian } from "@/utils/api";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function SuperadminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState<{
    totalInvested: number;
    totalProfit: number;
    totalUsers: number;
    totalDeposits: number;
    totalWithdrawals: number;
    newUsersToday: number;
  } | null>(null);
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
    const fetchAnalytics = async () => {
      setFetching(true);
      setErrorMsg(null);
      try {
        const data = await apiRequest<{
          success: boolean;
          totalInvested: number;
          totalProfit: number;
          totalUsers: number;
          totalDeposits: number;
          totalWithdrawals: number;
          newUsersToday: number;
          error?: string;
        }>("get", "/api/v1/superadmin/analytics");
        if (data.success) {
          setAnalytics({
            totalInvested: data.data.totalInvested,
            totalProfit: data.data.totalProfit,
            totalUsers: data.data.totalUsers,
            totalDeposits: data.data.totalDeposits,
            totalWithdrawals: data.data.totalWithdrawals,
            newUsersToday: data.data.newUsersToday,
          });
        } else {
          setErrorMsg(data.error || "Failed to fetch analytics");
          setError({
            message: data.error || "Failed to fetch analytics.",
            solution:
              "Please try refreshing the page or contact support if the issue persists.",
            link: "/contact",
            linkText: "Contact Support",
          });
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch analytics";
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
    fetchAnalytics();
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 font-bold text-xl">{error}</div>
      </div>
    );
  }

  // Prepare chart data
  const donutSeries = [
    analytics?.totalProfit || 0,
    analytics?.totalInvested || 0,
    analytics?.newUsersToday || 0,
  ];
  const donutLabels = ["Users Profit", "Invested", "New Users Today"];
  const donutColors = ["#3B82F6", "#06B6D4", "#FBBF24"];

  const barSeries = [
    {
      name: "Users Profit",
      data: [analytics?.totalProfit || 0],
    },
    {
      name: "Invested",
      data: [analytics?.totalInvested || 0],
    },
    {
      name: "New Users Today",
      data: [analytics?.newUsersToday || 0],
    },
  ];
  const barColors = ["#3B82F6", "#06B6D4", "#FBBF24"];

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <main className="flex-1 flex flex-col w-full max-w-full">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 px-2 sm:px-4 md:px-8 lg:px-0 py-3 md:py-6 w-full max-w-full">
          <StatCard
            label="Total Invested"
            value={analytics?.totalInvested || 0}
            color="text-blue-500"
          />
          <StatCard
            label="Users Profit"
            value={analytics?.totalProfit || 0}
            color="text-green-500"
          />
          <StatCard
            label="Total Users"
            value={analytics?.totalUsers || 0}
            color="text-yellow-500"
          />
          <StatCard
            label="Total Deposits"
            value={analytics?.totalDeposits || 0}
            color="text-teal-500"
          />
          <StatCard
            label="Total Withdrawals"
            value={analytics?.totalWithdrawals || 0}
            color="text-pink-500"
          />
          <StatCard
            label="New Users Today"
            value={analytics?.newUsersToday || 0}
            color="text-purple-500"
          />
        </section>
        {/* Charts Section: stack on mobile, side-by-side on xl+ */}
        <section className="flex flex-col xl:flex-row gap-3 sm:gap-4 md:gap-8 px-2 sm:px-4 md:px-8 lg:px-0 pb-6 md:pb-8 w-full max-w-full">
          {/* Today Report (Donut Chart) */}
          <div className="flex-1 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-3 sm:p-4 md:p-8 mb-2 xl:mb-0 hover:shadow-2xl transition-shadow flex flex-col justify-between min-w-0 w-full max-w-full overflow-x-auto">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-3 md:mb-6 gap-1 xs:gap-0">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">
                Today Report
              </div>
              <div className="text-gray-400 text-xs sm:text-sm md:text-base font-medium">
                {formatDateTimeIndian(new Date())}
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10 w-full max-w-full">
              <div className="w-full md:w-1/2 flex justify-center min-w-0">
                <Chart
                  options={{
                    labels: donutLabels,
                    colors: donutColors,
                    legend: { show: false },
                    dataLabels: { enabled: false },
                  }}
                  series={donutSeries}
                  type="donut"
                  width={220}
                />
              </div>
              <div className="flex-1 flex flex-col gap-3 md:gap-6 min-w-0">
                <Legend
                  color="#3B82F6"
                  label="Users Profit"
                  value={analytics?.totalProfit ?? 0}
                />
                <Legend
                  color="#06B6D4"
                  label="Invested"
                  value={analytics?.totalInvested ?? 0}
                />
                <Legend
                  color="#FBBF24"
                  label="New Users Today"
                  value={analytics?.newUsersToday ?? 0}
                />
              </div>
            </div>
          </div>
          {/* Weekly Report (Bar Chart) */}
          <div className="flex-1 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-3 sm:p-4 md:p-8 hover:shadow-2xl transition-shadow flex flex-col justify-between min-w-0 w-full max-w-full overflow-x-auto">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-3 md:mb-6 gap-1 xs:gap-0">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">
                Overview
              </div>
              <div className="text-gray-400 text-xs sm:text-sm md:text-base font-medium">
                {formatDateTimeIndian(new Date())}
              </div>
            </div>
            <Chart
              options={{
                chart: { toolbar: { show: false } },
                colors: barColors,
                plotOptions: { bar: { horizontal: false, borderRadius: 8 } },
                dataLabels: { enabled: false },
                stroke: { show: true, width: 2, colors: ["transparent"] },
                xaxis: { categories: ["Today"] },
                legend: { show: true, position: "right" },
                fill: { opacity: 1 },
              }}
              series={barSeries}
              type="bar"
              height={220}
              width={"100%"}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  // Determine if this card is for users (not currency)
  const isUserStat = label === "Total Users" || label === "New Users Today";
  return (
    <div
      className={`flex-1 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 flex flex-col items-center border-t-4 ${color}`}
    >
      <div className="flex items-center gap-2 text-3xl font-extrabold mb-2 text-gray-800 drop-shadow">
        {isUserStat ? (
          <>
            <UserIcon className="w-8 h-8 text-gray-800" />
            <span>{value.toLocaleString()}</span>
          </>
        ) : (
          `₹${formatINR(value)}`
        )}
      </div>
      <div className={`font-semibold tracking-wide text-lg ${color}`}>
        {label}
      </div>
    </div>
  );
}

function UserIcon({
  className = "w-6 h-6 text-gray-800",
}: {
  className?: string;
}) {
  // Bold, filled user SVG icon using currentColor for fill
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 1.5c-3 0-9 1.5-9 4.5V21h18v-3c0-3-6-4.5-9-4.5z" />
    </svg>
  );
}

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string | React.ReactNode;
  value: string | number;
}) {
  // Format value as INR for profit/invested, else show as is
  const isINR = label === "Users Profit" || label === "Invested";
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-block w-4 h-4 rounded-full"
        style={{ background: color }}
      ></span>
      <span className="text-gray-600 font-medium w-40">{label}</span>
      <span className="font-bold text-gray-800">
        {isINR ? `₹${formatINR(Number(value))}` : value}
      </span>
    </div>
  );
}
