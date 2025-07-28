// FILE: src/lib/db.ts

import {
  startOfDay,
  getDay,
  parse,
  isWithinInterval,
  isEqual,
  addHours,
  endOfDay,
} from "date-fns";
// We only need this one function from date-fns-tz
import { toZonedTime } from "date-fns-tz";
import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TIMEZONE } from "./config";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type RecurringRule =
  Database["public"]["Tables"]["recurring_availability_rules"]["Row"];
export type Override =
  Database["public"]["Tables"]["availability_overrides"]["Row"];

function getDayInToronto(date: Date): number {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return getDay(zonedDate);
}

export const getAvailableSlots = async (
  supabase: SupabaseClient<Database>,
  date: Date
): Promise<Date[]> => {
  const bookingLeadTimeHours = 2;
  const now = new Date();
  const earliestBookingTime = addHours(now, bookingLeadTimeHours);

  const dayOfWeek = getDayInToronto(date);
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
  const todaysOverrides: Override[] = overridesRes.data || [];
  const todaysBookings = bookingsRes.data || [];

  if (!rule || !rule.available_slots || rule.available_slots.length === 0) {
    return [];
  }

  // --- THIS IS THE FINAL, SIMPLIFIED FIX ---
  // 1. Get the timezone offset in milliseconds for the target timezone on the specific date.
  //    This is the difference between a local time and UTC time.
  const timezoneOffset =
    new Date(date.toLocaleString("en-US", { timeZone: TIMEZONE })).getTime() -
    date.getTime();

  const potentialSlots: Date[] = rule.available_slots.map((timeStr) => {
    // 2. Create a naive Date object by parsing the time string against the UTC start of the day.
    const naiveSlot = parse(timeStr, "HH:mm:ss", dayStart);

    // 3. Create the correct UTC Date by subtracting the timezone offset.
    //    e.g., (9:00 AM UTC) - (-4 hours in ms) = 1:00 PM UTC, which is 9 AM in Toronto.
    return new Date(naiveSlot.getTime() - timezoneOffset);
  });
  // --- END OF FIX ---

  const isCheckingToday = isEqual(startOfDay(new Date()), startOfDay(date));

  const availableSlots = potentialSlots.filter((slot) => {
    const isAfterLeadTime = isCheckingToday ? slot > earliestBookingTime : true;

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
