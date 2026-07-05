"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getConsultations,
  deleteConsultation,
} from "@/app/actions/consultations";
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

interface ConsultationRow {
  id: string;
  doctor_id: string;
  patient_id: string;
  notes: string;
  diagnosis: string | null;
  prescription: string | null;
  created_at: string;
  updated_at: string;
  doctor_name: string;
  patient_name: string;
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getConsultations();
    if (result.error) {
      setError(result.error);
      setConsultations([]);
    } else {
      setConsultations(result.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchConsultations();
  }, [fetchConsultations]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this consultation? This action cannot be undone.")) return;
    setDeletingId(id);
    const result = await deleteConsultation(id);
    if (result.error) setError(result.error);
    else setConsultations((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
  }

  function truncate(text: string, maxLength: number): string {
    return text.length <= maxLength ? text : text.slice(0, maxLength) + "…";
  }

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={fetchConsultations} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Consultations"
        description="View and manage patient consultation notes"
        action={
          <Link href="/dashboard/consultations/new" className={buttonVariants({ className: "gap-2" })}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Consultation
          </Link>
        }
      />

      {consultations.length === 0 ? (
        <PageEmpty
          title="No consultations yet"
          description="Get started by recording your first consultation."
          actionLabel="New Consultation"
          actionHref="/dashboard/consultations/new"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="hidden sm:table-cell">Diagnosis</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.patient_name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.doctor_name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {c.diagnosis ? truncate(c.diagnosis, 40) : "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/consultations/${c.id}/edit`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                            Edit
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => void handleDelete(c.id)}
                            disabled={deletingId === c.id}
                          >
                            {deletingId === c.id ? "..." : "Delete"}
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
