// This layout wraps all admin-related pages.

import { Toaster } from "sonner";

// It does NOT add a Header or Footer.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
