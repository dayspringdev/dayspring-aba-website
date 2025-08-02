// FILE: src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatInTimeZone } from "date-fns-tz";
import type { Database } from "@/types/supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export function generateGoogleCalendarLink(
  booking: Booking,
  businessEmail: string
): string {
  const startTime = new Date(booking.slot_time);
  // Assuming a 15-minute consultation
  const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);

  const formatForGoogle = (date: Date) =>
    formatInTimeZone(date, "Etc/UTC", "yyyyMMdd'T'HHmmss'Z'");

  const description = `This is your scheduled 15-minute consultation with Dayspring Behavioural Therapeutic Services.\n\nYour submitted notes: ${
    booking.notes || "N/A"
  }\n\nFor more information, please visit https://dayspringaba.ca`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Consultation with Dayspring BTS`,
    dates: `${formatForGoogle(startTime)}/${formatForGoogle(endTime)}`,
    details: description,
    // Add both the client and the business as guests. The user clicking the link is the organizer.
    add: `${booking.email},${businessEmail}`,
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}
