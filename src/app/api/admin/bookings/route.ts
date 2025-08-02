// FILE: src/app/api/admin/bookings/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBusinessEmail } from "@/lib/data-access/homepage";

/**
 * @route   GET /api/admin/bookings
 * @desc    Retrieves a list of all upcoming bookings and the business email.
 */
export async function GET() {
  const supabase = createClient();

  const now = new Date().toISOString();

  // Fetch bookings and the business email in parallel for efficiency
  const [bookingsRes, businessEmail] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .gte("slot_time", now)
      .order("slot_time", { ascending: true }),
    getBusinessEmail(),
  ]);

  const { data: bookings, error } = bookingsRes;

  if (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }

  // Return a single object containing both bookings and the business email
  return NextResponse.json({ bookings, businessEmail: businessEmail || "" });
}
