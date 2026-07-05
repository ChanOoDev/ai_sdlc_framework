"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateConsultation } from "@/app/actions/consultations";

interface EditConsultationFormProps {
  consultationId: string;
  initialNotes: string;
  initialDiagnosis: string | null;
  initialPrescription: string | null;
  patientName: string;
  doctorName: string;
}

export default function EditConsultationForm({
  consultationId,
  initialNotes,
  initialDiagnosis,
  initialPrescription,
  patientName,
  doctorName,
}: EditConsultationFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis ?? "");
  const [prescription, setPrescription] = useState(initialPrescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await updateConsultation(consultationId, {
      notes: notes.trim(),
      diagnosis: diagnosis.trim() || null,
      prescription: prescription.trim() || null,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push("/dashboard/consultations");
    }
  }

  return (
    <>
      {/* Read-only context */}
      <div className="mb-4 max-w-lg rounded-lg border bg-gray-50 p-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Patient:</span> {patientName}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Doctor:</span> {doctorName}
        </div>
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
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Notes *
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            maxLength={10000}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter consultation notes..."
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="diagnosis"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Diagnosis
          </label>
          <textarea
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            maxLength={5000}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter diagnosis (optional)"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="prescription"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Prescription
          </label>
          <textarea
            id="prescription"
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            maxLength={5000}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter prescription (optional)"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/consultations")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
