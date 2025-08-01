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

  // --- THIS IS THE NEW, DEFINITIVE LOGIC ---
  if (session) {
    // PRIORITY #1: If the user has just updated their password,
    // we need to sign them out and send them to the login page to see the success message.
    if (message === "password-updated") {
      // 1. Sign out the new session immediately.
      await supabase.auth.signOut();

      // 2. Create a clean redirect to the login page, preserving only the final toast message.
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("message", "password-updated"); // Keep the correct message for the toast

      // 3. Perform the redirect.
      return NextResponse.redirect(redirectUrl);
    }
    // --- END OF NEW LOGIC ---

    const { data: claims } = await supabase.auth.getClaims();
    const amr = claims?.claims?.amr as { method: string }[] | undefined;
    const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;

    if (isRecovery && !req.nextUrl.pathname.startsWith("/forgot-password")) {
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }

    // This redirect to /admin will now only happen for NORMAL logins, not after a password update.
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
