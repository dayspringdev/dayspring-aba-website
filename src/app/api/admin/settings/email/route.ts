// FILE: src/app/api/admin/settings/email/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { newEmail } = await request.json();

  if (!newEmail) {
    return NextResponse.json(
      { error: "New email is required." },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // GOOD PRACTICE FIX: Use getUser() to avoid security warnings in logs.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const redirectUrl = new URL(request.url).origin;
  const redirectTo = `${redirectUrl}/login?message=email-confirmed`;
  console.log(
    "[API /admin/settings/email] Generated redirectTo URL:",
    redirectTo
  );

  const { error } = await supabase.auth.updateUser(
    {
      email: newEmail,
    },
    {
      emailRedirectTo: redirectTo,
    }
  );

  if (error) {
    console.error("Email update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update email." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `Verification link sent to ${newEmail}. Please check your inbox to confirm the change.`,
  });
}
