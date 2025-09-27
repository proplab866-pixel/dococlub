"use client";

import SuperadminSidebar from "@/components/layout/SuperadminSidebar";
import { ReactNode, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SuperadminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800 overflow-x-hidden w-full">
      {/* Sidebar for desktop, overlay for mobile */}
      <div className="hidden lg:block">
        <SuperadminSidebar />
      </div>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${sidebarOpen ? "block" : "pointer-events-none"}`}
        aria-hidden={!sidebarOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
        {/* Sidebar panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-full max-w-xs sm:max-w-sm md:w-72 bg-gradient-to-b from-gray-950 to-gray-900 text-white shadow-2xl rounded-tr-3xl rounded-br-3xl transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Superadmin sidebar"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800">
            <span className="text-xl sm:text-2xl font-extrabold tracking-widest text-blue-400">ADMIN</span>
            <button
              className="p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-7 h-7 text-white" />
            </button>
          </div>
          <SuperadminSidebar mobile onNavigate={() => setSidebarOpen(false)} />
        </aside>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-50 w-full max-w-full">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-2 sm:px-4 py-4 bg-white/90 shadow-md sticky top-0 z-30 w-full max-w-full">
          <div className="text-lg sm:text-xl font-extrabold text-gray-800 tracking-tight">Super Admin Panel</div>
          <button
            className="p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-7 h-7 text-blue-600" />
          </button>
        </header>
        {/* Desktop Header */}
        <header className="hidden lg:flex bg-gradient-to-r from-white via-blue-50 to-white shadow-lg items-center justify-between px-6 md:px-12 py-6 md:py-8 rounded-bl-3xl mb-4 md:mb-8 w-full max-w-full">
          <div className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow">
            Super Admin Panel
          </div>
        </header>
        <section className="flex-1 px-2 sm:px-4 md:px-8 lg:px-12 pb-8 md:pb-12 w-full max-w-full mx-auto overflow-x-auto">
          {children}
        </section>
      </div>
    </div>
  );
}
