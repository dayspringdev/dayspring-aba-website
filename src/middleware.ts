// FILE: ./middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // We need to create a response object that we can modify
  const res = NextResponse.next();

  // Create a Supabase client that can be used in Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // The crucial step: get the session from the request cookies
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access a protected route
  if (!session && req.nextUrl.pathname.startsWith("/admin")) {
    // Redirect them to the login page
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If there IS a session and the user tries to go to the login page
  if (session && req.nextUrl.pathname === "/login") {
    // Redirect them to the admin dashboard
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // If all checks pass, allow the request to continue
  return res;
}

// Ensure the middleware runs only on the routes we care about
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
