"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // We'll need this for Step 1
import { Label } from "@/components/ui/label"; // And this
import { OverrideManager } from "@/components/admin/OverrideManager";
import { ScheduleSummary } from "@/components/admin/ScheduleSummary"; // <-- Import the new summary component
import type { Database } from "@/types/supabase";
import { toast } from "sonner";
import { ScheduleSkeleton } from "@/components/admin/ScheduleSkeleton";
import { ArrowLeft, ArrowRight } from "lucide-react"; // For navigation

// --- Helper data remains the same ---
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 8; i < 21; i++) {
    slots.push(`${String(i).padStart(2, "0")}:00:00`);
    slots.push(`${String(i).padStart(2, "0")}:30:00`);
  }
  return slots;
};

const allPossibleSlots = generateTimeSlots();

const formatTime = (time: string) => {
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hour), parseInt(minute));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const daysOfWeekMap = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  0: "Sunday",
};

const orderedDaysOfWeek = [1, 2, 3, 4, 5, 6, 0];

type RuleState =
  Database["public"]["Tables"]["recurring_availability_rules"]["Row"];

export default function AvailabilityPage() {
  const [rules, setRules] = useState<RuleState[]>([]);
  const [originalRules, setOriginalRules] = useState<RuleState[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- NEW STATE for managing the stepped workflow ---
  const [step, setStep] = useState(1); // 1: Select days, 2: Select times
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [originalSelectedDays, setOriginalSelectedDays] = useState<Set<number>>(
    new Set()
  );

  const [currentDayIndex, setCurrentDayIndex] = useState(0); // Index for navigating through selectedDays

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/availability/rules");
      if (!response.ok) throw new Error("Could not fetch schedule.");
      const data: RuleState[] = await response.json();
      setRules(data);
      setSelectedDays(new Set(data.map((r) => r.day_of_week)));
      setOriginalRules(data);
      setOriginalSelectedDays(new Set(data.map((r) => r.day_of_week)));
    } catch {
      toast.error("Failed to load schedule.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // --- HANDLERS for the new UI ---
  const handleDayToggle = (dayId: number) => {
    setSelectedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  };

  const handleSlotToggle = (dayId: number, slot: string) => {
    setRules((currentRules) => {
      const dayRule = currentRules.find((r) => r.day_of_week === dayId);
      if (dayRule) {
        const slots = dayRule.available_slots || [];
        const newSlots = slots.includes(slot)
          ? slots.filter((s) => s !== slot)
          : [...slots, slot].sort();
        return currentRules.map((r) =>
          r.day_of_week === dayId ? { ...r, available_slots: newSlots } : r
        );
      } else {
        return [
          ...currentRules,
          { id: Date.now(), day_of_week: dayId, available_slots: [slot] },
        ];
      }
    });
  };

  const proceedToTimeSelection = () => {
    if (selectedDays.size === 0) {
      toast.info("Please select at least one day to set availability.");
      return;
    }
    setCurrentDayIndex(0); // Start with the first selected day
    setStep(2);
  };

  const handleSaveRules = async () => {
    setIsSaving(true);
    // Create rules only for the days the user has explicitly selected in the UI
    const finalRules = Array.from(selectedDays)
      .map((dayId) => {
        const existingRule = rules.find((r) => r.day_of_week === dayId);
        return {
          day_of_week: dayId,
          available_slots: existingRule?.available_slots || [],
        };
      })
      .filter((r) => r.available_slots.length > 0);

    const promise = fetch("/api/admin/availability/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: finalRules }),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to save schedule");
      fetchRules();
      setIsEditing(false);
    });

    toast.promise(promise, {
      loading: "Saving schedule...",
      success: "Schedule updated successfully!",
      error: (err) => err.message,
      finally: () => setIsSaving(false),
    });
  };

  // --- NEW: Handler to start editing ---
  const handleStartEditing = () => {
    // Save the current state as the "original" state to revert to on cancel
    setOriginalRules(rules);
    setOriginalSelectedDays(selectedDays);
    setIsEditing(true);
    setStep(1); // Always start at step 1
  };

  // --- NEW: Handler for the cancel button ---
  const handleCancelEditing = () => {
    // Revert to the saved original state
    setRules(originalRules);
    setSelectedDays(originalSelectedDays);
    setIsEditing(false);
  };

  // --- DYNAMIC CONTENT RENDERING ---
  const renderContent = () => {
    if (isLoading) return <ScheduleSkeleton />;

    if (isEditing) {
      // STEP 1: DAY SELECTION
      if (step === 1) {
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              First, choose the days of the week you are generally available.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {orderedDaysOfWeek.map((dayId) => (
                <div
                  key={dayId}
                  className="flex items-center space-x-2 rounded-md border p-3"
                >
                  <Checkbox
                    id={`day-${dayId}`}
                    checked={selectedDays.has(dayId)}
                    onCheckedChange={() => handleDayToggle(dayId)}
                  />
                  <Label
                    htmlFor={`day-${dayId}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {daysOfWeekMap[dayId as keyof typeof daysOfWeekMap]}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // STEP 2: TIME SELECTION
      if (step === 2) {
        const activeDays = orderedDaysOfWeek.filter((dayId) =>
          selectedDays.has(dayId)
        );
        if (activeDays.length === 0) {
          setStep(1); // Failsafe, go back if no days are selected
          return null;
        }

        const currentDayId = activeDays[currentDayIndex];
        const dayRule = rules.find((r) => r.day_of_week === currentDayId);
        const selectedSlots = new Set(dayRule?.available_slots || []);

        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Set times for{" "}
                {daysOfWeekMap[currentDayId as keyof typeof daysOfWeekMap]}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDayIndex((prev) => prev - 1)}
                  disabled={currentDayIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDayIndex((prev) => prev + 1)}
                  disabled={currentDayIndex === activeDays.length - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {allPossibleSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedSlots.has(slot) ? "default" : "outline"}
                  onClick={() => handleSlotToggle(currentDayId, slot)}
                  className="text-xs h-8"
                >
                  {formatTime(slot)}
                </Button>
              ))}
            </div>
          </div>
        );
      }
    }
    return <ScheduleSummary rules={rules} onEdit={handleStartEditing} />;
  };

  const renderFooter = () => {
    // Hide footer when not editing or loading
    if (!isEditing || isLoading) {
      return null;
    }
    if (step === 1) {
      return (
        <div className="flex w-full justify-between">
          {/* Cancel button on the left */}
          <Button variant="outline" onClick={handleCancelEditing}>
            Cancel
          </Button>
          {/* Next button on the right */}
          <Button className="min-w-24" onClick={proceedToTimeSelection}>
            Next
          </Button>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="flex w-full justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back to Day Selection
          </Button>
          {/* --- NEW: Add a Cancel button next to Save --- */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelEditing}>
              Cancel
            </Button>
            <Button onClick={handleSaveRules} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-none border-foreground/20 px-2 rounded-sm">
        <CardHeader>
          <CardTitle>Recurring Weekly Schedule</CardTitle>
          <CardDescription>
            A two-step process to set your default weekly availability.
          </CardDescription>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
        {renderFooter() && (
          <CardFooter className="justify-end border-t pt-6">
            {renderFooter()}
          </CardFooter>
        )}
      </Card>
      <OverrideManager />
    </div>
  );
}
