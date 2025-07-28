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
import { toZonedTime } from "date-fns-tz";
import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TIMEZONE } from "./config";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type RecurringRule =
  Database["public"]["Tables"]["recurring_availability_rules"]["Row"];
export type Override =
  Database["public"]["Tables"]["availability_overrides"]["Row"];

// 👇 THIS IS THE CORRECT, ROBUST HELPER FUNCTION 👇
const getDayInToronto = (date: Date): number => {
  // 1. Take the incoming UTC date.
  // 2. Convert it to the correct date and time in the Toronto timezone.
  const zonedDate = toZonedTime(date, TIMEZONE);
  // 3. Get the day of the week *from that correctly zoned date*.
  return getDay(zonedDate);
};

export const getAvailableSlots = async (
  supabase: SupabaseClient<Database>,
  date: Date
): Promise<Date[]> => {
  const bookingLeadTimeHours = 2;
  const now = new Date();
  const earliestBookingTime = addHours(now, bookingLeadTimeHours);

  // 👇 USE THE NEW, CORRECT HELPER FUNCTION 👇
  const dayOfWeek = getDayInToronto(date);

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // ... (the database queries are now guaranteed to get the correct day's rule)
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

  // --- This logic is now correct because dayOfWeek was fetched correctly ---
  const zonedDayStart = toZonedTime(dayStart, TIMEZONE);
  const offsetMinutes = differenceInMinutes(zonedDayStart, dayStart);

  const potentialSlots: Date[] = rule.available_slots.map((timeStr) => {
    const naiveSlot = parse(timeStr, "HH:mm:ss", dayStart);
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
