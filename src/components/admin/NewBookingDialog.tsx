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
import { format, parseISO, startOfDay, addDays } from "date-fns";
import { toast } from "sonner";

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
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to fetch available times
  useEffect(() => {
    if (selectedDate) {
      setIsLoadingTimes(true);
      setAvailableTimes([]);
      setSelectedTime(null);
      const dateParam = startOfDay(selectedDate).toISOString();
      fetch(`/api/availability?date=${dateParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAvailableTimes(data);
        })
        .finally(() => setIsLoadingTimes(false));
    }
  }, [selectedDate]);

  // Reset all state when the dialog is closed or opened
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setFormData(initialFormState);
        setSelectedDate(undefined);
        setAvailableTimes([]);
        setSelectedTime(null);
      }, 300);
    } else {
      // Pre-select a date if none is selected when opening
      if (!selectedDate) {
        const tomorrow = addDays(new Date(), 1);
        setSelectedDate(tomorrow);
      }
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedTime) return;
    setIsSubmitting(true);
    const promise = fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotTime: selectedTime,
        clientDetails: formData,
      }),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to create appointment.");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Creating appointment...",
      success: () => {
        onBookingCreated();
        onOpenChange(false);
        return "Appointment created successfully!";
      },
      error: (err) => err.message,
      finally: () => setIsSubmitting(false),
    });
  };

  const proceedToTimeSelection = () => {
    // If a date hasn't already been picked, default to tomorrow.
    if (!selectedDate) {
      const tomorrow = addDays(new Date(), 1);
      setSelectedDate(tomorrow);
    }
    setStep(2);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: // Client Information
        return (
          // --- CHANGE: Added flexbox centering classes ---
          <div className="min-h-[340px] flex justify-center items-center">
            <div className="w-full grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 2: // Date and Time Selection
        return (
          // The content of this step already fills the space, so no centering needed.
          // The existing wrapper provides the consistent height.
          <div className="min-h-[340px] grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="flex justify-center items-center">
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
                {selectedDate ? format(selectedDate, "PPP") : "..."}
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
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                  >
                    {format(parseISO(time), "p")}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3: // Review
        return (
          // --- CHANGE: Added flexbox centering classes ---
          <div className="min-h-[340px] flex justify-center items-center">
            <div className="w-full space-y-4 py-4 text-sm">
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
                  {selectedDate ? format(selectedDate, "PPPP") : "Not selected"}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {selectedTime
                    ? format(parseISO(selectedTime), "p")
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
            {/* This button now calls our updated function */}
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
              {isSubmitting ? "Creating..." : "Confirm & Create"}
            </Button>
          </DialogFooter>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The consistent size is now controlled by the min-height in renderStepContent */}
      <DialogContent className="sm:max-w-[625px] p-10">
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
