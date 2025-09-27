"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { facebook, instagram, mailto } from "@/constants";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Plans", href: "/#plans" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when user changes (login/logout)
  useEffect(() => {
    setShowUserMenu(false);
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  if (pathname?.includes("superadmin")) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-lg shadow-lg border-b border-teal-100"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-10 py-3 relative">
        {/* Logo and brand (responsive) */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-1 group min-w-0"
        >
          <span className="relative flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 blur-sm opacity-40 scale-110" />
            <Image
              src="/Logo.svg"
              alt="DocoClub Logo"
              width={36}
              height={36}
              className="rounded-full border-2 border-white shadow-md group-hover:scale-105 transition sm:w-8 sm:h-8"
            />
          </span>
          <span className="font-extrabold text-2xl sm:text-lg tracking-wide text-gray-800 drop-shadow-sm group-hover:text-teal-600 transition max-sm:hidden">
            DocoClub
          </span>
        </Link>

        {/* Desktop Nav (hide on sm and below) */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-6 ml-4 sm:ml-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative px-2 py-1 font-medium text-gray-700 hover:text-teal-600 transition"
            >
              <span>{link.name}</span>
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-teal-400 to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          ))}
        </nav>

        {/* Right Side (responsive gap) */}
        <div className="flex items-center gap-2 sm:gap-1 min-w-0">
          {children}
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 text-white font-semibold shadow hover:from-teal-500 hover:to-blue-500 transition"
              >
                <div className="w-9 h-9 bg-white/80 text-teal-700 rounded-full flex items-center justify-center text-lg font-bold border-2 border-teal-300">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="hidden md:block font-semibold">
                  {user.name || "User"}
                </span>
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-fit sm:w-56 bg-white rounded-xl shadow-xl border border-teal-100 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email || "No email"}
                      </p>
                    </div>
                    {/* Dashboard Links - Desktop Dropdown */}
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/personal-info"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Personal Info
                    </Link>
                    <Link
                      href="/dashboard/transaction-history"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Transaction History
                    </Link>
                    <Link
                      href="/dashboard/account-details"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Account Details
                    </Link>
                    <Link
                      href="/dashboard/team-reports"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Team Reports
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-teal-50 disabled:opacity-60 flex items-center gap-2"
                    >
                      {isLoggingOut ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Logging out...
                        </>
                      ) : (
                        "Logout"
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 sm:px-3 sm:py-1.5 text-sm sm:text-xs rounded-full bg-white/80 text-teal-700 font-semibold shadow hover:bg-teal-50 border border-teal-200 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 sm:px-3 sm:py-1.5 text-sm sm:text-xs rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-bold shadow hover:from-pink-600 hover:to-yellow-500 transition border-2 border-white ml-2"
              >
                Sign Up
              </Link>
            </>
          )}
          {/* Hamburger for mobile (aria-label) */}
          <button
            className="ml-2 md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-teal-200 shadow hover:bg-teal-50 transition"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Drawer (full width on very small screens) */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex"
            >
              {/* Modern Sidebar: solid, nearly opaque dark background, clear layout */}
              <div className="ml-auto w-80 max-w-full h-full text-white">
                {/* Close button */}
                <button
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="w-7 h-7 text-white" />
                </button>
                {/* Branding */}
                <div className="flex flex-col items-start justify-center pt-10 pb-6 px-8 border-b border-gray-800 bg-gradient-to-br from-teal-400 to-blue-400">
                  <span className="relative flex items-center justify-center mb-2">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 blur-md opacity-40 scale-110" />
                    <Image
                      src="/Logo.svg"
                      alt="DocoClub Logo"
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white shadow-lg"
                    />
                  </span>
                  <span className="font-extrabold text-2xl tracking-wide text-white drop-shadow mb-1">
                    DocoClub
                  </span>
                  <span className="text-xs text-teal-200 font-medium">
                    Maximize Your Earnings Online
                  </span>
                </div>
                {/* Navigation */}
                <nav className="flex flex-col gap-2 px-8 py-4 w-full bg-gradient-to-br from-teal-400 to-blue-400">
                  <SidebarLink
                    href="/"
                    icon={<HomeIcon className="w-6 h-6" />}
                    label="Home"
                    onClick={() => setMobileMenu(false)}
                  />
                  <SidebarLink
                    href="/#plans"
                    icon={<ChartBarIcon className="w-6 h-6" />}
                    label="Plans"
                    onClick={() => setMobileMenu(false)}
                  />
                  <SidebarLink
                    href="/about"
                    icon={<InformationCircleIcon className="w-6 h-6" />}
                    label="About"
                    onClick={() => setMobileMenu(false)}
                  />
                  <SidebarLink
                    href="/contact"
                    icon={<EnvelopeIcon className="w-6 h-6" />}
                    label="Contact"
                    onClick={() => setMobileMenu(false)}
                  />
                </nav>
                {/* User Section */}
                <div className="flex-1 flex flex-col justify-center px-8 py-4 w-full bg-gradient-to-br from-teal-400 to-blue-400">
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : user ? (
                    <div className="flex flex-col items-start gap-3 mb-6 w-full">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-12 h-12 bg-white/20 text-teal-200 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-teal-400">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <span className="font-semibold text-base text-white block truncate max-w-[140px]">
                            {user.name || "User"}
                          </span>
                          <span className="text-xs text-teal-200 block truncate max-w-[140px]">
                            {user.email || "No email"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 w-full mt-2">
                        <SidebarLink
                          href="/dashboard"
                          icon={<ChartBarIcon className="w-5 h-5" />}
                          label="Dashboard"
                          onClick={() => setMobileMenu(false)}
                        />
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-600/90 hover:bg-red-700 text-white font-semibold w-full justify-center disabled:opacity-60 mt-1 text-base"
                        >
                          {isLoggingOut ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                          )}
                          {isLoggingOut ? "Logging out..." : "Logout"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full mt-2">
                      <Link
                        href="/login"
                        className="px-4 py-3 rounded-lg bg-white/10 text-white font-semibold shadow hover:bg-teal-600 hover:text-white border border-teal-400 transition w-full text-center text-base"
                        onClick={() => setMobileMenu(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-bold shadow hover:from-pink-600 hover:to-yellow-500 transition border-2 border-white w-full text-center text-base"
                        onClick={() => setMobileMenu(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
                {/* Footer/Socials */}
                <div className="flex items-center justify-center gap-4 py-6 border-t border-gray-800 mt-auto w-full bg-gradient-to-br from-teal-400 to-blue-400">
                  <Link
                    href={instagram}
                    target="_blank"
                    aria-label="Instagram"
                    className="hover:text-pink-400 transition"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                    </svg>
                  </Link>
                  <Link
                    href={facebook}
                    target="_blank"
                    aria-label="Facebook"
                    className="hover:text-blue-400 transition"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </Link>
                  <Link
                    href={mailto}
                    target="_blank"
                    aria-label="Mail"
                    className="hover:text-yellow-400 transition"
                  >
                    <EnvelopeIcon className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg font-semibold text-white hover:bg-teal-600 hover:text-white transition text-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
