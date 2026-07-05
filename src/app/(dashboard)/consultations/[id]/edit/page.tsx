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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Consultation</h1>
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
