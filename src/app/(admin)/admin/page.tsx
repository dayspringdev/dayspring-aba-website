import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>Manage Your Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Set the dates and times you are available for new intake
              consultations.
            </p>
            <Button asChild>
              <Link href="/admin/availability">Go to Availability</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>View Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              See a list of all scheduled consultations with clients.
            </p>
            <Button asChild>
              <Link href="/admin/bookings">Go to Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
