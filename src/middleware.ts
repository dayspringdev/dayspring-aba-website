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

  // --- THIS IS THE CRITICAL CHANGE IN ORDER ---
  // We check for the email confirmation flow FIRST, before checking the session.
  // This ensures the sign-out happens regardless of the current session state.
  if (req.nextUrl.pathname.startsWith("/login")) {
    const message = req.nextUrl.searchParams.get("message");
    if (message === "email-confirmed") {
      // If we find the message, we sign the user out to clear the stale session.
      await supabase.auth.signOut();
      // Then we allow the request to proceed to the login page to show the toast.
      return res;
    }
  }
  // --- END OF THE CRITICAL CHANGE ---

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Now, we run the rest of the logic.
  if (session) {
    const { data: claims } = await supabase.auth.getClaims();
    const amr = claims?.claims?.amr as { method: string }[] | undefined;
    const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;

    if (isRecovery && req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }

    // This logic now correctly runs only if the "email-confirmed" message was NOT present.
    if (!isRecovery && req.nextUrl.pathname.startsWith("/login")) {
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
