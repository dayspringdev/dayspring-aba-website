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

  // --- DEBUG LOGGING ---
  // Check your terminal where `npm run dev` is running for this output.
  // console.log("--- MIDDLEWARE CHECK ---");
  // console.log("PATH:", req.nextUrl.pathname);

  if (session) {
    const { data: claims } = await supabase.auth.getClaims();
    // console.log("SESSION DETECTED. CLAIMS:", JSON.stringify(claims, null, 2));

    // THE CRITICAL CHECK
    const amr = claims?.claims?.amr as { method: string }[] | undefined;
    const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;

    if (isRecovery && req.nextUrl.pathname.startsWith("/admin")) {
      // console.log("DECISION: Blocking access. User is in recovery mode.");
      // console.log("----------------------\n");
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }

    if (!isRecovery && req.nextUrl.pathname.startsWith("/login")) {
      // console.log(
      //   "DECISION: Redirecting logged-in user from /login to /admin."
      // );
      // console.log("----------------------\n");
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  } else {
    // console.log("SESSION: None");
    if (req.nextUrl.pathname.startsWith("/admin")) {
      // console.log("DECISION: No session, redirecting to /login.");
      // console.log("----------------------\n");
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // console.log("DECISION: Allowing request.");
  // console.log("----------------------\n");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/forgot-password"],
};
