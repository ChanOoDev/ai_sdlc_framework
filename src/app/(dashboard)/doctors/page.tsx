"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getDoctors, deleteDoctor } from "@/app/actions/doctors";
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

interface Doctor {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  created_at: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getDoctors();
    if (result.error) {
      setError(result.error);
      setDoctors([]);
    } else {
      setDoctors(result.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchDoctors();
  }, [fetchDoctors]);

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete Dr. ${name}? This action cannot be undone.`)) return;
    setDeletingId(id);
    const result = await deleteDoctor(id);
    if (result.error) setError(result.error);
    else setDoctors((prev) => prev.filter((d) => d.id !== id));
    setDeletingId(null);
  }

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={fetchDoctors} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Doctors"
        description="Manage doctor profiles and specialties"
        action={
          <Link href="/dashboard/doctors/new" className={buttonVariants({ className: "gap-2" })}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Doctor
          </Link>
        }
      />

      {doctors.length === 0 ? (
        <PageEmpty
          title="No doctors yet"
          description="Get started by adding your first doctor."
          actionLabel="Add Doctor"
          actionHref="/dashboard/doctors/new"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                          {doctor.specialty}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(doctor.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/doctors/${doctor.id}/edit`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                            Edit
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => void handleDelete(doctor.id, doctor.name)}
                            disabled={deletingId === doctor.id}
                          >
                            {deletingId === doctor.id ? "..." : "Delete"}
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
