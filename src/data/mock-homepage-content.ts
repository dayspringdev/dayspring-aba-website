// src/data/mock-homepage-content.ts

import type { HomePageData } from "@/types/homepage";

export const mockHomePageContent: HomePageData = {
  hero: {
    headline: {
      part1: "Empowering Children Through",
      // FIX: Removed stray quote from "part2"
      part2: "Compassionate",
      // FIX: Removed stray quote from "part3"
      part3: "ABA Therapy",
    },
    subtitle:
      "Where faith meets science in supporting your child's unique journey. Professional, trauma-informed ABA therapy that honors your family's values.",
    buttons: {
      primary: "Book Free Consultation",
      // FIX: Removed stray quote from "secondary"
      secondary: "Learn More",
    },
    trustIndicators: [
      "Licensed & Insured",
      "Trauma-Informed Care",
      "Faith-Integrated",
    ],
  },
  missionVision: {
    title: "Our Purpose & Vision",
    subtitle:
      "Guided by faith and grounded in science, we're committed to transforming lives through compassionate, evidence-based care.",
    mission: {
      title: "Our Mission",
      // FIX: Removed stray quote from "text"
      text: "To provide Christ-centered, evidence-based ABA therapy that empowers children and families to reach their fullest potential. We believe every child is fearfully and wonderfully made, deserving of compassionate, individualized care that honors their unique gifts.",
    },
    vision: {
      title: "Our Vision",
      // FIX: Removed stray quote from "text"
      text: "A world where every child with autism and behavioral needs thrives in an environment of love, understanding, and hope. We envision communities where faith and science unite to create inclusive spaces for all children to grow, learn, and flourish.",
    },
  },
  coreValues: {
    title: "Our Core Values",
    subtitle:
      "These fundamental principles guide every aspect of our therapeutic approach and shape the caring environment we create for your family.",
    values: [
      {
        icon: "Cross",
        title: "Faith-Centered",
        description:
          "We integrate Christian values into our therapeutic approach, honoring each child as God's unique creation.",
      },
      {
        icon: "FlaskConical",
        title: "Science-Based",
        description:
          "Our methods are rooted in evidence-based ABA practices, ensuring effective and measurable outcomes.",
      },
      {
        icon: "Shield",
        title: "Trauma-Informed",
        description:
          "We prioritize safety and emotional well-being, recognizing the impact of trauma on learning and development.",
      },
      {
        icon: "Zap",
        title: "Empowerment",
        description:
          "We focus on building independence and self-advocacy skills, empowering children to reach their potential.",
      },
      {
        icon: "Users",
        title: "Collaboration",
        description:
          "We work closely with families, schools, and other professionals to ensure comprehensive support.",
      },
    ],
  },
  // ==========================

  // Placeholders for the rest
  aboutUs: {
    title: "Meet The Clinical Director",
    subtitle:
      "Led by compassion, guided by faith, and backed by expertise in Applied Behavior Analysis.",
    imageUrl: "/tosin-ikotun.jpg", // The path to the image in the /public folder
    bio: [
      "Hi, I’m Tosin (Irelewuyi) Ikotun, the clinical director and owner of Dayspring Behavioural Therapeutic Services. I’m a Board Certified Behaviour Analyst (BCBA) and a Registered Behaviour Analyst in Ontario. With over 10 years of experience supporting individuals with various needs, I am deeply committed to both clinical excellence and faith-based care.",
      "I created Dayspring to be a place where evidence-based ABA therapy and the hope of Jesus Christ meet. I believe that every child deserves to be supported with compassion, dignity, and love.",
      "When I’m not serving families, I’m spending time with my loved ones, trying new foods, and growing in my faith.",
    ],
    credentials: ["Master's in ABA", "BCBA Certified", "10+ Years Experience"],
  },
  // ==========================

  services: {
    title: "Our Services",
    subtitle:
      "Comprehensive ABA therapy services designed to meet your child and family exactly where you are, with the flexibility and support you need.",
    therapyServices: [
      {
        icon: "User",
        title: "1:1 ABA Therapy",
        description:
          "Individualized, evidence-based behavioral intervention tailored to your child's unique needs and goals.",
        features: [
          "Personalized treatment plans",
          "Skill building focus",
          "Progress tracking",
          "Family involvement",
        ],
      },
      {
        icon: "Users",
        title: "Caregiver Coaching",
        description:
          "Empowering parents and caregivers with strategies and techniques to support their child's development at home.",
        features: [
          "Parent training sessions",
          "Behavior strategies",
          "Home implementation",
          "Ongoing support",
        ],
      },
    ],
    settingsTitle: "Service Settings",
    settingsSubtitle:
      "We bring our services to you, wherever your child feels most comfortable and can learn best.",
    settings: [
      {
        icon: "Home",
        title: "Home-Based Services",
        description:
          "Therapy in the comfort and familiarity of your own home environment.",
      },
      {
        icon: "Video",
        title: "Virtual Sessions",
        description:
          "Flexible telehealth options for consultations and parent coaching.",
      },
      {
        icon: "School",
        title: "School Collaboration",
        description:
          "Working with educational teams to ensure consistent support across settings.",
      },
      {
        icon: "MapPin",
        title: "Community-Based",
        description:
          "Practicing skills in real-world community settings for generalization.",
      },
    ],
  },
  // ==========================

  howItWorks: {
    title: "How It Works",
    subtitle:
      "Our simple, compassionate intake process is designed to make getting started as smooth and stress-free as possible for your family.",
    steps: [
      {
        icon: "Phone",
        title: "Initial Consultation",
        description:
          "We begin with a free consultation to understand your child's needs, your family's goals, and how we can best support you.",
      },
      {
        icon: "FileText",
        title: "Comprehensive Assessment",
        description:
          "Our thorough assessment evaluates your child's current skills, challenges, and strengths to create a foundation for personalized care.",
      },
      {
        icon: "Target",
        title: "Personalized Treatment Plan",
        description:
          "We develop an individualized treatment plan with specific, measurable goals that align with your family's values and priorities.",
      },
      {
        icon: "Play",
        title: "Begin Therapy Sessions",
        description:
          "We start implementing evidence-based ABA techniques in your chosen setting, making learning engaging and meaningful for your child.",
      },
      {
        icon: "TrendingUp",
        title: "Ongoing Progress & Support",
        description:
          "Regular progress reviews, plan adjustments, and continuous family support ensure your child continues to thrive and grow.",
      },
    ],
  },
  // ==========================

  faq: {
    title: "Frequently Asked Questions",
    subtitle:
      "We understand you may have questions about our services. Here are answers to some of the most common questions families ask us.",
    questions: [
      {
        question: "What is Applied Behavior Analysis (ABA) therapy?",
        answer:
          "ABA therapy is an evidence-based treatment approach that focuses on improving specific behaviors and teaching new skills. It uses principles of learning and behavior to help children with autism and other developmental needs reach their full potential. Our faith-integrated approach combines these scientific methods with Christian values of love, patience, and hope.",
      },
      {
        question: "How do you integrate faith into your therapy approach?",
        answer:
          "We honor and respect your family's Christian values while providing professional ABA services. This means creating a therapy environment rooted in love, grace, and the belief that every child is wonderfully made by God. We work collaboratively with families to ensure our approach aligns with your faith and values, while maintaining the highest clinical standards.",
      },
      {
        question: "What ages do you work with?",
        answer:
          "We primarily work with children ages 2-12, though we can accommodate older children based on individual needs and circumstances. Early intervention is often most effective, but we believe it's never too late to make meaningful progress with the right support and approach.",
      },
      {
        question: "Do you accept insurance?",
        answer:
          "We are working to become credentialed with major insurance providers. Currently, we offer private pay options with flexible payment plans available. We're happy to provide documentation that may help with insurance reimbursement, and we can discuss financial options during your free consultation.",
      },
      {
        question: "Where do therapy sessions take place?",
        answer:
          "We offer flexible service locations including your home, virtual sessions, school collaboration, and community-based settings. We believe children learn best in environments where they feel comfortable and safe, so we'll work with you to determine the most effective setting for your child's needs.",
      },
      {
        question: "What makes your approach trauma-informed?",
        answer:
          "Our trauma-informed approach recognizes that some children may have experienced difficult situations that affect their learning and behavior. We prioritize building trust, ensuring safety, and creating positive therapeutic relationships. We use gentle, respectful methods and always consider your child's emotional well-being alongside their behavioral goals.",
      },
      {
        question:
          "How do you involve parents and families in the therapy process?",
        answer:
          "Family involvement is essential to our approach. We provide parent coaching, regular progress updates, and training on implementing strategies at home. We believe parents are their child's first and most important teachers, so we work to empower you with the knowledge and skills to support your child's continued growth.",
      },
    ],
  },
  // ==========================

  contact: {
    title: "Get In Touch",
    subtitle:
      "Ready to take the next step? We'd love to hear from you and learn how we can support your family's journey. Reach out for your free consultation today.",
    connectCardTitle: "Let's Connect",
    contactItems: [
      {
        icon: "Mail",
        title: "Email Us",
        description: "dayspringbehavioural@gmail.com",
        subtext: "We typically respond within 24 hours",
      },
      {
        icon: "Phone",
        title: "Free Consultation",
        description: "Schedule a call to discuss your needs",
        subtext: "No obligation, just conversation",
      },
      {
        icon: "Clock",
        title: "Our Availability",
        description: "Monday - Friday: 9am - 5pm EST",
        subtext: "We'll respond as soon as possible.",
      },
      {
        icon: "MapPin",
        title: "Service Areas",
        description: "Home, school, and community-based",
        subtext: "Virtual sessions available",
      },
    ],
  },
  // ==========================
};
