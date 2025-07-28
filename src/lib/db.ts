// FILE: src/lib/db.ts

import {
  startOfDay,
  getDay,
  parse,
  isWithinInterval,
  isEqual,
  addHours,
  endOfDay,
  addMinutes,
  differenceInMinutes,
} from "date-fns";
// 👇 CORRECTED IMPORT: Use 'toZonedTime' instead of the non-existent 'utcToZonedTime'
import { toZonedTime } from "date-fns-tz";
import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TIMEZONE } from "./config";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type RecurringRule =
  Database["public"]["Tables"]["recurring_availability_rules"]["Row"];
export type Override =
  Database["public"]["Tables"]["availability_overrides"]["Row"];

export const getAvailableSlots = async (
  supabase: SupabaseClient<Database>,
  date: Date
): Promise<Date[]> => {
  const bookingLeadTimeHours = 2;
  const now = new Date();
  const earliestBookingTime = addHours(now, bookingLeadTimeHours);

  // The server environment is UTC. getDay() will correctly return the UTC day of the week.
  const dayOfWeek = getDay(date);

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

  // --- THIS IS THE DEFINITIVE FIX USING THE CORRECT FUNCTION ---
  // Convert the start of the requested day (which is in UTC) to the target timezone.
  // 👇 CORRECTED FUNCTION NAME
  const zonedDayStart = toZonedTime(dayStart, TIMEZONE);

  // Find the difference in minutes between the UTC start of the day and the zoned start of the day.
  const offsetMinutes = differenceInMinutes(zonedDayStart, dayStart);

  const potentialSlots: Date[] = rule.available_slots.map((timeStr) => {
    // 1. Create a "naive" date by parsing the time string against the UTC start of the day.
    const naiveSlot = parse(timeStr, "HH:mm:ss", dayStart);

    // 2. Correct the timezone by subtracting the offset we calculated.
    return addMinutes(naiveSlot, -offsetMinutes);
  });
  // --- END OF FIX ---

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
