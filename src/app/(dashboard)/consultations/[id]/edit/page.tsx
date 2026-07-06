import { notFound } from "next/navigation";
import { getConsultation } from "@/app/actions/consultations";
import EditConsultationForm from "./EditConsultationForm";

interface EditConsultationPageProps {
  params: { id: string };
}

export default async function EditConsultationPage({
  params,
}: EditConsultationPageProps) {
  const result = await getConsultation(params.id);

  if (result.error || !result.data) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Consultation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update consultation notes and details
        </p>
      </div>
      <EditConsultationForm
        consultationId={result.data.id}
        initialNotes={result.data.notes}
        initialDiagnosis={result.data.diagnosis}
        initialPrescription={result.data.prescription}
        patientName={result.data.patient_name}
        doctorName={result.data.doctor_name}
      />
    </div>
  );
}
