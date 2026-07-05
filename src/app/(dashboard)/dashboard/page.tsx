import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  const supabase = createClient();

  const [
    { count: patientCount },
    { count: doctorCount },
    { count: consultationCount },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("doctors").select("*", { count: "exact", head: true }),
    supabase.from("consultations").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      title: "Total Patients",
      value: patientCount ?? 0,
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
      color: "bg-teal-50 text-teal-600",
    },
    {
      title: "Doctors",
      value: doctorCount ?? 0,
      icon: "M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1H21M3 3h2.25M3 21h2.25M12 3a9 9 0 100 18 9 9 0 000-18z",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Consultations",
      value: consultationCount ?? 0,
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const { data: recentConsultations } = await supabase
    .from("consultations")
    .select("id, diagnosis, created_at, patient_id, doctor_id")
    .order("created_at", { ascending: false })
    .limit(5);

  let enrichedRecent: {
    id: string;
    diagnosis: string | null;
    created_at: string;
    patient_name: string;
    doctor_name: string;
  }[] = [];

  if (recentConsultations && recentConsultations.length > 0) {
    const patientIds = [...new Set(recentConsultations.map((c) => c.patient_id))];
    const doctorIds = [...new Set(recentConsultations.map((c) => c.doctor_id))];

    const [{ data: patientsData }, { data: doctorsData }] = await Promise.all([
      supabase.from("patients").select("id, name").in("id", patientIds),
      supabase.from("doctors").select("id, name").in("id", doctorIds),
    ]);

    const patientMap = new Map((patientsData ?? []).map((p) => [p.id, p.name]));
    const doctorMap = new Map((doctorsData ?? []).map((d) => [d.id, d.name]));

    enrichedRecent = recentConsultations.map((c) => ({
      id: c.id,
      diagnosis: c.diagnosis,
      created_at: c.created_at,
      patient_name: patientMap.get(c.patient_id) ?? "Unknown",
      doctor_name: doctorMap.get(c.doctor_id) ?? "Unknown",
    }));
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your clinic&apos;s activity
        </p>
        <Separator className="mt-4" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          {enrichedRecent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No consultations yet.</p>
          ) : (
            <div className="space-y-3">
              {enrichedRecent.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.patient_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.diagnosis ? c.diagnosis.slice(0, 50) : "No diagnosis"} · {c.doctor_name}
                      </p>
                    </div>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
