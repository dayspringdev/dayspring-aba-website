// FILE: src/app/api/admin/bookings/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // <-- Import the correct server client helper

/**
 * @route   GET /api/admin/bookings
 * @desc    Retrieves a list of all upcoming bookings for the admin dashboard.
 */
export async function GET() {
  const supabase = createClient(); // <-- Create client for THIS request

  const now = new Date().toISOString();

  // Fetch all bookings from today onwards from the 'bookings' table in Supabase
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .gte("slot_time", now) // Only get bookings from now into the future
    .order("slot_time", { ascending: true }); // Sort them by the soonest first

  if (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }

  // If successful, return the data fetched from Supabase
  return NextResponse.json(bookings);
}
