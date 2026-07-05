"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDoctors, deleteDoctor } from "@/app/actions/doctors";

interface Doctor {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  created_at: string;
}

export default function DoctorsPage() {
  const router = useRouter();
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
    if (!window.confirm(`Are you sure you want to delete Dr. ${name}?`)) {
      return;
    }

    setDeletingId(id);
    const result = await deleteDoctor(id);

    if (result.error) {
      setError(result.error);
    } else {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    }

    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading doctors...</p>
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
        <h1 className="text-2xl font-bold">Doctor Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => void fetchDoctors()}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Refresh
          </button>
          <Link
            href="/dashboard/doctors/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Doctor
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Specialty
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
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {doctor.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {doctor.specialty}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(doctor.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/doctors/${doctor.id}/edit`)
                      }
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void handleDelete(doctor.id, doctor.name)}
                      disabled={deletingId === doctor.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingId === doctor.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {doctors.length === 0 && (
          <div className="py-8 text-center text-gray-500">No doctors found.</div>
        )}
      </div>
    </div>
  );
}
