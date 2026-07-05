"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

interface NavBarProps {
  userName: string;
  role: UserRole;
}

const navLinks = [
  { href: "/dashboard/patients", label: "Patients" },
  { href: "/dashboard/doctors", label: "Doctors" },
  { href: "/dashboard/consultations", label: "Consultations" },
];

export default function NavBar({ userName, role }: NavBarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function handleLogout() {
    startTransition(() => {
      void logout();
    });
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:block focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-indigo-600"
              aria-label="Doctor Note MVP - Dashboard"
            >
              Doctor Note MVP
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden items-center space-x-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/dashboard/users"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive("/dashboard/users")
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                aria-current={isActive("/dashboard/users") ? "page" : undefined}
              >
                Users
              </Link>
            )}
          </div>

          {/* Desktop user info */}
          <div className="hidden items-center space-x-3 md:flex">
            <span className="text-sm text-gray-500">
              {userName}{" "}
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                {role}
              </span>
            </span>
            <form action={handleLogout}>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {isPending ? "Logging out..." : "Logout"}
              </button>
            </form>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="border-t md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/dashboard/users"
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive("/dashboard/users")
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                aria-current={isActive("/dashboard/users") ? "page" : undefined}
              >
                Users
              </Link>
            )}
          </div>
          <div className="border-t px-4 pb-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {userName}{" "}
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                  {role}
                </span>
              </span>
              <form action={handleLogout}>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  {isPending ? "Logging out..." : "Logout"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
