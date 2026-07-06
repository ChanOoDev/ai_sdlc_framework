"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { getPatients, searchPatients, deletePatient } from "@/app/actions/patients";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPatients();
    if (result.error) {
      setError(result.error);
      setPatients([]);
    } else {
      setPatients(result.data ?? []);
    }
    setLoading(false);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length === 0) {
      void fetchPatients();
      return;
    }

    setIsSearching(true);
    setError(null);
    const result = await searchPatients(query);
    if (result.error) {
      setError(result.error);
      setPatients([]);
    } else {
      setPatients(result.data ?? []);
    }
    setIsSearching(false);
  }, [fetchPatients]);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      void handleSearch(query);
    }, 300);
  }, [handleSearch]);

  useEffect(() => {
    void fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete patient "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    const result = await deletePatient(id);
    if (result.error) setError(result.error);
    else setPatients((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={fetchPatients} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Patients"
        description="Manage patient records and information"
        action={
          <Link href="/dashboard/patients/new" className={buttonVariants({ className: "gap-2" })}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Patient
          </Link>
        }
      />

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <Input
            type="search"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
          {isSearching && (
            <svg
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
      </div>

      {patients.length === 0 ? (
        searchQuery ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <svg
                className="h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <p className="mt-4 text-sm font-medium text-foreground">No patients found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No results for &quot;{searchQuery}&quot;. Try a different search term.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  void fetchPatients();
                }}
              >
                Clear search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <PageEmpty
            title="No patients yet"
            description="Get started by adding your first patient."
            actionLabel="Add Patient"
            actionHref="/dashboard/patients/new"
          />
        )
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {patient.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {patient.email ?? "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {patient.phone ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/patients/${patient.id}/edit`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                            Edit
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => void handleDelete(patient.id, patient.email ?? patient.name)}
                            disabled={deletingId === patient.id}
                          >
                            {deletingId === patient.id ? "..." : "Delete"}
                          </Button>
                        </div>
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
