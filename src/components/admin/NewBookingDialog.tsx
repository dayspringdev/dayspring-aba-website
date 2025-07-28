// src/components/admin/NewBookingDialog.tsx

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  format,
  parseISO,
  startOfDay,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { toast } from "sonner";
import { CalendarSkeleton } from "@/components/CalendarSkeleton";
import { Loader2 } from "lucide-react";

// === FIX 1: Define the type for a time slot object ===
type TimeSlot = {
  utc: string;
  local: string;
};

interface NewBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated: () => void;
}

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  notes: "",
};

export function NewBookingDialog({
  open,
  onOpenChange,
  onBookingCreated,
}: NewBookingDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  // === FIX 2: Update state to hold an array of TimeSlot objects ===
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  // === FIX 3: Update state to hold a single TimeSlot object or null ===
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

  // Correctly fetch time slots when the date changes
  useEffect(() => {
    if (selectedDate) {
      setIsLoadingTimes(true);
      setAvailableTimes([]);
      setSelectedTime(null);
      const dateParam = startOfDay(selectedDate).toISOString();
      fetch(`/api/availability?date=${dateParam}`)
        .then((res) => res.json())
        // === FIX 4: Correctly type the incoming data ===
        .then((data: TimeSlot[]) => {
          if (Array.isArray(data)) setAvailableTimes(data);
        })
        .finally(() => setIsLoadingTimes(false));
    }
  }, [selectedDate]);

  // Fetch month availability (no changes needed here)
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

  // Reset state on close (no changes needed here)
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setFormData(initialFormState);
        setSelectedDate(undefined);
        setAvailableTimes([]);
        setSelectedTime(null);
        setEmailError(null);
      }, 300);
    } else {
      if (!selectedDate) {
        const tomorrow = addDays(new Date(), 1);
        setSelectedDate(tomorrow);
      }
    }
  }, [open, selectedDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === "email" && emailError) {
      setEmailError(null);
    }
  };

  const handleSubmit = async () => {
    // === FIX 5: Ensure we use the UTC time string for submission ===
    if (!selectedTime?.utc) return;
    setIsSubmitting(true);
    const promise = fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotTime: selectedTime.utc,
        clientDetails: formData,
        bookedByAdmin: true,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create appointment.");
      }
      return res.json();
    });
    toast.promise(promise, {
      loading: "Creating appointment...",
      success: () => {
        onBookingCreated();
        onOpenChange(false);
        return "Appointment created successfully!";
      },
      error: (err) => {
        if (err.message.includes("no longer available")) {
          setStep(2);
          setSelectedTime(null);
        }
        return err.message;
      },
      finally: () => setIsSubmitting(false),
    });
  };

  const proceedToTimeSelection = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);
    if (!selectedDate) {
      const tomorrow = addDays(new Date(), 1);
      setSelectedDate(tomorrow);
    }
    setStep(2);
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="py-4">
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={emailError ? "border-destructive" : ""}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="flex justify-center items-center">
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
                {selectedDate ? format(selectedDate, "PPP") : "..."}
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
                {/* === FIX 6: Update the mapping logic === */}
                {availableTimes.map((time) => (
                  <Button
                    key={time.utc}
                    type="button"
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
        );
      case 3:
        return (
          <div className="flex justify-center items-center py-4">
            <div className="w-full space-y-4 text-sm">
              <p>Please confirm the details for the new appointment:</p>
              <div className="space-y-2 rounded-md border p-4 border-muted/20">
                <p>
                  <strong>Client:</strong> {formData.firstName}{" "}
                  {formData.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedDate
                    ? format(selectedDate, "EEEE, PPP")
                    : "Not selected"}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {/* === FIX 7: Display the local time from the object === */}
                  {selectedTime?.local
                    ? `${selectedTime.local}`
                    : "Not selected"}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (step) {
      case 1:
        return (
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
              onClick={proceedToTimeSelection}
              disabled={
                !formData.firstName || !formData.lastName || !formData.email
              }
            >
              Next
            </Button>
          </DialogFooter>
        );
      case 2:
        return (
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={() => setStep(3)}
              disabled={!selectedTime}
            >
              Review
            </Button>
          </DialogFooter>
        );
      case 3:
        return (
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Confirm & Create"
              )}
            </Button>
          </DialogFooter>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] p-6 md:p-10">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            {step === 1 && "Step 1: Enter client information."}
            {step === 2 && "Step 2: Choose a date and time."}
            {step === 3 && "Step 3: Review and confirm."}
          </DialogDescription>
        </DialogHeader>
        {renderStepContent()}
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
}
