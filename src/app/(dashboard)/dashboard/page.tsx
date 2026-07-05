export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to Doctor Note MVP</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Patients</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">--</p>
          <p className="mt-1 text-sm text-gray-500">Total registered patients</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Doctors</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">--</p>
          <p className="mt-1 text-sm text-gray-500">Active doctors</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Consultations</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">--</p>
          <p className="mt-1 text-sm text-gray-500">This month</p>
        </div>
      </div>
    </div>
  );
}
