// src/components/Contact.tsx
"use client";

import { useState } from "react";
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
  Facebook,
  Linkedin,
  Twitter,
  CheckCircle,
} from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { Label } from "./ui/label";
import type { HomePageData } from "@/types/homepage";

// Icon map for the contact items
const contactIcons = {
  Mail: { Component: Mail, color: "text-primary", bgColor: "bg-primary-light" },
  Phone: {
    Component: Phone,
    color: "text-hope-blue",
    bgColor: "bg-hope-blue/10",
  },
  Clock: {
    Component: Clock,
    color: "text-faith-gold",
    bgColor: "bg-faith-gold/10",
  },
  MapPin: {
    Component: MapPin,
    color: "text-love-rose",
    bgColor: "bg-love-rose/10",
  },
};

// NEW: Add map for social icons
const socialIcons = {
  Instagram: Instagram,
  Facebook: Facebook,
  Linkedin: Linkedin,
  Twitter: Twitter,
};

// Define the component's props
interface ContactProps {
  data: HomePageData["contact"];
}

// Confirmation message component (unchanged)
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

const Contact = ({ data }: ContactProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTimeout(() => setIsSubmitted(true), 1000);
  };

  return (
    <AnimatedSection
      id="contact"
      className="py-20 bg-gradient-soft scroll-mt-20"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-gentle">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    {data.connectCardTitle}
                  </h3>
                  <div className="space-y-6">
                    {data.contactItems.map((item, index) => {
                      const Icon =
                        contactIcons[item.icon as keyof typeof contactIcons];
                      if (!Icon) return null;
                      return (
                        <div key={index} className="flex items-start space-x-4">
                          <div
                            className={`w-12 h-12 ${Icon.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon.Component className={Icon.color} size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">
                              {item.title}
                            </h4>
                            <p className="text-muted-foreground">
                              {item.description}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.subtext}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* ============== MODIFIED SOCIAL LINKS SECTION ============== */}
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <h4 className="font-semibold text-foreground mb-3">
                      Follow Our Journey
                    </h4>
                    {data.socialMediaLinks &&
                    data.socialMediaLinks.length > 0 ? (
                      <div className="flex items-center space-x-3">
                        {data.socialMediaLinks.map((link) => {
                          const IconComponent =
                            socialIcons[link.icon as keyof typeof socialIcons];
                          if (!IconComponent) return null;
                          return (
                            <a
                              key={link.icon}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Follow us on ${link.icon}`}
                              className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors"
                            >
                              <IconComponent size={18} />
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Instagram className="text-foreground/50" size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Social media coming soon!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Contact Form */}
            <Card className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-gentle">
              {isSubmitted ? (
                <ConfirmationMessage onReset={() => setIsSubmitted(false)} />
              ) : (
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Send Us a Message
                  </h3>
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
