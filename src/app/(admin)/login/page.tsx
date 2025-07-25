"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // <-- For showing error toasts
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react"; // 1. Import the icons

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 2. Manage password visibility state

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Use the Supabase client to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setIsLoading(false);

    if (error) {
      // Show a user-friendly error toast
      toast.error("Login Failed", {
        description: error.message || "Invalid credentials. Please try again.",
      });
    } else {
      // On successful login, Supabase automatically sets a session cookie.
      // We just need to redirect the user to the admin dashboard.
      // The old localStorage logic is no longer needed.
      router.push("/admin");
    }
  };

  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center bg-background/50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@dbtsservices.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              {/* === Password Input with Icon === */}
              <div className="relative">
                <Input
                  id="password"
                  // 3. Dynamically set the `type` attribute
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10" // Add padding to the right for the icon
                />
                {/* 4. Button to toggle password visibility */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword((prev) => !prev)} // 5. Toggle visibility
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <Button variant="link" asChild className="text-xs">
              <Link href="/">← Go Back Home</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
