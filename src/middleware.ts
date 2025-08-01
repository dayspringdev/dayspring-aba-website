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
    // This logic is fine, it handles a specific case before the main checks.
    if (session) await supabase.auth.signOut();
    return res;
  }

  if (session) {
    // The complex, loop-causing logic has been removed from here.

    const { data: claims } = await supabase.auth.getClaims();
    const amr = claims?.claims?.amr as { method: string }[] | undefined;
    const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;

    // If the user is in a recovery state (from an invite/reset link)
    // but isn't on the forgot-password page, send them there.
    if (isRecovery && !req.nextUrl.pathname.startsWith("/forgot-password")) {
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }

    // If the user has a normal, valid session and tries to visit the login page,
    // redirect them to the admin dashboard where they belong.
    if (!isRecovery && req.nextUrl.pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  } else {
    // If there is no session and the user tries to access a protected admin route,
    // redirect them to the login page.
    if (req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // If none of the above conditions are met, let the user proceed.
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/forgot-password"],
};
