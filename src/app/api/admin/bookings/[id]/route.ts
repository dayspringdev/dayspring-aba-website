// FILE: src/app/api/admin/bookings/[id]/route.ts
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/db"; // <-- Import core logic
import { NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { id } = params;
  const { status, newSlotTime } = await request.json(); // <-- Check for newSlotTime

  const bookingId = parseInt(id, 10);
  if (isNaN(bookingId)) {
    return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
  }

  // --- LOGIC FOR STATUS UPDATE ---
  if (status) {
    if (!["confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided." },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: status })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update status." },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  }

  // --- NEW LOGIC FOR RESCHEDULING ---
  if (newSlotTime) {
    const requestedSlot = parseISO(newSlotTime);

    // Validate that the new slot is actually available
    const availableSlots = await getAvailableSlots(supabase, requestedSlot);
    const isStillAvailable = availableSlots.some(
      (s) => s.getTime() === requestedSlot.getTime()
    );

    if (!isStillAvailable) {
      return NextResponse.json(
        { error: "This time slot is not available for rescheduling." },
        { status: 409 } // 409 Conflict
      );
    }

    // If available, update the booking's time and set status to 'confirmed'
    const { data, error } = await supabase
      .from("bookings")
      .update({ slot_time: newSlotTime, status: "confirmed" })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to reschedule booking." },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
}
