"use client";

import { useEffect, useState, useCallback } from "react";
import { getUsers, updateUserRole } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "../components/PageHeader";
import PageLoading from "../components/PageLoading";
import PageError from "../components/PageError";
import PageEmpty from "../components/PageEmpty";
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

const roleColors: Record<UserRole, string> = {
  admin: "bg-rose-100 text-rose-700 hover:bg-rose-100",
  doctor: "bg-teal-100 text-teal-700 hover:bg-teal-100",
  receptionist: "bg-sky-100 text-sky-700 hover:bg-sky-100",
};

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

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={fetchUsers} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Management"
        description="Manage user accounts and role assignments"
        action={
          <Button variant="outline" onClick={() => void fetchUsers()} className="gap-2">
            <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Refresh
          </Button>
        }
      />

      {users.length === 0 ? (
        <PageEmpty
          title="No users found"
          description="No user accounts are registered yet."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            void handleRoleChange(user.id, value as UserRole)
                          }
                          disabled={updatingId === user.id}
                        >
                          <SelectTrigger
                            className="w-32"
                            aria-label={`Change role for ${user.full_name}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role} value={role}>
                                <Badge variant="secondary" className={`text-[10px] ${roleColors[role]}`}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
