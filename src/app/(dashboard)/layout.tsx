import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "./components/NavBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name ?? user.email ?? "User";
  const role = profile?.role ?? "receptionist";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userName} role={role} />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
