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
import { format } from "date-fns-tz"; // IMPORT zonedTimeToUtc and format

import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TIMEZONE } from "./config"; // IMPORT our TIMEZONE constant

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


  // The logic is simpler. We create a Date object assuming the time is in the user's
  // local timezone, and then we adjust it to be the correct UTC time as if that
  // local time were actually in Toronto.

  // Get the timezone offset for the Toronto timezone FOR THE SPECIFIC aPPOINTMENT DATE.
  // This correctly handles Daylight Saving Time.
  const torontoOffset = new Date(date)
    .toLocaleString("en-US", {
      timeZone: TIMEZONE,
      timeZoneName: "shortOffset",
    })
    .split("UTC")[1]; // e.g., "-04:00"

  const potentialSlots: Date[] = rule.available_slots.map((timeStr) => {
    // 1. Create a naive Date object by combining the selected date with the time string.
    //    For example, if the user chose July 30 and the time is '09:00:00',
    //    this creates a date for July 30, 9:00 AM *in the server's local timezone (UTC)*.
    const naiveDate = parse(timeStr, "HH:mm:ss", date);

    // 2. We now treat this naive date as if it were a Toronto time. We create an ISO
    //    string that explicitly includes the Toronto timezone offset we calculated.
    //    e.g., "2024-07-30T09:00:00.000-04:00"
    const isoStringWithOffset = `${format(naiveDate, "yyyy-MM-dd'T'HH:mm:ss.SSS")}${torontoOffset}`;

    // 3. Finally, create a new Date object from this correctly-offset string.
    //    This will result in the correct UTC timestamp in the database.
    return new Date(isoStringWithOffset);
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
