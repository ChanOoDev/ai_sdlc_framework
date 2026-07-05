"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createConsultation,
  getPatientsForDropdown,
  getDoctorsForDropdown,
} from "@/app/actions/consultations";

interface DropdownItem {
  id: string;
  name: string;
}

export default function NewConsultationPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<DropdownItem[]>([]);
  const [doctors, setDoctors] = useState<DropdownItem[]>([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const fetchDropdowns = useCallback(async () => {
    setLoadingDropdowns(true);
    const [patientsResult, doctorsResult] = await Promise.all([
      getPatientsForDropdown(),
      getDoctorsForDropdown(),
    ]);

    if (patientsResult.error) {
      setError(patientsResult.error);
    } else {
      setPatients(patientsResult.data ?? []);
    }

    if (doctorsResult.error) {
      setError(doctorsResult.error);
    } else {
      setDoctors(doctorsResult.data ?? []);
    }

    setLoadingDropdowns(false);
  }, []);

  useEffect(() => {
    void fetchDropdowns();
  }, [fetchDropdowns]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createConsultation({
      doctor_id: doctorId,
      patient_id: patientId,
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

  if (loadingDropdowns) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading form data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Consultation</h1>
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
            htmlFor="patient_id"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Patient *
          </label>
          <select
            id="patient_id"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="doctor_id"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Doctor *
          </label>
          <select
            id="doctor_id"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

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
            {submitting ? "Creating..." : "Create Consultation"}
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
    </div>
  );
}
