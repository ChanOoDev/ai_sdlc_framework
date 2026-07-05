import { notFound } from "next/navigation";
import { getDoctor } from "@/app/actions/doctors";
import EditDoctorForm from "./EditDoctorForm";

interface EditDoctorPageProps {
  params: { id: string };
}

export default async function EditDoctorPage({ params }: EditDoctorPageProps) {
  const result = await getDoctor(params.id);

  if (result.error || !result.data) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Doctor</h1>
      </div>
      <EditDoctorForm
        doctorId={result.data.id}
        initialName={result.data.name}
        initialSpecialty={result.data.specialty}
      />
    </div>
  );
}
