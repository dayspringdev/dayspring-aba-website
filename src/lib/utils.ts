// FILE: src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatInTimeZone } from "date-fns-tz";
import type { Database } from "@/types/supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export function generateGoogleCalendarLink(booking: Booking): string {
  const startTime = new Date(booking.slot_time);
  // Assuming a 15-minute consultation
  const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);

  const formatForGoogle = (date: Date) =>
    formatInTimeZone(date, "Etc/UTC", "yyyyMMdd'T'HHmmss'Z'");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Consultation: ${booking.first_name} ${booking.last_name}`,
    dates: `${formatForGoogle(startTime)}/${formatForGoogle(endTime)}`,
    details: `Client Name: ${booking.first_name} ${booking.last_name}\nEmail: ${booking.email}\n\nNotes: ${booking.notes || "N/A"}`,
    add: booking.email, // Automatically adds the client as a guest
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}
