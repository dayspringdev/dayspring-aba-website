"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
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
import type { Database } from "@/types/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RescheduleDialog } from "@/components/admin/RescheduleDialog";
import { NewBookingDialog } from "@/components/admin/NewBookingDialog";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type BookingStatus = Database["public"]["Enums"]["booking_status"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingToReschedule, setBookingToReschedule] =
    useState<Booking | null>(null);
  const [isNewBookingDialogOpen, setIsNewBookingDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
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
      setBookings(originalBookings);
    } else {
      toast.success(`Booking has been ${status}.`);
    }
  };

  const renderActionButtons = (booking: Booking) => {
    if (booking.status === "pending") {
      return (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            size="sm"
            onClick={() => handleUpdateStatus(booking.id, "confirmed")}
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateStatus(booking.id, "cancelled")}
          >
            Decline
          </Button>
        </div>
      );
    }
    if (booking.status === "confirmed") {
      return (
        <div className="flex flex-wrap gap-2 justify-end">
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
            onClick={() => handleUpdateStatus(booking.id, "cancelled")}
          >
            Cancel
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Manage Bookings
            </h1>
            <p className="text-muted-foreground">
              View, confirm, or reschedule upcoming appointments.
            </p>
          </div>
          <Button
            className="mt-4 sm:mt-0"
            onClick={() => setIsNewBookingDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        {isLoading && <p>Loading bookings...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {!isLoading && !error && (
          <div>
            <Card className="hidden lg:block shadow-none border-muted/20">
              <CardContent className="p-0">
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
                            {/* === FIX 1: Desktop View === */}
                            {format(
                              new Date(booking.slot_time),
                              "EEEE, PPP, p"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "confirmed"
                                  ? "success"
                                  : booking.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {renderActionButtons(booking)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No upcoming bookings found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:hidden">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="shadow-none border-muted/20"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {booking.first_name} {booking.last_name}
                      </CardTitle>
                      <CardDescription>{booking.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-muted-foreground">
                          Date & Time:
                        </span>
                        {/* === FIX 2: Mobile View === */}
                        <span className="font-medium">
                          {format(new Date(booking.slot_time), "EEEE, PPP, p")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "success"
                              : booking.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      {renderActionButtons(booking)}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="shadow-none border-muted/20 text-center">
                  <CardContent className="p-6">
                    <p>No upcoming bookings found.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      <RescheduleDialog
        booking={bookingToReschedule}
        open={!!bookingToReschedule}
        onOpenChange={(open) => !open && setBookingToReschedule(null)}
        onRescheduled={() => {
          setBookingToReschedule(null);
          fetchBookings();
        }}
      />
      <NewBookingDialog
        open={isNewBookingDialogOpen}
        onOpenChange={setIsNewBookingDialogOpen}
        onBookingCreated={() => {
          fetchBookings();
        }}
      />
    </>
  );
}
