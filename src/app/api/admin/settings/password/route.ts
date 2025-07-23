// FILE: src/app/api/admin/settings/password/route.ts

// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { newPassword, confirmPassword } = await request.json();

  // Basic validation
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "New passwords do not match." },
      { status: 400 }
    );
  }

  // Create our consistent server client
  const supabase = createClient();

  // Get the currently authenticated user (the API is slightly different)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Use the updateUser method to change the password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update password." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Password updated successfully!" });
}
