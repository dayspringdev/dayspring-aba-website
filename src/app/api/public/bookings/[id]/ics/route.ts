// FILE: src/app/api/public/bookings/[id]/ics/route.ts

import { publicSupabase } from "@/lib/supabase/public-server";
import { formatInTimeZone } from "date-fns-tz";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessEmail } from "@/lib/data-access/homepage";

export const revalidate = 0; // Ensure this route is always dynamic

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const bookingId = parseInt(params.id, 10);
  if (isNaN(bookingId)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  // Fetch booking and business email in parallel
  const [bookingRes, businessEmail] = await Promise.all([
    publicSupabase.from("bookings").select("*").eq("id", bookingId).single(),
    getBusinessEmail(),
  ]);

  const { data: booking, error } = bookingRes;

  if (error || !booking) {
    return new NextResponse("Not Found", { status: 404 });
  }
  if (!businessEmail) {
    console.error("Business email not found for ICS generation.");
    // Proceed without organizer if not found
  }

  const startTime = new Date(booking.slot_time);
  const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
  const now = new Date();
  const formatForICS = (date: Date) =>
    formatInTimeZone(date, "Etc/UTC", "yyyyMMdd'T'HHmmss'Z'");

  const description =
    `This is your scheduled 15-minute consultation with Dayspring Behavioural Therapeutic Services.\\n\\nYour submitted notes: ${
      booking.notes || "N/A"
    }\\n\\nFor more information, please visit https://dayspringaba.ca`.replace(
      /\r\n/g,
      "\\n"
    );

  const businessName = "Dayspring BTS";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DayspringBTS//NONSGML v1.0//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@dayspringaba.ca`,
    `DTSTAMP:${formatForICS(now)}`,
    `DTSTART:${formatForICS(startTime)}`,
    `DTEND:${formatForICS(endTime)}`,
    `SUMMARY:Consultation with ${businessName}`,
    `DESCRIPTION:${description}`,
    businessEmail
      ? `ORGANIZER;CN="${businessName}":mailto:${businessEmail}`
      : "",
    businessEmail
      ? `ATTENDEE;CN="${businessName}";ROLE=CHAIR:mailto:${businessEmail}`
      : "",
    `ATTENDEE;CN="${booking.first_name} ${booking.last_name}";ROLE=REQ-PARTICIPANT:mailto:${booking.email}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean) // Remove empty lines if businessEmail is null
    .join("\r\n");

  const headers = new Headers();
  headers.set("Content-Type", "text/calendar; charset=utf-8");
  headers.set("Content-Disposition", 'attachment; filename="appointment.ics"');

  return new NextResponse(icsContent, { status: 200, headers });
}
