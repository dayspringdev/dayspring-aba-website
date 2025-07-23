// FILE: src/components/Footer.tsx

"use client";

import Link from "next/link";
import { useLenis } from "@/context/LenisContext";
import { Mail, Instagram } from "lucide-react"; // Imported Instagram for consistency

export function Footer() {
  const lenis = useLenis();

  const handleScrollTo = (targetId: string) => {
    if (lenis) {
      const targetElement = document.querySelector(targetId);
      if (targetElement instanceof HTMLElement) {
        lenis.scrollTo(targetElement, { offset: -96 }); // Adjusted for h-24 header
      }
    }
  };

  const handleScrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0);
    }
  };

  return (
    // CHANGE: Removed id="contact" to avoid duplicate IDs.
    // The main contact section on the homepage already has this ID.
    <footer className="w-full border-t border-border/50 bg-primary text-primary-foreground">
      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {/* Column 1: DBTS Section */}
        <div>
          <button
            onClick={handleScrollToTop}
            className="text-2xl font-bold text-primary-foreground text-left"
          >
            Dayspring Behavioral
          </button>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Providing compassionate care for a brighter tomorrow.
          </p>
        </div>

        {/* === MAIN CHANGE: WRAPPER DIV === */}
        {/* This new div wraps the next two sections. It spans 2 columns on medium screens. */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Column 2: Navigation Section (Now inside the wrapper) */}
          <div>
            <h4 className="font-semibold text-primary-foreground">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <button
                  onClick={() => handleScrollTo("#about")}
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScrollTo("#services")}
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScrollTo("#faq")}
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScrollTo("#contact")}
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info (Now inside the wrapper) */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Get In Touch
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail
                  className="text-faith-light mt-1 flex-shrink-0"
                  size={18}
                />
                <div>
                  <p className="text-primary-foreground font-medium">
                    dayspringbehavioural@gmail.com
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    We&apos;d love to hear from you
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm text-primary-foreground/80 mb-2">
                  Follow our journey:
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                    <Instagram className="text-primary-foreground" size={16} />
                  </div>
                  <span className="text-sm text-primary-foreground/80">
                    Instagram (coming soon!)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="border-t border-primary-foreground/20 py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-primary-foreground/80">
            © {new Date().getFullYear()} Dayspring Behavioural Therapeutic
            Services. All Rights Reserved.
          </p>
          <Link
            href="/login"
            className="text-xs text-primary-foreground/60 transition-colors hover:text-primary-foreground"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
