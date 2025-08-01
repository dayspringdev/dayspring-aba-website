"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  public_contact_email?: string | null;
};

export function UpdateProfileForm() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    // We only need the one field, but fetching '*' is fine and simple.
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      toast.error("Failed to load profile", { description: error.message });
    }
    setProfile(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    // Only update the field this form is responsible for.
    const { error } = await supabase
      .from("profiles")
      .update({
        public_contact_email: profile.public_contact_email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      toast.error("Update failed", { description: error.message });
    } else {
      toast.success("Public contact email updated successfully!");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Contact Email Configuration</CardTitle>
          <CardDescription>
            Set the email address where messages from the website&apos;s contact
            form will be sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mb-6 shadow-none border-muted/20">
      <CardHeader>
        <CardTitle>Business Notification Email</CardTitle>
        <CardDescription>
          This is the primary email where all booking requests and contact form
          messages will be sent.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateProfile}>
        <CardContent>
          {/* REMOVED: Full Name and Role Title inputs are gone. */}
          <div className="space-y-2">
            <Label htmlFor="notificationEmail">
              Notification Email Address
            </Label>
            <Input
              id="notificationEmail"
              type="email"
              value={profile?.public_contact_email || ""}
              onChange={(e) =>
                setProfile((prev) =>
                  prev
                    ? { ...prev, public_contact_email: e.target.value }
                    : null
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              All website notifications will be sent to this address.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Email"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
