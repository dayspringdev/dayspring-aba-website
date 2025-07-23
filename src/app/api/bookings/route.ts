// FILE: src/app/api/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { getAvailableSlots } from "@/lib/db"; // <-- Re-use the same logic!
import { createClient } from "@/lib/supabase/server"; // <-- Import server client

export async function POST(request: NextRequest) {
  const supabase = createClient(); // <-- Create a context-aware server client

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If a user is found, they are an admin. Otherwise, it's a public user.
    const isAdminBooking = !!user;
    const body = await request.json();
    const { slotTime, clientDetails } = body as {
      slotTime: string;
      clientDetails: {
        firstName: string;
        lastName: string;
        email: string;
        notes?: string;
      };
    };

    if (
      !slotTime ||
      !clientDetails?.firstName ||
      !clientDetails?.lastName ||
      !clientDetails?.email
    ) {
      return NextResponse.json(
        { error: "slotTime and complete clientDetails are required" },
        { status: 400 }
      );
    }

    const requestedSlot = parseISO(slotTime);

    // --- CRUCIAL VALIDATION STEP using our new function ---
    const availableSlots = await getAvailableSlots(supabase, requestedSlot);
    const isStillAvailable = availableSlots.some(
      (s) => s.getTime() === requestedSlot.getTime()
    );

    if (!isStillAvailable) {
      return NextResponse.json(
        {
          error:
            "This time slot is no longer available. Please select another time.",
        },
        { status: 409 } // 409 Conflict
      );
    }

    // --- If validation passes, create the booking in Supabase ---
    const { data: newBooking, error } = await supabase
      .from("bookings")
      .insert({
        slot_time: requestedSlot.toISOString(),
        first_name: body.clientDetails.firstName,
        last_name: body.clientDetails.lastName,
        email: body.clientDetails.email,
        notes: body.clientDetails.notes || null,
        // --- THIS IS THE NEW LOGIC ---
        // If an admin is booking, confirm it immediately. Otherwise, it's pending.
        status: isAdminBooking ? "confirmed" : "pending",
      })
      .select()
      .single();

    if (error) {
      throw new Error("Could not create booking in the database.");
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      {
        error: `An unexpected error occurred while creating the booking: ${message}`,
      },
      { status: 500 }
    );
  }
}
