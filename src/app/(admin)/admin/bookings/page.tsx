"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import type { Database } from "@/types/supabase"; // <-- Import Supabase DB types
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RescheduleDialog } from "@/components/admin/RescheduleDialog"; // <-- Import the new dialog
import { NewBookingDialog } from "@/components/admin/NewBookingDialog"; // <-- Import the new dialog

// Use the Supabase 'Row' type for our state
type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type BookingStatus = Database["public"]["Enums"]["booking_status"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]); // <-- Use the new Booking type
  const [isLoading, setIsLoading] = useState(true);
  const [bookingToReschedule, setBookingToReschedule] =
    useState<Booking | null>(null);
  const [isNewBookingDialogOpen, setIsNewBookingDialogOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // This fetch call is now correct because its API route is fixed
      const response = await fetch("/api/admin/bookings");

      if (!response.ok) {
        throw new Error("Failed to fetch bookings.");
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (
    bookingId: number,
    status: BookingStatus
  ) => {
    const originalBookings = [...bookings];
    // Optimistic UI update
    setBookings((currentBookings) =>
      currentBookings.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );

    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      toast.error("Update failed", {
        description: "Could not update booking status.",
      });
      setBookings(originalBookings); // Revert on failure
    } else {
      toast.success(`Booking has been ${status}.`);
    }
  };

  return (
    <>
      <Card className="shadow-none border-muted/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Manage Bookings</CardTitle>
            <CardDescription>
              View, confirm, or reschedule upcoming appointments.
            </CardDescription>
          </div>
          {/* --- NEW: "New Appointment" button --- */}
          <Button onClick={() => setIsNewBookingDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading bookings...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Client</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className="hover:bg-transparent cursor-default"
                    >
                      <TableCell>
                        <div className="font-medium">
                          {booking.first_name} {booking.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.slot_time), "PPP, p")}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {booking.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(booking.id, "confirmed")
                              }
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateStatus(booking.id, "cancelled")
                              }
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                        {booking.status === "confirmed" && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer"
                              onClick={() => setBookingToReschedule(booking)}
                            >
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="cursor-pointer"
                              onClick={() =>
                                handleUpdateStatus(booking.id, "cancelled")
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No upcoming bookings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* --- NEW: Render the Dialog component --- */}
      <RescheduleDialog
        booking={bookingToReschedule}
        open={!!bookingToReschedule}
        onOpenChange={(open) => !open && setBookingToReschedule(null)}
        onRescheduled={() => {
          setBookingToReschedule(null);
          fetchBookings(); // Refresh the list after rescheduling
        }}
      />
      {/* --- NEW: Render the New Booking Dialog --- */}
      <NewBookingDialog
        open={isNewBookingDialogOpen}
        onOpenChange={setIsNewBookingDialogOpen}
        onBookingCreated={() => {
          fetchBookings(); // Refresh the list after a new booking is created
        }}
      />
    </>
  );
}
