"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck2,
  LayoutDashboard,
  CalendarClock,
  LogOut,
  Settings,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { useState } from "react"; // Import useState for controlling the select

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/availability", label: "Availability", icon: CalendarClock },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck2 },
  { href: "/admin/content", label: "Page Content", icon: Edit },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();
  // Add state to control the value of the <select>
  const [selectedLink, setSelectedLink] = useState(pathname);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Handler for <select> change event
  const handleSelectChange = (value: string) => {
    setSelectedLink(value);
    router.push(value); // Navigate to the selected route
  };

  return (
    // The main container
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* === 1. Navigation Bar (Conditional Rendering) === */}
      {/* 1a. Top Navigation Bar (Mobile) */}
      <aside className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-b-foreground/20 bg-card px-4 lg:hidden">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-primary">DBTS</span>
          <span className="rounded-md border bg-gray-400 px-2 py-1 text-xs font-medium text-primary-foreground">
            Admin
          </span>
        </Link>

        {/* Select Navigation Menu for Mobile */}
        <Select value={selectedLink} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Navigation" />
          </SelectTrigger>
          <SelectContent>
            {navLinks.map((link) => (
              <SelectItem key={link.href} value={link.href}>
                {link.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mobile Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-md py-1 text-sm font-medium text-card-foreground/80 transition-colors hover:bg-muted/10 hover:text-card-foreground"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </aside>

      {/* 1b. Sidebar (Desktop) */}
      <aside className="hidden h-screen w-64 flex-col border-r shadow-none border-foreground/20 bg-card p-6 lg:flex lg:sticky lg:top-0">
        <div className="flex-grow">
          <div className="mb-8 flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">DBTS</span>
            </Link>
            <span className="rounded-md border bg-gray-400 px-2 py-1 text-xs font-medium text-primary-foreground">
              Admin
            </span>
          </div>
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-6 py-3 text-sm font-medium text-card-foreground/80 transition-colors hover:bg-muted/10 hover:text-card-foreground",
                  pathname === link.href && "bg-primary text-primary-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-6 py-3 text-sm font-medium text-card-foreground/80 transition-colors hover:bg-muted/10 hover:text-card-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* === 2. Main Content === */}
      {/* Add top padding to make space for fixed header on small devices */}
      <main className="flex-1 overflow-auto bg-background/50 p-6 lg:p-8 mt-16">
        {children}
      </main>
    </div>
  );
}
