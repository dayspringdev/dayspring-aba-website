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
import { format, parseISO, startOfDay, addDays, isPast } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/types/supabase";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

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
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Effect to fetch available times when a new date is selected
  useEffect(() => {
    if (selectedDate) {
      setIsLoadingTimes(true);
      setAvailableTimes([]);
      setSelectedTime(null);
      const dateParam = startOfDay(selectedDate).toISOString();
      fetch(`/api/availability?date=${dateParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAvailableTimes(data);
          }
        })
        .finally(() => setIsLoadingTimes(false));
    }
  }, [selectedDate]);

  // Set initial date when the dialog opens
  useEffect(() => {
    if (open && booking) {
      // When the dialog opens, check the original booking's date
      const originalDate = startOfDay(new Date(booking.slot_time));

      // If the original booking date is in the past...
      if (isPast(originalDate)) {
        // ...default to tomorrow.
        setSelectedDate(addDays(new Date(), 1));
      } else {
        // ...otherwise, default to the original date.
        setSelectedDate(originalDate);
      }
    } else {
      // When it closes, clear everything out
      setSelectedDate(undefined);
      setAvailableTimes([]);
      setSelectedTime(null);
    }
  }, [open, booking]);

  const handleConfirmReschedule = async () => {
    if (!booking || !selectedTime) return;

    const promise = fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newSlotTime: selectedTime }),
    }).then((res) => {
      if (!res.ok) {
        // Try to get a more specific error message from the API
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
      error: (err) => err.message, // Display the specific error message
    });
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
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < startOfDay(new Date())}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Available Times for{" "}
              {selectedDate ? format(selectedDate, "PPP") : "a selected date"}
            </p>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2">
              {isLoadingTimes && (
                <p className="col-span-3 text-sm text-muted-foreground animate-pulse">
                  Loading...
                </p>
              )}
              {!isLoadingTimes &&
                availableTimes.length === 0 &&
                selectedDate && (
                  <p className="col-span-3 text-sm text-muted-foreground">
                    No available slots.
                  </p>
                )}
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                >
                  {format(parseISO(time), "p")}
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
