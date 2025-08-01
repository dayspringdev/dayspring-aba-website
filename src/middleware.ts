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
  
  if (req.nextUrl.pathname.startsWith("/login")) {
    const message = req.nextUrl.searchParams.get("message");
    if (message === "email-confirmed") {
      await supabase.auth.signOut();
      return res;
    }
  }

  if (session) {
    // --- THIS IS THE FIX ---
    // Check for our specific success message from the password reset flow.
    const message = req.nextUrl.searchParams.get("message");
    if (req.nextUrl.pathname.startsWith("/login") && message === "password-updated") {
      // If this message exists, let the user pass through to the login page
      // so they can view the success toast, even if they have a session.
      return res;
    }
    // --- END OF FIX ---

    const { data: claims } = await supabase.auth.getClaims();
    const amr = claims?.claims?.amr as { method: string }[] | undefined;
    const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;

    if (isRecovery && req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }
    
    // This now only runs if the 'password-updated' message is NOT present
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