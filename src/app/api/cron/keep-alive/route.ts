// FILE: src/app/api/cron/keep-alive/route.ts

import { NextRequest, NextResponse } from "next/server";
// Import your existing public Supabase client
import { publicSupabase } from "@/lib/supabase/public-server";

// This tells Vercel to not cache this route
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // 1. Secure the endpoint with a secret from environment variables
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  // 2. Perform a lightweight, read-only query using the public client
  // This is safe and uses the anon key you already have configured.
  const { error } = await publicSupabase.from("profiles").select("id").limit(1);

  if (error) {
    console.error("Supabase keep-alive ping failed:", error);
    return NextResponse.json(
      { message: "Error pinging database", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Database pinged successfully" });
}
