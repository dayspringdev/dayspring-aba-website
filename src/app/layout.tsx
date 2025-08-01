// src/app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script"; // Import the Script component

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DBTS - Dayspring Behavioural Therapeutic Services",
  description: "Compassionate, evidence-based therapy and behavioral services.",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

// This is the raw JavaScript code for our "signal catcher"
const signalCatcherScript = `
  (function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from_invite') === 'true') {
      console.log('[Signal Catcher] Invite signal detected. Setting session flag.');
      sessionStorage.setItem('is_new_invite', 'true');
      // Clean up the URL for a better user experience
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {/*
          This script will run immediately when the page loads,
          before the main Next.js/React components.
        */}
        <Script id="signal-catcher" strategy="beforeInteractive">
          {signalCatcherScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
