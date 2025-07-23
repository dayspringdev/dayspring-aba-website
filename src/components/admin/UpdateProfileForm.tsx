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
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function UpdateProfileForm() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // A single function to fetch the profile data
  const fetchProfile = useCallback(async () => {
    setLoading(true);
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
  }, [supabase]); // Its only dependency is supabase

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // The ESLint warning will now be gone

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        role_title: profile.role_title,
        updated_at: new Date().toISOString(), // Good practice to update a timestamp
      })
      .eq("id", 1); // Always update the row where id is 1

    if (error) {
      toast.error("Update failed", { description: error.message });
    } else {
      toast.success("Profile updated successfully!");
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    // Use a consistent name for the avatar to overwrite it, or a random one to keep old ones
    const filePath = `public-avatar.${fileExt}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file, { upsert: true }); // upsert overwrites the old image

    if (uploadError) {
      toast.error("Upload failed", { description: uploadError.message });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(filePath);

    // Update the UI and the database immediately
    setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (dbError) {
      toast.error("Failed to save avatar", { description: dbError.message });
    } else {
      toast.success("Avatar updated!");
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
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
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          This information will be displayed on the public homepage.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateProfile}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Headshot</Label>
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Current headshot"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                  No Image
                </div>
              )}
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile?.full_name || ""}
              onChange={(e) =>
                setProfile((prev) =>
                  prev ? { ...prev, full_name: e.target.value } : null
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleTitle">Role / Title</Label>
            <Input
              id="roleTitle"
              value={profile?.role_title || ""}
              onChange={(e) =>
                setProfile((prev) =>
                  prev ? { ...prev, role_title: e.target.value } : null
                )
              }
            />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
