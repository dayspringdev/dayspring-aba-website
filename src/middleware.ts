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
      auth: {
        flowType: "pkce",
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const message = req.nextUrl.searchParams.get("message");

  if (message === "email-confirmed") {
    if (session) await supabase.auth.signOut();
    return res;
  }

  if (session) {
    // --- THIS IS THE NEW, CORRECTED LOGIC ---
    // PRIORITY #1: Check for our special command from the password reset flow.
    // If we see this, we MUST sign out and redirect to the login page with the
    // success message. This overrides all other logic.
    if (message === "password-updated-logout") {
      await supabase.auth.signOut();
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("message", "password-updated");
      return NextResponse.redirect(redirectUrl);
    }
    // --- END OF NEW LOGIC ---

    // The rest of the logic only runs if the special command was not present.
    const { data: claims } = await supabase.auth.getClaims();
    const amr = claims?.claims?.amr as { method: string }[] | undefined;
    const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;

    if (isRecovery && !req.nextUrl.pathname.startsWith("/forgot-password")) {
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }

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
