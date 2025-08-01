// FILE: src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  console.log(
    `[MIDDLEWARE START] Path: ${req.nextUrl.pathname}, Search: ${req.nextUrl.search}`
  );

  // This is the most critical check. We explicitly DO NOT run session logic on the callback route.
  if (req.nextUrl.pathname.startsWith("/auth/callback")) {
    console.log(
      "[MIDDLEWARE] Skipping auth callback route, allowing it to process."
    );
    return res;
  }

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

  // This block handles the final redirect after the callback has finished.
  if (req.nextUrl.pathname.startsWith("/login")) {
    const message = req.nextUrl.searchParams.get("message");
    console.log("[MIDDLEWARE] Path is /login. Message param:", message);

    if (message === "email-confirmed") {
      console.log(
        '[MIDDLEWARE] "email-confirmed" found! Signing out stale session.'
      );
      await supabase.auth.signOut();
      console.log("[MIDDLEWARE] SignOut complete. Allowing render of /login.");
      return res;
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(
    "[MIDDLEWARE] User state:",
    user ? `Exists for user ${user.id}` : "is null"
  );

  if (user) {
    if (req.nextUrl.pathname.startsWith("/login")) {
      console.log(
        "[MIDDLEWARE] User exists and is on /login. Redirecting to /admin."
      );
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  } else {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      console.log(
        "[MIDDLEWARE] No user and is on /admin. Redirecting to /login."
      );
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  console.log(
    "[MIDDLEWARE END] No redirect rules matched. Passing request through."
  );
  return res;
}

// This matcher is simpler and works with the logic above.
export const config = {
  matcher: ["/admin/:path*", "/login", "/forgot-password", "/auth/callback"],
};
