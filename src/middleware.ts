// FILE: ./src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // LOG 1
  console.log(
    `[MIDDLEWARE] Request received for path: ${req.nextUrl.pathname} with search params: ${req.nextUrl.search}`
  );

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
          // This line is corrected for the build
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  if (req.nextUrl.pathname.startsWith("/login")) {
    // LOG 2
    console.log("[MIDDLEWARE] Path is /login, checking for message...");
    const message = req.nextUrl.searchParams.get("message");
    // LOG 3
    console.log("[MIDDLEWARE] Found message parameter:", message);

    if (message === "email-confirmed") {
      // LOG 4
      console.log(
        '[MIDDLEWARE] "email-confirmed" message found. Attempting to sign out...'
      );
      await supabase.auth.signOut();
      // LOG 5
      console.log(
        "[MIDDLEWARE] signOut() called. Allowing request to proceed to login page."
      );
      return res;
    }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  // LOG 6
  console.log(
    "[MIDDLEWARE] Session state:",
    session ? `Exists for user ${session.user.id}` : "is null"
  );

  if (session) {
    if (req.nextUrl.pathname.startsWith("/login")) {
      // LOG 7
      console.log(
        "[MIDDLEWARE] User has session and is on /login. Redirecting to /admin."
      );
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  } else {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      // LOG 8
      console.log(
        "[MIDDLEWARE] User has no session and is on /admin. Redirecting to /login."
      );
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // LOG 9
  console.log(
    "[MIDDLEWARE] No specific rules matched. Passing request through."
  );
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/forgot-password"],
};
