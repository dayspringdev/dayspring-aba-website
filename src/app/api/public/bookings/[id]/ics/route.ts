// FILE: src/app/api/public/bookings/[id]/ics/route.ts

import { publicSupabase } from "@/lib/supabase/public-server";
import { formatInTimeZone } from "date-fns-tz";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0; // Ensure this route is always dynamic

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Fetch the specific booking using the public client
  const bookingId = parseInt(params.id, 10);
  if (isNaN(bookingId)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  const { data: booking, error } = await publicSupabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    // Return a generic 404 to avoid leaking information about which IDs exist
    return new NextResponse("Not Found", { status: 404 });
  }

  // 2. Format dates into the required UTC 'Zulu' format (YYYYMMDDTHHMMSSZ)
  const startTime = new Date(booking.slot_time);
  const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // Assuming 15-minute consultation
  const now = new Date();

  const formatForICS = (date: Date) =>
    formatInTimeZone(date, "Etc/UTC", "yyyyMMdd'T'HHmmss'Z'");

  const formattedStartTime = formatForICS(startTime);
  const formattedEndTime = formatForICS(endTime);
  const formattedNow = formatForICS(now);

  // 3. Create the .ics file content as a string
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
    `ATTENDEE;CN="${booking.first_name} ${booking.last_name}";ROLE=REQ-PARTICIPANT:mailto:${booking.email}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  // 4. Return the response with correct headers for a file download
  const headers = new Headers();
  headers.set("Content-Type", "text/calendar; charset=utf-8");
  headers.set("Content-Disposition", 'attachment; filename="appointment.ics"');

  return new NextResponse(icsContent, { status: 200, headers });
}
