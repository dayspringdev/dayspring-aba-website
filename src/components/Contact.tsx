// src/components/Contact.tsx
"use client";

import { useState } from "react"; // 2. IMPORT useState
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  Instagram,
  CheckCircle,
} from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { Label } from "./ui/label"; // 3. IMPORT Label for the form

/**
 * A confirmation message component shown after successful form submission.
 */
const ConfirmationMessage = ({ onReset }: { onReset: () => void }) => (
  <div className="flex h-full min-h-[500px] flex-col items-center justify-center space-y-6 rounded-xl p-8 text-center">
    <CheckCircle className="h-16 w-16 text-primary" />
    <h2 className="text-2xl font-bold">Thank You!</h2>
    <p className="text-muted-foreground">
      Your message has been sent successfully. We&apos;ll get back to you
      shortly.
    </p>
    <Button
      onClick={onReset}
      variant="outline"
      className="border-primary text-primary hover:bg-primary-light/20"
    >
      Send Another Message
    </Button>
  </div>
);

const Contact = () => {
  // 4. ADD state management for form submission
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulate a network request delay
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };
  return (
    <AnimatedSection
      id="contact"
      className="py-20 bg-gradient-soft scroll-mt-20"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to take the next step? We&apos;d love to hear from you and
            learn how we can support your family&apos;s journey. Reach out for
            your free consultation today.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-gentle">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Let&apos;s Connect
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="text-primary" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          Email Us
                        </h4>
                        <p className="text-muted-foreground">
                          dayspringbehavioural@gmail.com
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          We typically respond within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-hope-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="text-hope-blue" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          Free Consultation
                        </h4>
                        <p className="text-muted-foreground">
                          Schedule a call to discuss your needs
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          No obligation, just conversation
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-faith-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="text-faith-gold" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          Response Time
                        </h4>
                        <p className="text-muted-foreground">
                          Monday - Friday: Same day
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Weekends: Within 48 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-love-rose/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-love-rose" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          Service Areas
                        </h4>
                        <p className="text-muted-foreground">
                          Home, school, and community-based
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Virtual sessions available
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Coming Soon */}
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <h4 className="font-semibold text-foreground mb-3">
                      Follow Our Journey
                    </h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Instagram className="text-foreground" size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Instagram coming soon!
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updates, tips, and success stories
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            {/* 5. ADD Conditional Rendering for Form/Confirmation */}
            <Card className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-gentle">
              {isSubmitted ? (
                <ConfirmationMessage onReset={() => setIsSubmitted(false)} />
              ) : (
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Send Us a Message
                  </h3>
                  {/* 6. UPDATE Form with new fields and logic */}
                  <form className="space-y-6" onSubmit={handleFormSubmit}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          placeholder="John"
                          required
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          placeholder="Doe"
                          required
                          className="bg-background border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(123) 456-7890"
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Your message..."
                        className="min-h-[120px] bg-background border-border"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-soft text-primary-foreground shadow-gentle"
                      size="lg"
                    >
                      <Send className="mr-2" size={18} />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Contact;
