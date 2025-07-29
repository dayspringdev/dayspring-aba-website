// FILE: src/app/api/admin/bookings/[id]/ics/route.ts

import { createClient } from "@/lib/supabase/server";
import { formatInTimeZone } from "date-fns-tz";
import { NextRequest, NextResponse } from "next/server";
// import { TIMEZONE } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // 1. Authenticate the request
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Fetch the specific booking
  const bookingId = parseInt(params.id, 10);
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // 3. Format dates into the required UTC 'Zulu' format (YYYYMMDDTHHMMSSZ)
  const startTime = new Date(booking.slot_time);
  // Assuming a 15-minute consultation for the end time. Adjust if needed.
  const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
  const now = new Date();

  const formatForICS = (date: Date) =>
    formatInTimeZone(date, "Etc/UTC", "yyyyMMdd'T'HHmmss'Z'");

  const formattedStartTime = formatForICS(startTime);
  const formattedEndTime = formatForICS(endTime);
  const formattedNow = formatForICS(now);

  // 4. Create the .ics file content as a string
  const description = (booking.notes || "No additional notes.")
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DayspringBTS//NONSGML v1.0//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@dayspringaba.ca`,
    `DTSTAMP:${formattedNow}`,
    `DTSTART:${formattedStartTime}`,
    `DTEND:${formattedEndTime}`,
    `SUMMARY:Consultation: ${booking.first_name} ${booking.last_name}`,
    `DESCRIPTION:${description}`,
    // Add the client as a guest to the event
    `ATTENDEE;CN="${booking.first_name} ${booking.last_name}";ROLE=REQ-PARTICIPANT:mailto:${booking.email}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  // 5. Return the response with correct headers for a file download
  const headers = new Headers();
  headers.set("Content-Type", "text/calendar; charset=utf-8");
  headers.set("Content-Disposition", 'attachment; filename="appointment.ics"');

  return new NextResponse(icsContent, { status: 200, headers });
}
