"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Handshake,
  Mail,
  MessageCircle,
  Phone,
  Rocket,
  Stethoscope,
  User,
  Users,
} from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1];

const benefitCards = [
  {
    icon: Building2,
    title: "For clinics",
    description:
      "Streamline the entire patient flow and reduce waiting room congestion.",
  },
  {
    icon: Stethoscope,
    title: "For doctors",
    description:
      "Stay on schedule and spend more time with patients, less time managing queues.",
  },
  {
    icon: User,
    title: "For reception staff",
    description:
      "Easy-to-use tools for tokens, appointments, and real-time updates.",
  },
  {
    icon: Handshake,
    title: "For pilot partners",
    description:
      "Early access, dedicated support, and co-creation opportunities.",
  },
];

const supportPills = [
  { icon: Clock3, label: "Demo response within 24h" },
  { icon: Building2, label: "Pilot clinic onboarding" },
  { icon: MessageCircle, label: "WhatsApp support" },
];

function SectionBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,163,74,0.14)] bg-[#EAF9EF] px-4 py-2 text-sm font-semibold text-[#0F7A3A] shadow-[0_12px_30px_rgba(16,32,24,0.05)]">
      <Rocket size={14} />
      Get Started
    </div>
  );
}

function BenefitCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: easeOut, delay: index * 0.05 }}
      className="rounded-[20px] border border-[rgba(22,163,74,0.12)] bg-white/88 px-4 py-4 shadow-[0_18px_44px_rgba(16,32,24,0.06)] sm:px-[18px]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-[18px]">
        <div className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[18px] bg-[#EAF9EF] text-[#16A34A]">
          <Icon size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <p className="shrink-0 text-[17px] font-bold text-[#102018] sm:min-w-[165px]">
              {title}
            </p>
            <div className="hidden h-10 w-px bg-[rgba(22,163,74,0.10)] sm:block" />
            <p className="text-[14px] leading-relaxed text-[#5B6B63] sm:text-[15px]">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SupportPill({ icon: Icon, label, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.45, ease: easeOut, delay: index * 0.05 }}
      className="inline-flex min-h-[48px] items-center gap-3 rounded-2xl border border-[rgba(22,163,74,0.12)] bg-white px-4 py-3 text-sm font-medium text-[#102018] shadow-[0_16px_36px_rgba(16,32,24,0.05)]"
    >
      <Icon size={16} className="text-[#16A34A]" />
      <span>{label}</span>
    </motion.div>
  );
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-[14px] font-semibold text-[#102018]">
      {children}
      {required ? <span className="ml-1 text-[#DC2626]">*</span> : null}
    </label>
  );
}

function FieldShell({ icon: Icon, children, textarea = false }) {
  return (
    <div
      className={[
        "relative rounded-[14px] border border-[rgba(16,32,24,0.12)] bg-white/92 transition-shadow focus-within:border-[#16A34A] focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.10)]",
        textarea ? "min-h-[110px]" : "h-14",
      ].join(" ")}
    >
      <Icon
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8A82]"
      />
      {children}
    </div>
  );
}

function ContactFormCard() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: easeOut }}
      className="rounded-[32px] border border-[rgba(22,163,74,0.14)] bg-[rgba(255,255,255,0.92)] p-6 shadow-[0_34px_90px_rgba(15,122,58,0.14),0_16px_36px_rgba(16,32,24,0.08)] backdrop-blur-sm sm:p-8 lg:p-10"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <FieldLabel required>Full Name</FieldLabel>
          <FieldShell icon={User}>
            <input
              type="text"
              placeholder="Enter your full name"
              className="h-full w-full rounded-[14px] bg-transparent pl-12 pr-4 text-[15px] text-[#102018] outline-none placeholder:text-[#8A9790]"
            />
          </FieldShell>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel required>Clinic Name</FieldLabel>
            <FieldShell icon={Building2}>
              <input
                type="text"
                placeholder="Enter your clinic name"
                className="h-full w-full rounded-[14px] bg-transparent pl-12 pr-4 text-[15px] text-[#102018] outline-none placeholder:text-[#8A9790]"
              />
            </FieldShell>
          </div>

          <div>
            <FieldLabel required>Role</FieldLabel>
            <div className="relative">
              <FieldShell icon={Users}>
                <select className="h-full w-full appearance-none rounded-[14px] bg-transparent pl-12 pr-10 text-[15px] text-[#102018] outline-none">
                  <option value="">Select your role</option>
                  <option>Doctor</option>
                  <option>Clinic Owner</option>
                  <option>Receptionist</option>
                  <option>Clinic Manager</option>
                  <option>Other</option>
                </select>
              </FieldShell>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7A8A82]"
              />
            </div>
          </div>
        </div>

        <div>
          <FieldLabel required>Phone / WhatsApp</FieldLabel>
          <FieldShell icon={Phone}>
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="h-full w-full rounded-[14px] bg-transparent pl-12 pr-4 text-[15px] text-[#102018] outline-none placeholder:text-[#8A9790]"
            />
          </FieldShell>
        </div>

        <div>
          <FieldLabel required>Email</FieldLabel>
          <FieldShell icon={Mail}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="h-full w-full rounded-[14px] bg-transparent pl-12 pr-4 text-[15px] text-[#102018] outline-none placeholder:text-[#8A9790]"
            />
          </FieldShell>
        </div>

        <div>
          <FieldLabel>Message</FieldLabel>
          <FieldShell icon={MessageCircle} textarea>
            <textarea
              placeholder="Tell us about your clinic and what you'd like to see in the demo..."
              className="min-h-[110px] w-full resize-none rounded-[14px] bg-transparent pb-4 pl-12 pr-4 pt-4 text-[15px] text-[#102018] outline-none placeholder:text-[#8A9790]"
            />
          </FieldShell>
        </div>

        <motion.button
          type="submit"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          className="inline-flex h-[60px] w-full items-center justify-center gap-3 rounded-[14px] bg-[linear-gradient(135deg,#16A34A,#0F7A3A)] text-[15px] font-bold text-white shadow-[0_20px_44px_rgba(22,163,74,0.24)]"
        >
          {submitted ? (
            <>
              <CheckCircle2 size={18} />
              Request Sent
            </>
          ) : (
            <>
              <CalendarCheck2 size={18} />
              Request Demo
            </>
          )}
        </motion.button>

        <p className="text-center text-sm text-[#5B6B63]">
          Prefer WhatsApp?{" "}
          <span className="font-semibold text-[#16A34A]">
            Message us directly.
          </span>
        </p>
      </form>
    </motion.div>
  );
}

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-visible bg-[#FAF7F0] text-[#102018]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-80px] top-[14%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(22,163,74,0.10),transparent_72%)] blur-3xl" />
        <div className="absolute right-[-70px] top-[24%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(22,163,74,0.08),transparent_72%)] blur-3xl" />
        <svg
          aria-hidden="true"
          viewBox="0 0 400 100"
          className="absolute bottom-10 left-0 h-[80px] w-[220px] opacity-20"
        >
          <path
            d="M0 70 C 80 20, 130 20, 220 70"
            fill="none"
            stroke="#16A34A"
            strokeWidth="2"
          />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 400 100"
          className="absolute bottom-12 right-0 h-[80px] w-[220px] opacity-20"
        >
          <path
            d="M180 70 C 250 24, 310 24, 400 70"
            fill="none"
            stroke="#16A34A"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-20 sm:px-6 md:px-8 md:py-24 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: easeOut }}
            >
              <SectionBadge />
              <h2 className="mt-6 max-w-[680px] text-[38px] font-extrabold leading-[1.04] tracking-tight text-[#102018] sm:text-[44px] md:text-[52px] lg:text-[58px] xl:text-[66px]">
                Ready to make your
                <br />
                clinic <span className="text-[#16A34A]">queue calmer?</span>
              </h2>
              <p className="mt-6 max-w-[680px] text-[16px] leading-[1.7] text-[#5B6B63] sm:text-[17px] md:text-[18px]">
                Book a QueueCare demo and see how we can help your clinic
                manage appointments, tokens, wait times, and patient
                notifications—so you can focus on what matters most.
              </p>
            </motion.div>

            <div className="mt-8 space-y-4">
              {benefitCards.map((card, index) => (
                <BenefitCard key={card.title} {...card} index={index} />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {supportPills.map((pill, index) => (
                <SupportPill key={pill.label} {...pill} index={index} />
              ))}
            </div>
          </div>

          <ContactFormCard />
        </div>
      </div>
    </section>
  );
}
