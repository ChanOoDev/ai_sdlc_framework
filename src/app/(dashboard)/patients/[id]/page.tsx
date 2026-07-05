import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "@/app/actions/patients";
import { getConsultationsByPatient } from "@/app/actions/consultations";
import { createClient } from "@/lib/supabase/server";

interface PatientDetailPageProps {
  params: { id: string };
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const result = await getPatient(params.id);

  if (result.error || !result.data) {
    notFound();
  }

  const patient = result.data;

  // Fetch the creator's profile to display their name
  const supabase = createClient();
  const { data: creatorProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", patient.created_by)
    .single();

  const creatorName = creatorProfile?.full_name ?? "Unknown";

  // Fetch consultation history
  const consultationsResult = await getConsultationsByPatient(patient.id);
  const consultationsError = consultationsResult.error ?? null;
  const consultations = consultationsResult.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patient Profile</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/patients"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Patients
          </Link>
          <Link
            href={`/dashboard/patients/${patient.id}/edit`}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Edit Patient
          </Link>
        </div>
      </div>

      {/* Patient Info */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{patient.name}</h2>
        </div>

        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.email ?? "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.phone ?? "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.date_of_birth
                  ? new Date(patient.date_of_birth).toLocaleDateString()
                  : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.address ?? "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created By</dt>
              <dd className="mt-1 text-sm text-gray-900">{creatorName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(patient.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(patient.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Consultation History Timeline */}
      <div className="mt-8 rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Consultation History
          </h2>
          <span className="text-sm text-gray-500">
            {consultations.length} consultation{consultations.length !== 1 ? "s" : ""}
          </span>
        </div>

        {consultationsError ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-700">
                Could not load consultation history: {consultationsError}
              </p>
            </div>
          </div>
        ) : consultations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No consultations yet.</p>
            <Link
              href={`/dashboard/consultations/new?patient_id=${patient.id}`}
              className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              Create first consultation →
            </Link>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

            <ul className="divide-y divide-gray-100">
              {consultations.map((c) => (
                <li key={c.id} className="relative px-6 py-5 hover:bg-gray-50">
                  {/* Timeline dot */}
                  <div className="absolute left-[14px] top-6 h-4 w-4 rounded-full border-2 border-indigo-600 bg-white" />

                  <div className="ml-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <time className="text-sm font-medium text-gray-900">
                          {new Date(c.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                        <span className="text-sm text-gray-500">
                          with {c.doctor_name}
                        </span>
                      </div>
                      <Link
                        href={`/dashboard/consultations/${c.id}/edit`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        aria-label={`View consultation from ${new Date(c.created_at).toLocaleDateString()}`}
                      >
                        View
                      </Link>
                    </div>

                    {c.diagnosis && (
                      <div className="mt-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Diagnosis
                        </span>
                        <p className="mt-1 text-sm text-gray-900">{c.diagnosis}</p>
                      </div>
                    )}

                    {c.prescription && (
                      <div className="mt-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Prescription
                        </span>
                        <p className="mt-1 text-sm text-gray-700">{c.prescription}</p>
                      </div>
                    )}

                    <div className="mt-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Notes
                      </span>
                      <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                        {c.notes}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
