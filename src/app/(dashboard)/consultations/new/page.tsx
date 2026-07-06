"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createConsultation,
  getPatientsForDropdown,
  getDoctorsForDropdown,
} from "@/app/actions/consultations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface DropdownItem {
  id: string;
  name: string;
}

export default function NewConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patient_id") ?? "";

  const [patients, setPatients] = useState<DropdownItem[]>([]);
  const [doctors, setDoctors] = useState<DropdownItem[]>([]);
  const [patientId, setPatientId] = useState(initialPatientId);
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
        <p className="text-sm text-muted-foreground">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Consultation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record a new consultation note for a patient
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card className="max-w-lg">
        <CardContent className="p-6">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient *</Label>
              <Select value={patientId} onValueChange={(v) => setPatientId(v ?? "")} required>
                <SelectTrigger id="patient_id" aria-label="Select patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor_id">Doctor *</Label>
              <Select value={doctorId} onValueChange={(v) => setDoctorId(v ?? "")} required>
                <SelectTrigger id="doctor_id" aria-label="Select doctor">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes *</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                maxLength={10000}
                rows={6}
                placeholder="Enter consultation notes..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                maxLength={5000}
                rows={3}
                placeholder="Enter diagnosis (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Textarea
                id="prescription"
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                maxLength={5000}
                rows={3}
                placeholder="Enter prescription (optional)"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Consultation"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/consultations")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
