import { Button } from "@/components/ui/button";
import type { Database } from "@/types/supabase";

type Rule = Database["public"]["Tables"]["recurring_availability_rules"]["Row"];

const daysOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
const dayLabels: { [key: number]: string } = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  0: "Sunday",
};

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

interface ScheduleSummaryProps {
  rules: Rule[];
  onEdit: () => void;
}

export function ScheduleSummary({ rules, onEdit }: ScheduleSummaryProps) {
  const rulesByDay = new Map(rules.map((rule) => [rule.day_of_week, rule]));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          This is your current live weekly schedule.
        </p>
        <Button className="" onClick={onEdit}>
          Edit Schedule
        </Button>
      </div>
      <div className="space-y-4">
        {daysOrder.map((dayId) => {
          const rule = rulesByDay.get(dayId);
          if (
            !rule ||
            !rule.available_slots ||
            rule.available_slots.length === 0
          ) {
            return (
              <div
                key={dayId}
                className="flex items-center gap-4 rounded-md border p-4"
              >
                <p className="font-medium w-24">{dayLabels[dayId]}</p>
                <p className="text-sm text-muted-foreground">Unavailable</p>
              </div>
            );
          }

          return (
            <div
              key={dayId}
              className="flex flex-col sm:flex-row sm:items-start gap-4 rounded-md border border-foreground/20 p-4"
            >
              <p className="font-medium w-24 shrink-0">{dayLabels[dayId]}</p>
              <div className="flex flex-wrap gap-2">
                {rule.available_slots.map((slot) => (
                  <div
                    key={slot}
                    className="text-xs font-medium justify-center flex items-center bg-primary rounded-xs w-28 h-10 text-primary-foreground px-4 py-2 cursor-default"
                  >
                    {formatTime(slot)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
