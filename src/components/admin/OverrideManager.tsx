"use client";

import { useState, useEffect } from "react";
import { format, startOfDay, endOfDay, isBefore, isEqual } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { TIMEZONE } from "@/lib/config";
// 👆 ---
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/types/supabase";

type Override = Database["public"]["Tables"]["availability_overrides"]["Row"];

export function OverrideManager() {
  const [persistedOverrides, setPersistedOverrides] = useState<Override[]>([]);
  const [localOverrides, setLocalOverrides] = useState<Override[]>([]);
  const [idsToDelete, setIdsToDelete] = useState<Set<number>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [overrideDate, setOverrideDate] = useState<Date | undefined>(
    new Date()
  );
  const [blockFromTime, setBlockFromTime] = useState("09:00");
  const [blockToTime, setBlockToTime] = useState("17:00"); // Changed default to 5 PM

  // ... fetchOverrides, useEffects are the same ...
  const fetchOverrides = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/availability/overrides");
      if (!response.ok) throw new Error("Could not load overrides");
      const data: Override[] = await response.json();
      setPersistedOverrides(data);
      setLocalOverrides(data);
    } catch {
      toast.error("Failed to fetch overrides", {
        description: "Could not load the list of blocked periods.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverrides();
  }, []);

  useEffect(() => {
    const persistedSet = new Set(persistedOverrides.map((o) => o.id));
    const hasDeletions = idsToDelete.size > 0;
    const hasAdditions = localOverrides.some((o) => !persistedSet.has(o.id));
    setHasChanges(hasDeletions || hasAdditions);
  }, [localOverrides, persistedOverrides, idsToDelete]);

  const addLocalOverride = (startTime: Date, endTime: Date) => {
    if (isBefore(endTime, new Date())) {
      toast.warning("Invalid Time", {
        description: "Cannot block a time period that has already passed.",
      });
      return;
    }
    const isDuplicate = localOverrides.some(
      (o) =>
        isEqual(new Date(o.start_time), startTime) &&
        isEqual(new Date(o.end_time), endTime)
    );
    if (isDuplicate) {
      toast.warning("Duplicate Period", {
        description: "This time period is already blocked.",
      });
      return;
    }
    const newOverride: Override = {
      id: Date.now(), // Temporary ID for local state
      created_at: new Date().toISOString(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      type: "BLOCKED",
    };
    setLocalOverrides((prev) =>
      [...prev, newOverride].sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    );
  };

  const handleBlockPeriod = () => {
    if (!overrideDate) return;

    // Create a date object that represents the start of the day *in the Toronto timezone*
    const zonedDate = toZonedTime(startOfDay(overrideDate), TIMEZONE);

    const [startHour, startMinute] = blockFromTime.split(":").map(Number);
    const [endHour, endMinute] = blockToTime.split(":").map(Number);

    // Create the start and end Date objects by setting the hours and minutes on the zoned date
    const startTime = new Date(zonedDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(zonedDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    // The .toISOString() method will now produce the correct UTC time
    addLocalOverride(startTime, endTime);
  };

  const handleBlockEntireDay = () => {
    if (!overrideDate) return;

    // We need to calculate the start and end of the day *in the Toronto timezone*
    const zonedDate = toZonedTime(startOfDay(overrideDate), TIMEZONE);
    const dayStartInToronto = startOfDay(zonedDate);
    const dayEndInToronto = endOfDay(zonedDate);

    addLocalOverride(dayStartInToronto, dayEndInToronto);
  };
  // 👆 --- END OF FIX FOR CREATING --- 👆

  const handleDeleteOverride = (idToDelete: number) => {
    setLocalOverrides((prev) => prev.filter((o) => o.id !== idToDelete));
    if (persistedOverrides.some((o) => o.id === idToDelete)) {
      setIdsToDelete((prev) => new Set(prev).add(idToDelete));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const overridesToAdd = localOverrides
      .filter((o) => !persistedOverrides.some((p) => p.id === o.id))
      .map(({ start_time, end_time }) => ({
        start_time,
        end_time,
        type: "BLOCKED",
      }));
    const promise = fetch("/api/admin/availability/overrides/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        overridesToAdd,
        idsToDelete: Array.from(idsToDelete),
      }),
    }).then((res) => {
      if (!res.ok) throw new Error("Server failed to save changes.");
    });
    toast.promise(promise, {
      loading: "Saving changes...",
      success: () => {
        fetchOverrides();
        setIdsToDelete(new Set());
        setHasChanges(false);
        return "Changes saved successfully!";
      },
      error: "Failed to save changes.",
      finally: () => setIsSaving(false),
    });
  };

  return (
    <Card className="shadow-none border-foreground/20 rounded-sm">
      <CardHeader>
        <CardTitle>Manage Blocked Time</CardTitle>
        <CardDescription>
          Add or remove periods when you are unavailable. These will override
          your weekly schedule.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={overrideDate}
              onSelect={setOverrideDate}
              disabled={(date) => isBefore(date, startOfDay(new Date()))}
              className="rounded-md border p-0"
            />
          </div>
          <div className="space-y-4 rounded-md border p-4">
            <h3 className="font-semibold">
              Block a Specific Period on{" "}
              {/* === FIX 1: Add day of the week to the selected date title === */}
              {overrideDate ? format(overrideDate, "EEEE, PPP") : ""}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from-time">From</Label>
                <Input
                  id="from-time"
                  type="time"
                  value={blockFromTime}
                  onChange={(e) => setBlockFromTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="to-time">To</Label>
                <Input
                  id="to-time"
                  type="time"
                  value={blockToTime}
                  onChange={(e) => setBlockToTime(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleBlockPeriod} disabled={!overrideDate}>
              Add Block Period
            </Button>
          </div>
          <div className="space-y-4 rounded-md border p-4">
            <h3 className="font-semibold">Block Entire Day</h3>
            <Button
              onClick={handleBlockEntireDay}
              variant="destructive"
              disabled={!overrideDate}
            >
              Add Block Day
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Upcoming Blocked Periods</h3>
          {isLoading ? (
            <p>Loading...</p>
          ) : localOverrides.length > 0 ? (
            <ul className="max-h-96 space-y-2 overflow-y-auto pr-2">
              {localOverrides.map((override) => (
                <li
                  key={override.id}
                  className="flex items-center justify-between rounded-md border bg-background p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {formatInTimeZone(
                        new Date(override.start_time),
                        TIMEZONE,
                        "EEEE, PPP"
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      {formatInTimeZone(
                        new Date(override.start_time),
                        TIMEZONE,
                        "p"
                      )}{" "}
                      -{" "}
                      {formatInTimeZone(
                        new Date(override.end_time),
                        TIMEZONE,
                        "p"
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteOverride(override.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming blocked periods.
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {hasChanges && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
          {hasChanges ? (
            <p>You have unsaved changes.</p>
          ) : (
            <p>All changes are saved.</p>
          )}
        </div>
        <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
