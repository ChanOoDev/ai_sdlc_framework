import { notFound } from "next/navigation";
import { getPatient } from "@/app/actions/patients";
import EditPatientForm from "./EditPatientForm";

interface EditPatientPageProps {
  params: { id: string };
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  const result = await getPatient(params.id);

  if (result.error || !result.data) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Patient</h1>
      </div>
      <EditPatientForm
        patientId={result.data.id}
        initialName={result.data.name}
        initialEmail={result.data.email}
        initialPhone={result.data.phone}
        initialDateOfBirth={result.data.date_of_birth}
        initialAddress={result.data.address}
      />
    </div>
  );
}
