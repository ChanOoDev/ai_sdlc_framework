import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect /dashboard/users and /dashboard/doctors to admin only
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/dashboard/users") ||
      request.nextUrl.pathname.startsWith("/dashboard/doctors"))
  ) {
    // Use JWT role claim instead of querying profiles (avoids RLS recursion)
    const role = user.user_metadata?.role ?? user.app_metadata?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protect /dashboard/patients/new and /dashboard/patients/*/edit to admin and receptionist
  if (
    user &&
    (request.nextUrl.pathname === "/dashboard/patients/new" ||
      /^\/dashboard\/patients\/[^/]+\/edit$/.test(request.nextUrl.pathname))
  ) {
    const role = user.user_metadata?.role ?? user.app_metadata?.role;
    if (role !== "admin" && role !== "receptionist") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protect /dashboard/consultations/new and /dashboard/consultations/*/edit to admin and doctor only
  if (
    user &&
    (request.nextUrl.pathname === "/dashboard/consultations/new" ||
      /^\/dashboard\/consultations\/[^/]+\/edit$/.test(
        request.nextUrl.pathname
      ))
  ) {
    const role = user.user_metadata?.role ?? user.app_metadata?.role;
    if (role !== "admin" && role !== "doctor") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
