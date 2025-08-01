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

  // --- THIS IS THE NEW, ROBUST LOGIC ---
  // Check for our special command from the forgot password page.
  if (message === "password-updated-logout") {
    // 1. Perform the sign-out securely on the server.
    await supabase.auth.signOut();

    // 2. Create the final destination URL with the toast message.
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("message", "password-updated"); // Set the final message for the toast.

    // 3. Issue the redirect.
    return NextResponse.redirect(redirectUrl);
  }
  // --- END OF NEW LOGIC ---

  if (message === "email-confirmed") {
    if (session) await supabase.auth.signOut();
    return res;
  }

  if (session) {
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
