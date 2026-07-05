import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                Doctor Note MVP
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/patients" className="text-gray-600 hover:text-gray-900">
                Patients
              </Link>
              <Link href="/dashboard/doctors" className="text-gray-600 hover:text-gray-900">
                Doctors
              </Link>
              <Link href="/dashboard/consultations" className="text-gray-600 hover:text-gray-900">
                Consultations
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
