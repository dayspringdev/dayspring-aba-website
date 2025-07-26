"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Loader2 } from "lucide-react";

export function UpdateEmailForm() {
  const supabase = createClient();
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentEmail(user.email || "");
      }
    };
    fetchUser();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // --- THIS IS THE NEW VALIDATION LOGIC ---
    if (!newEmail || !confirmEmail) {
      toast.error("Please fill out both new email fields.");
      return;
    }
    if (newEmail !== confirmEmail) {
      toast.error("The new email addresses do not match.");
      return;
    }
    if (newEmail === currentEmail) {
      toast.info("This is already your current login email.");
      return;
    }

    setIsLoading(true);

    const promise = fetch("/api/admin/settings/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }
      return data;
    });

    toast.promise(promise, {
      loading: "Sending verification link...",
      success: (data) => {
        setNewEmail("");
        setConfirmEmail("");
        return data.message;
      },
      error: (err) => err.message,
      finally: () => setIsLoading(false),
    });
  };

  return (
    <Card className="max-w-2xl mb-6 shadow-none border-muted/20">
      <CardHeader>
        <CardTitle>Update Login Email</CardTitle>
        <CardDescription>
          Change the email address you use to log in to the admin panel. A
          verification link will be sent to the new address.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Login Email</Label>
            <Input
              type="email"
              value={currentEmail}
              disabled
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email">New Login Email</Label>
            <Input
              id="new-email"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-email">Confirm New Email</Label>
            <Input
              id="confirm-email"
              type="email"
              required
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 mt-4">
          {/* REMOVED: The complex disabled logic is gone */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Login Email"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
