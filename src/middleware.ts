// FILE: ./src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const { data: claims } = await supabase.auth.getClaims();
    const amr = claims?.claims?.amr as { method: string }[] | undefined;
    const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;

    if (isRecovery && req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }

    if (!isRecovery && req.nextUrl.pathname.startsWith("/login")) {
      // --- THIS IS THE FIX ---
      // Before redirecting, check if this is the special email confirmation redirect.
      // If it is, allow the request to pass through so the toast can be displayed.
      const message = req.nextUrl.searchParams.get("message");
      if (message === "email-confirmed") {
        return res; // Allow the request to continue to the login page
      }
      // --- END OF FIX ---

      // Otherwise, for any other visit to /login by a logged-in user, redirect them.
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  } else {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/forgot-password"],
};
