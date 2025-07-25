// src/app/(public)/page.tsx

import { HomePageContent } from "@/components/HomePageContent";
import { getHomepageContent } from "@/lib/data-access/homepage"; // <-- IMPORT our new function

export const revalidate = 60;

export default async function Home() {
  // Call the single, cached function to get the data
  const pageContent = await getHomepageContent();

  if (!pageContent) {
    return <div>Error loading page. Please try again later.</div>;
  }

  return <HomePageContent content={pageContent} />;
}
