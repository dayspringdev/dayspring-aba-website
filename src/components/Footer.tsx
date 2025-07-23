// FILE: src/components/Footer.tsx

"use client";

import Link from "next/link";
import { useLenis } from "@/context/LenisContext";

export function Footer() {
  const lenis = useLenis();

  const handleScrollTo = (targetId: string) => {
    if (lenis) {
      const targetElement = document.querySelector(targetId);
      if (targetElement instanceof HTMLElement) {
        lenis.scrollTo(targetElement, { offset: -80 });
      }
    }
  };

  // New function to handle scrolling to the top of the page
  const handleScrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0);
    }
  };

  return (
    <footer
      id="contact"
      className="scroll-mt-20 w-full border-t border-[var(--border)] bg-[var(--card)]"
    >
      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          {/* The logo is now a button with the original styling */}
          <button
            onClick={handleScrollToTop}
            className="text-xl font-bold text-[var(--primary)] text-left"
          >
            DBTS
          </button>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Dayspring Behavioural Therapeutic Services
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Providing compassionate care for a brighter tomorrow.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
          <div>
            <h4 className="font-semibold text-[var(--foreground)]">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <button
                  onClick={() => handleScrollTo("#about")}
                  className="text-sm text-[var(--muted)] hover:text-[var(--primary)]"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScrollTo("#services")}
                  className="text-sm text-[var(--muted)] hover:text-[var(--primary)]"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScrollTo("#faq")}
                  className="text-sm text-[var(--muted)] hover:text-[var(--primary)]"
                >
                  FAQ
                </button>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[var(--muted)] hover:text-[var(--primary)]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--foreground)]">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-[var(--muted)] hover:text-[var(--primary)]"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[var(--muted)] hover:text-[var(--primary)]"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--foreground)]">
              Contact Us
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <li>Serving Ontario, Canada</li>
              <li className="break-all">dayspringbehavioural@gmail.com</li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--primary)]"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted)]">
            © {new Date().getFullYear()} Dayspring Behavioural Therapeutic
            Services. All Rights Reserved.
          </p>
          <Link
            href="/login"
            className="text-xs text-muted transition-colors hover:text-muted/50"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
