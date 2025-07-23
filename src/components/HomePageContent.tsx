// FILE: src/components/HomePageContent.tsx

"use client"; // This component uses animations, so it must be a client component.

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import type { HomePageData } from "@/types/homepage"; // <-- Import our new data contract

// --- ICON COMPONENTS ---
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"
    />
  </svg>
);
const TvIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 20.25h12m-7.5-3.75v3.75m-3.75-3.75H1.5V5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v10.875h-4.5M3.75 18h16.5"
    />
  </svg>
);
const SchoolIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
    />
  </svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.75 3.75 0 1 0-5.215-3.184 3.75 3.75 0 0 0 5.215 3.184Zm-3.215-2.209a3 3 0 0 0 4.135 2.197m-4.135-2.197a3 3 0 0 1-2.197 4.135m0-4.135a3 3 0 0 0-4.135-2.197M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.75 3.75 0 1 0-5.215-3.184 3.75 3.75 0 0 0 5.215 3.184Zm0 0a3.75 3.75 0 1 0 7.5 0 3.75 3.75 0 0 0-7.5 0Z"
    />
  </svg>
);

const iconMap = {
  home: HomeIcon,
  tv: TvIcon,
  school: SchoolIcon,
  users: UsersIcon,
};

export function HomePageContent({ content }: { content: HomePageData | null }) {
  if (!content) {
    return <div>Loading page content...</div>;
  }

  const {
    profile,
    hero,
    about,
    guidingPrinciples,
    services,
    intake,
    faq,
    cta,
  } = content;

  return (
    <>
      <section className="relative flex h-[60vh] min-h-[500px] w-full items-center justify-center text-center text-white lg:h-[70vh]">
        <Image
          src="/hero-background.jpg"
          alt="A calm, modern, and sunlit therapy room with soft seating and children's toys on a rug"
          fill
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <AnimatedSection>
            <div className="flex flex-col items-center justify-center space-y-6 px-4">
              <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-7xl">
                {hero.title}
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-gray-200">
                {hero.subtitle}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  className="h-12 px-8 text-base font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  <a href="#intake">Get Started</a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stable anchor div for the About section */}
      <div id="about" className="scroll-mt-20">
        <AnimatedSection className="w-full py-20 lg:py-24">
          <div className="container mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 md:grid-cols-3 lg:gap-16 lg:px-8">
            <div className="flex flex-col items-center md:col-span-1">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={`Headshot of ${profile.full_name || ""}`}
                  width={160}
                  height={160}
                  className="h-40 w-40 rounded-full object-cover shadow-soft"
                  priority
                />
              ) : (
                <div className="h-40 w-40 rounded-full bg-gray-200 shadow-soft" />
              )}
              <h3 className="mt-6 text-2xl font-bold">
                {profile?.full_name || "Tosin Ikotun"}
              </h3>
              <p className="text-base font-medium text-[var(--primary)]">
                {profile?.role_title || "R.B.A., BCBA., Clinical Director"}
              </p>
            </div>
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-3xl font-bold sm:text-4xl">{about.title}</h2>
              {about.body.map((paragraph, index) => (
                <p key={index} className="text-lg text-[var(--muted)]">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection className="w-full py-20 lg:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {guidingPrinciples.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted)]">
              {guidingPrinciples.subtitle}
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {guidingPrinciples.values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-soft transition-transform duration-300 hover:-translate-y-1 cursor-default"
              >
                <h3 className="text-xl font-semibold">{value.title}</h3>
                <p className="mt-2 text-base text-[var(--muted)]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Stable anchor div for the Services section */}
      <div id="services" className="scroll-mt-20">
        <AnimatedSection className="w-full py-20 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                {services.title}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted)]">
                {services.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {services.list.map((service) => (
                <div
                  key={service.title}
                  className="rounded-2xl bg-[var(--card)] p-8 shadow-soft"
                >
                  <h3 className="text-2xl font-bold text-[var(--primary)]">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-base text-[var(--muted)]">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-semibold">
                {services.settingsTitle}
              </h3>
              <div className="mt-8 grid grid-cols-2 justify-center gap-8 md:grid-cols-4">
                {services.settings.map((setting) => {
                  const Icon = iconMap[setting.icon];
                  return (
                    <div
                      key={setting.text}
                      className="flex flex-col items-center gap-2"
                    >
                      <Icon className="h-10 w-10 text-[var(--primary)]" />
                      <span className="font-medium">{setting.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* This section can keep its ID as it's not a primary nav target */}
      <AnimatedSection
        id="intake"
        className="w-full bg-slate-800 py-20 lg:py-24 scroll-mt-20"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl text-white">
              {intake.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              {intake.subtitle}
            </p>
          </div>
          <div className="relative mx-auto flex max-w-2xl flex-col gap-12">
            {intake.steps.map((item) => (
              <div key={item.step} className="flex items-start gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xl font-bold text-white shadow-lg shadow-blue-500/30">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-base text-slate-300">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Stable anchor div for the FAQ section */}
      <div id="faq" className="scroll-mt-20">
        <AnimatedSection className="w-full py-20 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">{faq.title}</h2>
            </div>
            <div className="mx-auto max-w-3xl space-y-6">
              {faq.questions.map((faqItem, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft"
                >
                  <h3 className="text-lg font-semibold">{faqItem.question}</h3>
                  <p className="mt-2 text-base text-[var(--muted)]">
                    {faqItem.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection className="w-full bg-slate-800 py-20 lg:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-10 text-center shadow-soft sm:p-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              {cta.subtitle}
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <Link href="/contact/intake">Schedule Your Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
