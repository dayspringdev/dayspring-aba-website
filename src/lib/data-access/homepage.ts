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
    console.log("CACHE MISS: Hitting database for homepage content..."); // You'll see this in your server logs only ONCE per request

    const { data, error } = await publicSupabase
      .from("homepage_content")
      .select("content")
      .eq("id", 1)
      .single();

    if (error || !data) {
      console.error("Failed to fetch homepage content from DB:", error);
      return null;
    }

    const pageContent = data.content as unknown as HomePageData;

    // Ensure socialMediaLinks exists, default to empty array if not
    if (pageContent.contact && !pageContent.contact.socialMediaLinks) {
      pageContent.contact.socialMediaLinks = [];
    }

    return pageContent;
  }
);
