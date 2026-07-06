import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "@/app/actions/patients";
import { getConsultationsByPatient } from "@/app/actions/consultations";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PatientDetailPageProps {
  params: { id: string };
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const result = await getPatient(params.id);
  if (result.error || !result.data) notFound();

  const patient = result.data;

  const supabase = createClient();
  const [{ data: creatorProfile }, consultationsResult] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", patient.created_by).single(),
    getConsultationsByPatient(patient.id),
  ]);

  const creatorName = creatorProfile?.full_name ?? "Unknown";
  const consultationsError = consultationsResult.error ?? null;
  const consultations = consultationsResult.data ?? [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
              <Badge variant="secondary">Patient</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Patient profile and consultation history
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/patients" className={buttonVariants({ variant: "outline" })}>
              ← Back
            </Link>
            <Link href={`/dashboard/patients/${patient.id}/edit`} className={buttonVariants()}>
              Edit Patient
            </Link>
          </div>
        </div>
        <Separator className="mt-4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
                <p className="text-sm">{patient.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Phone</p>
                <p className="text-sm">{patient.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Date of Birth</p>
                <p className="text-sm">
                  {patient.date_of_birth
                    ? new Date(patient.date_of_birth).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Address</p>
                <p className="text-sm">{patient.address ?? "—"}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Created By</p>
                <p className="text-sm">{creatorName}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Created</p>
                <p className="text-sm">{new Date(patient.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Last Updated</p>
                <p className="text-sm">{new Date(patient.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultation History */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Consultation History
            </CardTitle>
            <Badge variant="secondary">{consultations.length}</Badge>
          </CardHeader>
          <CardContent>
            {consultationsError ? (
              <div className="rounded-md bg-destructive/5 p-4">
                <p className="text-sm text-destructive">{consultationsError}</p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">No consultations yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Record the first consultation for this patient.</p>
                <Link href={`/dashboard/consultations/new?patient_id=${patient.id}`} className={buttonVariants({ className: "mt-4" })}>
                  New Consultation
                </Link>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

                <ul className="space-y-0">
                  {consultations.map((c) => (
                    <li key={c.id} className="relative py-4 first:pt-0 last:pb-0">
                      {/* Timeline dot */}
                      <div className="absolute left-[9px] top-5 h-[14px] w-[14px] rounded-full border-2 border-primary bg-white" />

                      <div className="ml-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <time className="text-sm font-medium text-foreground">
                              {new Date(c.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-sm text-muted-foreground">
                              {c.doctor_name}
                            </span>
                          </div>
                          <Link
                            href={`/dashboard/consultations/${c.id}/edit`}
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                            aria-label={`View consultation from ${new Date(c.created_at).toLocaleDateString()}`}
                          >
                            View →
                          </Link>
                        </div>

                        {c.diagnosis && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-[10px]">Diagnosis</Badge>
                            <p className="mt-1 text-sm text-foreground">{c.diagnosis}</p>
                          </div>
                        )}

                        {c.prescription && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-[10px]">Prescription</Badge>
                            <p className="mt-1 text-sm text-muted-foreground">{c.prescription}</p>
                          </div>
                        )}

                        {c.notes && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-[10px]">Notes</Badge>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.notes}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
