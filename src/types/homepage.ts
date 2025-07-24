// FILE: src/types/homepage.ts

// This file defines the "data contract" for all editable content on the homepage.
// This single interface is used by:
// 1. The database (as the shape of the JSONB object).
// 2. The frontend components (as the shape of their props).
// 3. The admin content editor (as the shape of its state).

export interface HomePageData {
  hero: {
    headline: {
      part1: string;
      part2: string;
      part3: string;
    };
    subtitle: string;
    buttons: {
      primary: string;
      secondary: string;
    };
    trustIndicators: string[];
  };
  missionVision: {
    title: string;
    subtitle: string;
    mission: {
      title: string;
      text: string;
    };
    vision: {
      title: string;
      text: string;
    };
  };
  coreValues: {
    title: string;
    subtitle: string;
    values: {
      icon: string; // The name of the lucide-react icon, e.g., "Cross"
      title: string;
      description: string;
    }[];
  };
  aboutUs: {
    title: string;
    subtitle: string;
    imageUrl: string;
    bio: string[];
    credentials: string[];
  };
  services: {
    title: string;
    subtitle: string;
    therapyServices: {
      icon: string;
      title: string;
      description: string;
      features: string[];
    }[];
    settingsTitle: string;
    settingsSubtitle: string;
    settings: {
      icon: string;
      title: string;
      description: string;
    }[];
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: {
      icon: string;
      title: string;
      description: string;
    }[];
  };
  faq: {
    title: string;
    subtitle: string;
    questions: {
      question: string;
      answer: string;
    }[];
  };
  contact: {
    title: string;
    subtitle: string;
    connectCardTitle: string;
    contactItems: {
      icon: string;
      title: string;
      description: string;
      subtext: string;
    }[];
  };
}
