"use client";

import { facebook, instagram, mailto } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Footer - Modern, themed site footer with logo, nav, copyright, and socials
 */
export default function Footer() {
  const pathname = usePathname();
  if (pathname?.includes("superadmin")) return null;
  return (
    <footer className="bg-gradient-to-br from-teal-600 to-blue-800 text-white/90 pt-10 pb-4 px-4 mt-auto relative backdrop-blur-md shadow-inner">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <Image
            src="/Logo.svg"
            alt="DocoClub Logo"
            width={36}
            height={36}
            className="rounded-full border-2 border-white shadow"
          />
          <span className="font-extrabold text-xl tracking-wide text-white drop-shadow">
            DocoClub
          </span>
        </div>
        {/* Footer Navigation */}
        <nav className="flex flex-wrap gap-4 justify-center text-sm font-medium">
          <Link href="/" className="hover:text-yellow-300 transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-yellow-300 transition">
            About
          </Link>
          <Link href="/#plans" className="hover:text-yellow-300 transition">
            Plans
          </Link>
          <Link href="/contact" className="hover:text-yellow-300 transition">
            Contact
          </Link>
        </nav>
        {/* Social Icons */}
        <div className="flex gap-4">
          <Link
            href={facebook}
            target="_blank"
            aria-label="Facebook"
            className="hover:text-blue-400 transition"
          >
            <Image src="/Facebook.svg" alt="Facebook" width={24} height={24} />
          </Link>
          <Link
            href={instagram}
            target="_blank"
            aria-label="Instagram"
            className="hover:text-pink-400 transition"
          >
            <Image
              src="/instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
            />
          </Link>
          <Link
            href={mailto}
            target="_blank"
            aria-label="Mail"
            className="hover:text-yellow-300 transition"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="4" width="20" height="16" rx="4" />
              <path d="M2 6l10 7 10-7" />
            </svg>
          </Link>
        </div>
      </div>
      {/* Copyright and Made with Love */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 pt-4 text-xs text-white/70">
        <span>
          © 2025 DocoClub Corporation Private Limited. All rights reserved.
        </span>
        <span className="flex items-center gap-1">
          Made with <span className="text-pink-400 text-base">♥</span> by the
          DocoClub Team
        </span>
      </div>
    </footer>
  );
}
