"use client";

import { AnimatedSidebar } from "@/components/nav/AnimatedSidebar";
import ContactSection from "@/components/sections/ContactSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HeroSection from "@/components/sections/HeroSection";
import LandingFooter from "@/components/sections/LandingFooter";
import ProductSection from "@/components/sections/ProductSection";

export function LandingPage() {
  return (
    <div className="relative min-h-[100svh] bg-[#FAF7F0] text-[#102018]">
      <AnimatedSidebar />

      <main
        className="min-h-[100svh] overflow-x-hidden pb-24 pl-0 lg:pl-[170px] lg:pb-0"
        aria-label="Content"
      >
        <HeroSection />
        <FeaturesSection />
        <ProductSection />
        <ContactSection />
        <LandingFooter />
      </main>
    </div>
  );
}
