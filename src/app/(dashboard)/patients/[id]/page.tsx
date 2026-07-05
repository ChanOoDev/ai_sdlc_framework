import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "@/app/actions/patients";
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

      <div className="mt-8 rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Consultation History
          </h2>
        </div>
        <div className="px-6 py-8 text-center text-gray-500">
          Consultation history will be available in a future update.
        </div>
      </div>
    </div>
  );
}
