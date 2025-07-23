// FILE: src/app/(public)/page.tsx

import { publicSupabase } from "@/lib/supabase/public-server";
import { HomePageContent } from "@/components/HomePageContent";
import type { HomePageData } from "@/types/homepage";

export const revalidate = 60;

export default async function Home() {
  // Fetch both the dynamic profile data AND the main page content
  const [profileRes, contentRes] = await Promise.all([
    publicSupabase.from("profiles").select("*").eq("id", 1).single(),
    publicSupabase
      .from("homepage_content")
      .select("content")
      .eq("id", 1)
      .single(),
  ]);

  // Combine the content from the DB with the dynamic profile data
  // Use optional chaining and nullish coalescing for safety
  const finalContent: HomePageData | null = contentRes.data
    ? {
        ...(contentRes.data.content as Omit<HomePageData, "profile">),
        profile: profileRes.data,
      }
    : null;

  // Render the client component and pass the complete data object as a prop
  return <HomePageContent content={finalContent} />;
}
