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
  
  // --- THIS IS THE FINAL, COMPLETE FIX ---
  // Check for the email confirmation message on the login page
  if (req.nextUrl.pathname.startsWith("/login")) {
    const message = req.nextUrl.searchParams.get("message");
    if (message === "email-confirmed") {
      // If the message exists, sign the user out immediately.
      // The `signOut` method, when used with the SSR client,
      // will automatically add the necessary `Set-Cookie` headers
      // to the response to clear the auth tokens from the browser.
      await supabase.auth.signOut();

      // Then, allow the request to proceed to the login page.
      // The browser will render the page AND clear the cookie simultaneously.
      return res;
    }
  }
  // --- END OF FIX ---

  if (session) {
    const { data: claims } = await supabase.auth.getClaims();
    const amr = claims?.claims?.amr as { method: string }[] | undefined;
    const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;

    if (isRecovery && req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }
    
    // This now only runs if the 'email-confirmed' message is NOT present
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