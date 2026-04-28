"use client";

import { AnimatedSidebar } from "@/components/nav/AnimatedSidebar";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HeroSection from "@/components/sections/HeroSection";

export function LandingPage() {
  return (
    <div className="relative min-h-[100svh] bg-[#FAF7F0] text-[#102018]">

      <AnimatedSidebar />

      <main
        className="min-h-[100svh] pl-0 md:pl-[170px]"
        aria-label="Content"
      >
        <HeroSection />
        <FeaturesSection />

        {/* Placeholder sections so the nav hill can be tested while we build */}
        {[
          { id: "about", label: "About" },
          { id: "product", label: "Product" },
          { id: "reviews", label: "Reviews" },
          { id: "team", label: "Team" },
          { id: "contact", label: "Contact" },
        ].map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="mx-auto flex min-h-[100svh] w-full max-w-6xl items-center px-6 py-24 sm:px-10"
          >
            <div className="w-full rounded-3xl border border-[rgba(22,163,74,0.18)] bg-white/60 p-10 shadow-[0_30px_80px_rgba(16,32,24,0.10)] backdrop-blur">
              <p className="text-xs font-semibold tracking-wide text-[#53645A]">
                SECTION
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#102018]">
                {s.label}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-[#53645A]">
                Placeholder content for scroll testing. We&apos;ll replace this
                with real sections next.
              </p>
              <div className="mt-8 h-56 rounded-2xl bg-[#EAF9EF]" />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
