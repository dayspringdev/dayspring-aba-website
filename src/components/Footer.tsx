// FILE: src/components/Footer.tsx

"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import type { SocialMediaLink } from "@/types/homepage";
import { scroller, animateScroll } from "react-scroll";

// A map to look up the correct icon component based on the string from the database.
const socialIcons = {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
};

// Define the shape of the data we'll fetch from our unified API
interface FooterData {
  email: string;
  socialLinks: SocialMediaLink[];
}

// Create a NavLink specific to the Footer's needs
const FooterNavLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      scroller.scrollTo(to, {
        smooth: true,
        duration: 500,
        offset: -96,
      });
    }
    // On other pages, let the default NextLink behavior handle navigation
  };

  return (
    <NextLink
      href={`/#${to}`}
      onClick={handleNav}
      className="text-sm text-primary-foreground/80 hover:text-primary-foreground ease-in-out cursor-pointer"
    >
      {children}
    </NextLink>
  );
};

export function Footer() {
  const [footerData, setFooterData] = useState<FooterData>({
    email: "",
    socialLinks: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch("/api/contact");
        if (!response.ok) throw new Error("Failed to fetch footer data");
        const data: FooterData = await response.json();
        setFooterData(data);
      } catch (error) {
        console.error("Error fetching data for footer:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFooterData();
  }, []);

  const handleScrollToTop = () => {
    animateScroll.scrollToTop({
      smooth: true,
      duration: 500,
    });
  };

  return (
    <footer className="w-full border-t border-border/50 bg-primary text-primary-foreground">
      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {/* Column 1: DBTS Section */}
        <div>
          <button
            onClick={handleScrollToTop}
            className="flex items-center gap-3 text-left"
          >
            <Image
              src="/logo.svg"
              alt="Dayspring Logo"
              width={90}
              height={90}
            />
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold tracking-wide text-primary-foreground">
                <span className="block">Dayspring</span>
                <span className="block">Behavioural</span>
              </h3>
              <p className="text-xs tracking-widest text-primary-foreground/80">
                THERAPEUTIC SERVICES
              </p>
            </div>
          </button>
          <p className="mt-4 text-sm text-primary-foreground/80">
            Providing compassionate care for a brighter tomorrow.
          </p>
        </div>

        {/* Column 2 & 3 */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-primary-foreground">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <FooterNavLink to="about">About</FooterNavLink>
              </li>
              <li>
                <FooterNavLink to="services">Services</FooterNavLink>
              </li>
              <li>
                <FooterNavLink to="faq">FAQ</FooterNavLink>
              </li>
              <li>
                <FooterNavLink to="contact">Contact</FooterNavLink>
              </li>
            </ul>
          </div>
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
                    {isLoading
                      ? "Loading..."
                      : footerData.email ||
                        "dayspringbehavioural@gmail.com"}{" "}
                    {/* Fallback */}
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
                {footerData.socialLinks.length > 0 ? (
                  <div className="flex items-center space-x-3">
                    {footerData.socialLinks.map((link) => {
                      const IconComponent =
                        socialIcons[link.icon as keyof typeof socialIcons];
                      if (!IconComponent) return null;
                      return (
                        <a
                          key={link.icon}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center text-primary-foreground transition-opacity hover:opacity-80"
                          aria-label={`Follow us on ${link.icon}`}
                        >
                          <IconComponent size={16} />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                      <Instagram
                        className="text-primary-foreground/50"
                        size={16}
                      />
                    </div>
                    <span className="text-sm text-primary-foreground/80">
                      Socials coming soon!
                    </span>
                  </div>
                )}
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
          <NextLink
            href="/login"
            className="text-xs text-primary-foreground/60 transition-colors hover:text-primary-foreground ease-in-out"
          >
            Admin Login
          </NextLink>
        </div>
      </div>
    </footer>
  );
}
