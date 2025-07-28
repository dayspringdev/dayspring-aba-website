// FILE: src/lib/db.ts

import {
  startOfDay,
  getDay, // We will use getDay, but on a UTC-adjusted date
  parse,
  isWithinInterval,
  isEqual,
  addHours,
  endOfDay,
  addMinutes, // Import the addMinutes function
} from "date-fns";
import { zonedTimeToUtc, format } from "date-fns-tz"; // 👈 IMPORT zonedTimeToUtc and format

import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TIMEZONE } from "./config"; // 👈 IMPORT our TIMEZONE constant

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type RecurringRule =
  Database["public"]["Tables"]["recurring_availability_rules"]["Row"];
export type Override =
  Database["public"]["Tables"]["availability_overrides"]["Row"];

/**
 * CORRECTED HELPER: A helper function to get the day of the week in UTC.
 * This prevents timezone mismatches between the client and server.
 * @param date The local date from the client.
 * @returns The UTC day of the week (0 for Sunday, 1 for Monday, etc.).
 */
const getUTCDay = (date: Date): number => {
  // 1. Get the timezone offset in minutes from the provided date.
  const timezoneOffset = date.getTimezoneOffset();
  // 2. Create a new Date object that is adjusted to UTC by adding the offset.
  const utcDate = addMinutes(date, timezoneOffset);
  // 3. Get the day of the week from this new UTC-aligned date.
  return getDay(utcDate);
};

export const getAvailableSlots = async (
  supabase: SupabaseClient<Database>,
  date: Date
): Promise<Date[]> => {
  const bookingLeadTimeHours = 2;
  const now = new Date();
  const earliestBookingTime = addHours(now, bookingLeadTimeHours);

  // Use our new, correct, UTC-safe helper function
  const dayOfWeek = getUTCDay(date);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [ruleRes, overridesRes, bookingsRes] = await Promise.all([
    supabase
      .from("recurring_availability_rules")
      .select("available_slots")
      .eq("day_of_week", dayOfWeek)
      .single(),

    supabase
      .from("availability_overrides")
      .select("*")
      .gte("start_time", dayStart.toISOString())
      .lte("end_time", dayEnd.toISOString()),

    supabase
      .from("bookings")
      .select("slot_time")
      .gte("slot_time", dayStart.toISOString())
      .lte("slot_time", dayEnd.toISOString())
      .in("status", ["pending", "confirmed"]),
  ]);

  const rule = ruleRes.data;
  const todaysOverrides = overridesRes.data || [];
  const todaysBookings = bookingsRes.data || [];

  if (!rule || !rule.available_slots || rule.available_slots.length === 0) {
    return [];
  }

  // Get the date part as a string (e.g., "2025-07-29")
  const datePart = format(date, "yyyy-MM-dd");

  // AFTER: This now correctly creates timezone-aware dates.
  const potentialSlots: Date[] = rule.available_slots.map((timeStr) => {
    // 1. Create a full string representing the LOCAL time, e.g., "2025-07-29T09:00:00"
    const localDateTimeString = `${datePart}T${timeStr}`;
    // 2. Tell the library to interpret this string as a time in the Toronto timezone
    //    and convert it to a universal UTC Date object.
    return zonedTimeToUtc(localDateTimeString, TIMEZONE);
  });

  const availableSlots = potentialSlots.filter((slot) => {
    const isAfterLeadTime = slot > earliestBookingTime;
    const isBooked = todaysBookings.some((booking) =>
      isEqual(new Date(booking.slot_time), slot)
    );
    const isOverridden = todaysOverrides.some((override) =>
      isWithinInterval(slot, {
        start: new Date(override.start_time),
        end: new Date(override.end_time),
      })
    );
    return isAfterLeadTime && !isBooked && !isOverridden;
  });

  return availableSlots;
};
