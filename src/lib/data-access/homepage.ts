// FILE: src/lib/data-access/homepage.ts

import "server-only"; // Ensures this code only ever runs on the server
import { publicSupabase } from "@/lib/supabase/public-server";
import type { HomePageData } from "@/types/homepage";
import { cache } from "react";

/**
 * A cached and deduplicated function to fetch homepage content.
 * Using React.cache ensures that if this function is called multiple times
 * in a single request-response cycle (e.g., by a page and an API route),
 * the database is only hit once.
 */
export const getHomepageContent = cache(
  async (): Promise<HomePageData | null> => {
    // console.log("CACHE MISS: Hitting database for homepage content..."); // You'll see this in your server logs only ONCE per request

    // Fetch homepage content and profile data in parallel for efficiency
    const [contentRes, profileRes] = await Promise.all([
      publicSupabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .single(),
      publicSupabase
        .from("profiles")
        .select("public_contact_email")
        .eq("id", 1)
        .single(),
    ]);

    if (contentRes.error || !contentRes.data) {
      console.error(
        "Failed to fetch homepage content from DB:",
        contentRes.error
      );
      return null;
    }

    // It's okay if the profile fetch fails; we can log a warning and continue.
    if (profileRes.error) {
      console.warn(
        "Could not fetch public contact email. Using fallback from content.",
        profileRes.error
      );
    }

    const pageContent = contentRes.data.content as unknown as HomePageData;
    const publicContactEmail = profileRes.data?.public_contact_email;

    // --- DYNAMIC EMAIL INJECTION ---
    // If we successfully fetched the dynamic email, inject it into the contact items list.
    // This replaces the hardcoded value before it ever reaches the component.
    if (pageContent.contact && publicContactEmail) {
      const emailItemIndex = pageContent.contact.contactItems.findIndex(
        (item) => item.icon === "Mail"
      );
      if (emailItemIndex !== -1) {
        pageContent.contact.contactItems[emailItemIndex].description =
          publicContactEmail;
      }
    }

    // Ensure socialMediaLinks exists, default to empty array if not
    if (pageContent.contact && !pageContent.contact.socialMediaLinks) {
      pageContent.contact.socialMediaLinks = [];
    }

    return pageContent;
  }
);
