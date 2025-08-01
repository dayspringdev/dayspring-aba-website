// FILE: src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // This is the most critical check. We explicitly DO NOT run session logic on the callback route.
  if (req.nextUrl.pathname.startsWith("/auth/callback")) {
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

    if (message === "email-confirmed") {
      await supabase.auth.signOut();
      return res;
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (req.nextUrl.pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  } else {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

// This matcher is simpler and works with the logic above.
export const config = {
  matcher: ["/admin/:path*", "/login", "/forgot-password", "/auth/callback"],
};
