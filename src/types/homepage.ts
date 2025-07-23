// FILE: src/types/homepage.ts

import type { Database } from "@/types/supabase";

// Get the specific Profile type from our auto-generated Supabase types
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// A simple reusable type for sections with a title and description
type TitledListItem = {
  title: string;
  description: string;
};

// A type for the service settings section with icons
type ServiceSetting = {
  icon: "home" | "tv" | "school" | "users"; // We use names to map to icon components later
  text: string;
};

// This is the main interface that defines the entire shape of our homepage content.
// It will be used by both the frontend component and the backend data fetching.
export interface HomePageData {
  profile: Profile | null;
  hero: {
    title: string;
    subtitle: string;
  };
  about: {
    title: string;
    // An array of strings allows for multiple paragraphs in the about section
    body: string[];
  };
  guidingPrinciples: {
    title: string;
    subtitle: string;
    values: TitledListItem[];
  };
  services: {
    title: string;
    subtitle: string;
    list: TitledListItem[];
    settingsTitle: string;
    settings: ServiceSetting[];
  };
  intake: {
    title: string;
    subtitle: string;
    steps: { step: number; title: string; description: string }[];
  };
  faq: {
    title: string;
    questions: { question: string; answer: string }[];
  };
  cta: {
    title: string;
    subtitle: string;
  };
}
