"use client";

import { useEffect, useState, useCallback } from "react";
import { getUsers, updateUserRole } from "@/app/actions/users";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

const ROLE_OPTIONS: readonly UserRole[] = ["admin", "doctor", "receptionist"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getUsers();

    if (result.error) {
      setError(result.error);
      setUsers([]);
    } else {
      setUsers(result.data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdatingId(userId);
    const result = await updateUserRole(userId, newRole);

    if (result.error) {
      setError(result.error);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }

    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => void fetchUsers()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {user.full_name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      void handleRoleChange(
                        user.id,
                        e.target.value as UserRole
                      )
                    }
                    disabled={updatingId === user.id}
                    className="rounded border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-8 text-center text-gray-500">No users found.</div>
        )}
      </div>
    </div>
  );
}
