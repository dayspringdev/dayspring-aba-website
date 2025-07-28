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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // This part is still correct: we construct the URL we want to send the user to.
  const redirectUrl = new URL(request.url).origin;
  const redirectTo = `${redirectUrl}/login?message=email-confirmed`;

  // Use the updateUser method to change the email.
  const { error } = await supabase.auth.updateUser(
    {
      email: newEmail,
    },
    {
      // The correct property name for this operation is `emailRedirectTo`.
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
