// src/app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// THIS IS THE UPDATED METADATA OBJECT
export const metadata: Metadata = {
  title: "DBTS - Dayspring Behavioural Therapeutic Services",
  description: "Compassionate, evidence-based therapy and behavioral services.",
  manifest: "/site.webmanifest", // Links to the file in your /public folder
  icons: {
    // This points to the main icon file (the renamed 512x512 png)
    icon: "/icon.png",
    // This is the classic favicon for older browsers
    shortcut: "/favicon.ico",
    // This is the icon for Apple devices
    apple: "/apple-icon.png",
  },
};

// The rest of the file is the same
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
