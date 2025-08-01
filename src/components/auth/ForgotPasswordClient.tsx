// FILE: src/components/auth/ForgotPasswordClient.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Loader2, MailCheck } from "lucide-react";

type View = "request" | "sent" | "update" | "verifying";

export default function ForgotPasswordClient() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<View>("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // This useEffect hook for handling the URL is correct and remains unchanged.
  useEffect(() => {
    const code = searchParams.get("code");
    const errorDescription = searchParams.get("error_description");

    if (errorDescription) {
      const formattedMessage = (
        errorDescription.charAt(0).toUpperCase() + errorDescription.slice(1)
      ).replace(/\+/g, " ");

      toast.error("An Error Occurred", {
        description: formattedMessage,
        duration: 8000,
      });

      router.replace("/forgot-password", { scroll: false });
      setView("request");
      return;
    }

    if (!code) {
      setView("request");
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("update");
      } else if (event === "SIGNED_IN" && session) {
        supabase.auth.getClaims().then(({ data: claims }) => {
          const amr = claims?.claims?.amr as { method: string }[] | undefined;
          const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;
          if (isRecovery) {
            setView("update");
          } else {
            setView("request");
          }
        });
      } else if (event === "INITIAL_SESSION" && !session) {
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (error) {
            console.error("Code exchange error:", error.message);
            setView("request");
          } else if (data.session) {
            supabase.auth.getClaims().then(({ data: claims }) => {
              const amr = claims?.claims?.amr as
                | { method: string }[]
                | undefined;
              const isRecovery =
                amr?.some((m) => m.method === "recovery") ?? false;
              if (isRecovery) {
                setView("update");
              } else {
                setView("request");
              }
            });
          } else {
            setView("request");
          }
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, searchParams, router]);

  // The handlePasswordResetRequest function is correct and remains unchanged.
  const handlePasswordResetRequest = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    });
    setIsLoading(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      setView("sent");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    } else {
      // The user now has a valid session.
      // We will redirect them to the middleware with a final command.
      router.push("/login?message=password-updated");
    }
  };

  // The renderContent function and the final return statement are correct and remain unchanged.
  const renderContent = () => {
    switch (view) {
      case "verifying":
        return (
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Verifying...</p>
          </CardContent>
        );
      case "sent":
        return (
          <>
            <CardHeader className="items-center text-center">
              <MailCheck className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>
                A password reset link has been sent to <strong>{email}</strong>.
              </p>
            </CardContent>
          </>
        );
      case "update":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Set a New Password</CardTitle>
              <CardDescription>
                Enter and confirm your new password below.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 mt-4">
                {errorMessage && (
                  <p className="text-sm text-destructive mb-2">
                    {errorMessage}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </>
        );
      case "request":
      default:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your email to receive a reset link.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordResetRequest}>
              <CardContent>
                {errorMessage && (
                  <p className="text-sm text-destructive mb-4 text-center p-2 rounded-md bg-destructive/10">
                    {errorMessage}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="mt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </CardFooter>
            </form>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center bg-background/50">
      <Card className="w-full max-w-sm">
        {renderContent()}
        <CardFooter>
          {view !== "sent" && (
            <Button asChild variant="link" className="text-xs mx-auto">
              <Link href="/login">← Back to Login</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
