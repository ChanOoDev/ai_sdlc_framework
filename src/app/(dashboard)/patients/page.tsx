"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getPatients, deletePatient } from "@/app/actions/patients";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  useEffect(() => {
    void fetchPatients();
  }, [fetchPatients]);

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

      {patients.length === 0 ? (
        <PageEmpty
          title="No patients yet"
          description="Get started by adding your first patient."
          actionLabel="Add Patient"
          actionHref="/dashboard/patients/new"
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
