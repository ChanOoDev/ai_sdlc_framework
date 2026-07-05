"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDoctor } from "@/app/actions/doctors";

export default function NewDoctorPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createDoctor({
      user_id: userId.trim(),
      name: name.trim(),
      specialty: specialty.trim(),
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push("/dashboard/doctors");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Doctor</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="max-w-lg rounded-lg border bg-white p-6 shadow-sm"
      >
        <div className="mb-4">
          <label
            htmlFor="userId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            User ID *
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter the linked user's UUID"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={255}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter doctor's full name"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="specialty"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Specialty *
          </label>
          <input
            type="text"
            id="specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            required
            maxLength={255}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g., Cardiology, Pediatrics"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Doctor"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/doctors")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
