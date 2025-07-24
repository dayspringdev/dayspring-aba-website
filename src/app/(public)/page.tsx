// src/app/(public)/page.tsx

import { publicSupabase } from "@/lib/supabase/public-server";
import { HomePageContent } from "@/components/HomePageContent";
import type { HomePageData } from "@/types/homepage";

export const revalidate = 60;

export default async function Home() {
  const { data, error } = await publicSupabase
    .from("homepage_content")
    .select("content")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("Failed to fetch homepage content:", error);
    return <div>Error loading page. Please try again later.</div>;
  }

  // === THE FIX IS HERE ===
  // This tells TypeScript: "Treat 'data.content' as an unknown type first,
  // then I, the developer, assert that it is of type HomePageData."
  const pageContent = data.content as unknown as HomePageData;

  return <HomePageContent content={pageContent} />;
}
