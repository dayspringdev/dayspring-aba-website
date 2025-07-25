// FILE: src/app/api/social-links/route.ts

import { NextResponse } from "next/server";
import { getHomepageContent } from "@/lib/data-access/homepage"; // <-- IMPORT our new function

export const revalidate = 60;

export async function GET() {
  try {
    // Call the same single, cached function
    const pageContent = await getHomepageContent(); // Call the homepage content again to get socials links. CACHED

    if (pageContent) {
      const socialLinks = pageContent.contact?.socialMediaLinks || [];
      return NextResponse.json(socialLinks);
    }

    // Return empty array if no content found
    return NextResponse.json([]);
  } catch (error) {
    console.error("API Error fetching social links:", error);
    return NextResponse.json(
      { error: "Could not fetch social links." },
      { status: 500 }
    );
  }
}
