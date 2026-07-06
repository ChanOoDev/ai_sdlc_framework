"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateConsultation } from "@/app/actions/consultations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
    <div className="animate-fade-in">
      {/* Read-only context */}
      <Card className="mb-4 max-w-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <Badge variant="secondary" className="mb-1">Patient</Badge>
              <p className="font-medium text-foreground">{patientName}</p>
            </div>
            <div>
              <Badge variant="secondary" className="mb-1">Doctor</Badge>
              <p className="font-medium text-foreground">{doctorName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card className="max-w-lg">
        <CardContent className="p-6">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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
                {submitting ? "Saving..." : "Save Changes"}
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
