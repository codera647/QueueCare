"use client";

import { Activity, ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { LogoMark2D } from "@/components/logo-mark-2d";

const quickLinks = [
  { label: "Home", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "Product", href: "#product" },
  { label: "Contact", href: "#contact" },
  { label: "Launch App", href: "/app" },
  { label: "Clinic Sign In", href: "/app/auth/login/clinic" },
];

const contactLinks = [
  { label: "hello@queuecare.com", href: "mailto:hello@queuecare.com", icon: Mail },
  { label: "+92 300 0000000", href: "https://wa.me/923000000000", icon: MessageCircle },
];

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-[rgba(22,163,74,0.14)] bg-[#FAF7F0]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[4%] top-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(22,163,74,0.08),transparent_70%)] blur-2xl" />
        <div className="absolute right-[7%] bottom-2 h-20 w-20 bg-[radial-gradient(circle,rgba(22,163,74,0.16)_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-20" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[520px]">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-white shadow-[0_16px_36px_rgba(16,32,24,0.08)]">
                <LogoMark2D size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[18px] font-bold tracking-tight text-[#102018]">
                    QueueCare
                  </p>
                  <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                </div>
                <p className="text-sm font-medium text-[#0F7A3A]">
                  Smarter queues. Calmer clinics.
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-[520px] text-sm leading-relaxed text-[#5B6B63]">
              Helping clinics manage appointments, tokens, wait times, and
              patient notifications from one simple system.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {["For clinics", "Pilot demo", "Early access"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,163,74,0.12)] bg-white/88 px-3 py-1.5 text-xs font-semibold text-[#0F7A3A] shadow-[0_10px_20px_rgba(16,32,24,0.04)]"
                >
                  <Activity size={12} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:gap-10">
            <div>
              <p className="text-sm font-bold text-[#102018]">Quick Links</p>
              <nav className="mt-4 flex flex-col items-start gap-3">
                {quickLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-[#5B6B63] transition-colors hover:text-[#16A34A]"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={14} />
                  </a>
                ))}
              </nav>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-[#102018]">Contact</p>
              <div className="flex flex-wrap items-center gap-8 md:gap-10">
                {contactLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      className="inline-flex items-center gap-3.5 text-[15px] leading-none text-[#4B5B52] transition-colors hover:text-green-700 md:text-base"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-green-600" />
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[rgba(22,163,74,0.12)] pt-5 text-sm text-[#5B6B63] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 QueueCare. All rights reserved.</p>
          <p>Built for better patient flow.</p>
        </div>
      </div>
    </footer>
  );
}
