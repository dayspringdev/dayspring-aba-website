"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  parseISO,
  startOfDay,
  addDays,
  isPast,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/types/supabase";
import { CalendarSkeleton } from "@/components/CalendarSkeleton";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

// 1. DEFINE the correct type for a time slot object
type TimeSlot = {
  utc: string;
  local: string;
};

interface RescheduleDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescheduled: () => void;
}

export function RescheduleDialog({
  booking,
  open,
  onOpenChange,
  onRescheduled,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  // 2. UPDATE state to hold an array of TimeSlot objects
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  // 3. UPDATE state to hold a single TimeSlot object or null
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

  useEffect(() => {
    if (selectedDate) {
      setIsLoadingTimes(true);
      setAvailableTimes([]);
      setSelectedTime(null);
      const dateParam = startOfDay(selectedDate).toISOString();
      fetch(`/api/availability?date=${dateParam}`)
        .then((res) => res.json())
        // 4. EXPLICITLY type the incoming data
        .then((data: TimeSlot[]) => {
          if (Array.isArray(data)) {
            setAvailableTimes(data);
          }
        })
        .finally(() => setIsLoadingTimes(false));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (open) {
      setIsLoadingAvailability(true);
      setUnavailableDates([]);
      const firstDayOfMonth = startOfMonth(currentMonth);
      const lastDayOfMonth = endOfMonth(currentMonth);
      const firstDayToFetch = startOfWeek(firstDayOfMonth);
      const lastDayToFetch = endOfWeek(lastDayOfMonth);
      const startParam = firstDayToFetch.toISOString();
      const endParam = lastDayToFetch.toISOString();

      fetch(`/api/availability?start=${startParam}&end=${endParam}`)
        .then((res) => res.json())
        .then((dates: string[]) => {
          const unavailable = dates.map((d) => startOfDay(parseISO(d)));
          setUnavailableDates(unavailable);
        })
        .catch(() => toast.error("Failed to load calendar availability."))
        .finally(() => setIsLoadingAvailability(false));
    }
  }, [currentMonth, open]);

  useEffect(() => {
    if (open && booking) {
      const originalDate = startOfDay(new Date(booking.slot_time));
      if (isPast(originalDate)) {
        const tomorrow = addDays(new Date(), 1);
        setSelectedDate(tomorrow);
        setCurrentMonth(startOfMonth(tomorrow));
      } else {
        setSelectedDate(originalDate);
        setCurrentMonth(startOfMonth(originalDate));
      }
    } else {
      setSelectedDate(undefined);
      setAvailableTimes([]);
      setSelectedTime(null);
    }
  }, [open, booking]);

  const handleConfirmReschedule = async () => {
    if (!booking || !selectedTime) return;
    // 5. SEND the correct UTC time string from the selected object
    const promise = fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newSlotTime: selectedTime.utc }),
    }).then((res) => {
      if (!res.ok) {
        return res.json().then((err) => {
          throw new Error(err.error || "Failed to reschedule.");
        });
      }
      return res.json();
    });
    toast.promise(promise, {
      loading: "Rescheduling appointment...",
      success: () => {
        onRescheduled();
        return "Appointment rescheduled successfully!";
      },
      error: (err) => err.message,
    });
  };

  const isDateDisabled = (date: Date) => {
    if (isLoadingAvailability) return true;
    const today = startOfDay(new Date());
    if (date < today) return true;
    return unavailableDates.some(
      (unavailableDate) =>
        unavailableDate.getTime() === startOfDay(date).getTime()
    );
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for {booking.first_name}{" "}
            {booking.last_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="flex justify-center">
            {isLoadingAvailability ? (
              <CalendarSkeleton />
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                disabled={isDateDisabled}
                modifiers={{ unavailable: unavailableDates }}
                modifiersClassNames={{
                  unavailable: "text-foreground/60 line-through",
                }}
              />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Available Times for{" "}
              {selectedDate ? format(selectedDate, "PPP") : "a selected date"}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0">
              {isLoadingTimes && (
                <p className="w-full text-sm text-muted-foreground animate-pulse md:col-span-3">
                  Loading...
                </p>
              )}
              {!isLoadingTimes &&
                availableTimes.length === 0 &&
                selectedDate && (
                  <p className="w-full text-sm text-muted-foreground md:col-span-3">
                    No available slots.
                  </p>
                )}
              {/* 6. UPDATE the mapping logic to use the object's properties */}
              {availableTimes.map((time) => (
                <Button
                  key={time.utc}
                  variant={
                    selectedTime?.utc === time.utc ? "default" : "outline"
                  }
                  onClick={() => setSelectedTime(time)}
                  className="flex-shrink-0"
                >
                  {time.local}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmReschedule}
            disabled={!selectedTime || isLoadingTimes}
          >
            Confirm Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
