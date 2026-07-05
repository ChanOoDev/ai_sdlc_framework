"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPatients, deletePatient } from "@/app/actions/patients";
import type { Database } from "@/types/database";

type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

export default function PatientsPage() {
  const router = useRouter();
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
    if (!window.confirm(`Are you sure you want to delete patient ${name}?`)) {
      return;
    }

    setDeletingId(id);
    const result = await deletePatient(id);

    if (result.error) {
      setError(result.error);
    } else {
      setPatients((prev) => prev.filter((p) => p.id !== id));
    }

    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading patients...</p>
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
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => void fetchPatients()}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={() => router.push("/dashboard/patients/new")}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Patient
          </button>
        </div>
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
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  <Link
                    href={`/dashboard/patients/${patient.id}`}
                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                  >
                    {patient.name}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {patient.email ?? "N/A"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {patient.phone ?? "N/A"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(patient.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/patients/${patient.id}/edit`)
                      }
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void handleDelete(patient.id, patient.name)}
                      disabled={deletingId === patient.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingId === patient.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {patients.length === 0 && (
          <div className="py-8 text-center text-gray-500">No patients found.</div>
        )}
      </div>
    </div>
  );
}
