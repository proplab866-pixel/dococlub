"use client";

import Link from "next/link";
import {
  FaUser,
  FaWallet,
  FaChartBar,
  FaMoneyBillWave,
  FaListAlt,
  FaBolt,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
  {
    label: "Dashboard",
    icon: <FaChartBar size={26} />,
    href: "/superadmin/dashboard",
  },
  { label: "Users", icon: <FaUser size={26} />, href: "/superadmin/users" },
  {
    label: "Withdrawal",
    icon: <FaMoneyBillWave size={26} />,
    href: "/superadmin/withdrawal",
  },
  { label: "Plans", icon: <FaWallet size={26} />, href: "/superadmin/plans" },
  {
    label: "Transactions",
    icon: <FaListAlt size={26} />,
    href: "/superadmin/transactions",
  },
  {
    label: "Credit Daily Returns",
    icon: <FaBolt size={26} />,
    href: "/superadmin/credit-daily-returns",
  },
  {
    label: "Contact Queries",
    icon: <FaEnvelopeOpenText size={26} />,
    href: "/superadmin/queries",
  },
];

export default function SuperadminSidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
} = {}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  if (!user || user.role !== "superadmin") return null;

  return (
    <aside
      className={`w-full max-w-xs sm:max-w-sm md:w-72 bg-gradient-to-b from-gray-950 to-gray-900 text-white flex flex-col ${
        mobile ? "py-4 px-2 min-h-0" : "py-10 px-4 sm:px-6 min-h-screen"
      } shadow-2xl rounded-tr-3xl rounded-br-3xl overflow-x-hidden`}
      style={{ minWidth: 0 }}
    >
      <div className={mobile ? "mb-6" : "mb-10"}>
        <div className="text-2xl sm:text-3xl font-extrabold max-lg:hidden mb-2 tracking-widest text-blue-400 drop-shadow truncate">
          ADMIN
        </div>
        <div
          className="text-xs sm:text-sm text-gray-300 font-medium truncate"
          title={user.email}
        >
          {user.email}
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-2 sm:gap-3">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/superadmin/dashboard" &&
              pathname.startsWith(link.href));
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg cursor-pointer transition font-medium text-sm sm:text-base ${
                isActive
                  ? "bg-gray-800 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={mobile && onNavigate ? onNavigate : undefined}
            >
              <span className="text-lg sm:text-xl">{link.icon}</span>
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-6 sm:mt-8 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition text-sm sm:text-base w-full"
      >
        Logout
      </button>
    </aside>
  );
}
