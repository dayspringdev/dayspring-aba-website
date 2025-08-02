// FILE: src/lib/data-access/homepage.ts

import "server-only"; // Ensures this code only ever runs on the server
import { publicSupabase } from "@/lib/supabase/public-server";
import type { HomePageData } from "@/types/homepage";
import { cache } from "react";

/**
 * A cached and deduplicated function to fetch the primary business email.
 * This is used for sending notifications and setting the calendar event organizer.
 */
export const getBusinessEmail = cache(async (): Promise<string | null> => {
  const { data, error } = await publicSupabase
    .from("profiles")
    .select("public_contact_email")
    .eq("id", 1)
    .single();

  if (error || !data?.public_contact_email) {
    console.error("Failed to fetch business email from DB:", error);
    return null; // Return null if not found or on error
  }
  return data.public_contact_email;
});

/**
 * A cached and deduplicated function to fetch homepage content.
 * Using React.cache ensures that if this function is called multiple times
 * in a single request-response cycle (e.g., by a page and an API route),
 * the database is only hit once.
 */
export const getHomepageContent = cache(
  async (): Promise<HomePageData | null> => {
    // Fetch homepage content and the business email in parallel
    const [contentRes, businessEmail] = await Promise.all([
      publicSupabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .single(),
      getBusinessEmail(), // Use our new cached function
    ]);

    if (contentRes.error || !contentRes.data) {
      console.error(
        "Failed to fetch homepage content from DB:",
        contentRes.error
      );
      return null;
    }

    const pageContent = contentRes.data.content as unknown as HomePageData;

    // --- DYNAMIC EMAIL INJECTION ---
    if (pageContent.contact && businessEmail) {
      const emailItemIndex = pageContent.contact.contactItems.findIndex(
        (item) => item.icon === "Mail"
      );
      if (emailItemIndex !== -1) {
        pageContent.contact.contactItems[emailItemIndex].description =
          businessEmail;
      }
    }

    // Ensure socialMediaLinks exists, default to empty array if not
    if (pageContent.contact && !pageContent.contact.socialMediaLinks) {
      pageContent.contact.socialMediaLinks = [];
    }

    return pageContent;
  }
);
