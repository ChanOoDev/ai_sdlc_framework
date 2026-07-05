"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getConsultations,
  deleteConsultation,
} from "@/app/actions/consultations";

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
  const router = useRouter();
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
    if (!window.confirm("Are you sure you want to delete this consultation?")) {
      return;
    }

    setDeletingId(id);
    const result = await deleteConsultation(id);

    if (result.error) {
      setError(result.error);
    } else {
      setConsultations((prev) => prev.filter((c) => c.id !== id));
    }

    setDeletingId(null);
  }

  function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading consultations...</p>
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
        <h1 className="text-2xl font-bold">Consultations</h1>
        <div className="flex gap-2">
          <button
            onClick={() => void fetchConsultations()}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={() => router.push("/dashboard/consultations/new")}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Consultation
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Diagnosis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {consultations.map((consultation) => (
              <tr key={consultation.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {consultation.patient_name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {consultation.doctor_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {truncate(consultation.notes, 80)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {consultation.diagnosis
                    ? truncate(consultation.diagnosis, 50)
                    : "-"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(consultation.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/consultations/${consultation.id}/edit`
                        )
                      }
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void handleDelete(consultation.id)}
                      disabled={deletingId === consultation.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingId === consultation.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {consultations.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No consultations found.
          </div>
        )}
      </div>
    </div>
  );
}
