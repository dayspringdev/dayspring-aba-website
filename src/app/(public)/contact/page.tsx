"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * A confirmation message component shown after successful form submission.
 * @param onReset A function to reset the form state, allowing another message.
 */
const ConfirmationMessage = ({ onReset }: { onReset: () => void }) => (
  <div className="flex h-full flex-col items-center justify-center space-y-6 rounded-2xl border bg-card p-8 text-center shadow-soft">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 text-green-500"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
    <h2 className="text-2xl font-bold">Thank You!</h2>
    <p className="text-muted-foreground">
      Your message has been sent successfully. We&apos;ll get back to you
      shortly.
    </p>
    <Button onClick={onReset} variant="outline">
      Send Another Message
    </Button>
  </div>
);

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Simulates form submission by preventing the default action and showing a
   * confirmation message after a brief delay.
   * @param e The form event.
   */
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulate a network request delay
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="w-full py-20 lg:py-24">
      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        {/* --- CHANGE IS HERE: Conditionally render form or confirmation --- */}
        <div className="flex flex-col justify-center space-y-6">
          {isSubmitted ? (
            <ConfirmationMessage onReset={() => setIsSubmitted(false)} />
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Connect with Us
                </h1>
                <p className="text-lg text-muted-foreground">
                  Have a question or want to learn more? Fill out the form
                  below, and we&apos;ll get back to you shortly.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="(123) 456-7890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <Button type="submit">Send Message</Button>
              </form>

              <div className="pt-4 text-center">
                <p className="text-muted-foreground">
                  Ready to get started?{" "}
                  <Link
                    href="/contact/intake"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Schedule a free intake consultation.
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Image */}
        <div className="relative hidden items-center justify-center md:flex">
          <div className="relative aspect-square w-full max-w-lg overflow-hidden shadow-sm">
            <Image
              src="/unblurimageai_contact-us-hero.jpg"
              alt="A child&#39;s hand reaching out towards an adult&#39;s hand, conveying care and support."
              fill
              className="h-full w-full object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-black/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
