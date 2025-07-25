"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r shadow-none border-foreground/20 bg-card p-6">
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
          {/* --- THIS IS THE CHANGE --- */}
          {/* Replaced the <Button> component with a <button> element */}
          {/* and applied the exact same classes as the nav links for visual consistency. */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-6 py-3 text-sm font-medium text-card-foreground/80 transition-colors hover:bg-muted/10 hover:text-card-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-background/50 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
