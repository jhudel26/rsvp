import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/auth/login") || path.startsWith("/auth/signup") || path.startsWith("/auth/reset-password");
  const isPublicRSVP = path.startsWith("/r/");
  const isAdmin =
    path.startsWith("/dashboard") ||
    path.startsWith("/events") ||
    path.startsWith("/responses") ||
    path.startsWith("/templates") ||
    path.startsWith("/analytics") ||
    path.startsWith("/settings") ||
    path.startsWith("/profile") ||
    path.startsWith("/admin");

  // Allow public RSVP pages without authentication
  if (isPublicRSVP) {
    return response;
  }

  if (isAdmin && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/auth/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (isAuthPage && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dashboard";
    return NextResponse.redirect(redirect);
  }

  return response;
}
