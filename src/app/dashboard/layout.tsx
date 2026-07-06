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

  // Use JWT claims for role (avoids RLS recursion issues)
  const role = user.user_metadata?.role ?? "receptionist";
  const userName = user.user_metadata?.full_name ?? user.email ?? "User";

  return (
    <div className="min-h-screen bg-background">
      <NavBar userName={userName} role={role} />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
