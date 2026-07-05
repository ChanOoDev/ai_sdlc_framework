"use client";

import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

interface NavBarProps {
  userName: string;
  role: UserRole;
}

export default function NavBar({ userName, role }: NavBarProps) {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
              Doctor Note MVP
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/patients" className="text-gray-600 hover:text-gray-900">
              Patients
            </Link>
            <Link href="/dashboard/doctors" className="text-gray-600 hover:text-gray-900">
              Doctors
            </Link>
            <Link href="/dashboard/consultations" className="text-gray-600 hover:text-gray-900">
              Consultations
            </Link>
            {role === "admin" && (
              <Link href="/dashboard/users" className="text-gray-600 hover:text-gray-900">
                Users
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {userName}{" "}
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                {role}
              </span>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
