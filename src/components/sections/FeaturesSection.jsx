"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageCircle,
  Monitor,
  Ticket,
  Users,
} from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1];

const steps = [
  { number: "01", title: "Book Appointment", icon: CalendarDays },
  { number: "02", title: "Get Digital Token", icon: Ticket },
  { number: "03", title: "Track Queue Live", icon: Activity },
  { number: "04", title: "Receive Turn Alert", icon: Bell },
];

function AccentUnderline() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 18"
      className="mt-4 h-[14px] w-[180px] max-w-full"
    >
      <path
        d="M8 10 C 60 18, 156 18, 232 8"
        fill="none"
        stroke="#16A34A"
        strokeOpacity="0.28"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SectionBadge({ label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,163,74,0.14)] bg-[#EAF9EF] px-4 py-2 text-sm font-semibold text-[#0F7A3A] shadow-[0_12px_30px_rgba(16,32,24,0.05)]">
      <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
      {label}
    </div>
  );
}

function StoryStepCard({ number, title, icon: Icon }) {
  return (
    <div className="relative z-10 flex items-center gap-3 rounded-[22px] border border-[rgba(22,163,74,0.14)] bg-white/90 px-4 py-4 shadow-[0_18px_44px_rgba(16,32,24,0.08)] backdrop-blur-sm">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EAF9EF] text-[#16A34A]">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-[#7A8A82]">
          {number}
        </p>
        <p className="text-[15px] font-bold text-[#102018]">{title}</p>
      </div>
    </div>
  );
}

function StoryStepsRow() {
  return (
    <div className="relative mt-10">
      <div className="pointer-events-none absolute left-[12%] right-[12%] top-1/2 hidden h-px -translate-y-1/2 bg-[linear-gradient(90deg,rgba(22,163,74,0.08),rgba(22,163,74,0.18),rgba(22,163,74,0.08))] lg:block" />
      <div className="pointer-events-none absolute left-[30%] top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#16A34A] shadow-[0_0_0_6px_rgba(22,163,74,0.12)] lg:block" />
      <div className="pointer-events-none absolute left-[49%] top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-[#D5DDD8] lg:block" />
      <div className="pointer-events-none absolute left-[68%] top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-[#D5DDD8] lg:block" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: easeOut, delay: index * 0.05 }}
          >
            <StoryStepCard {...step} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AppointmentChip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="mt-5 inline-flex items-center gap-3 rounded-full border border-[rgba(22,163,74,0.14)] bg-white px-4 py-3 text-sm font-medium text-[#102018] shadow-[0_18px_40px_rgba(16,32,24,0.06)]"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF9EF] text-[#16A34A]">
        <CalendarDays size={18} />
      </span>
      <span>Mon, 12 May — Appointment booked</span>
    </motion.div>
  );
}

function FeatureTag({ label }) {
  return (
    <span className="inline-flex rounded-full border border-[rgba(22,163,74,0.12)] bg-[#EAF9EF] px-3 py-1 text-xs font-semibold text-[#0F7A3A]">
      {label}
    </span>
  );
}

function BulletList({ items }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-[#5B6B63]">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#16A34A]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PreviewShell({ className = "", children }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px] border border-[rgba(22,163,74,0.14)] bg-white/95 p-5 shadow-[0_26px_60px_rgba(16,32,24,0.08)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.9),transparent_45%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function TokenPreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="pointer-events-none absolute inset-x-8 bottom-1 h-20 rounded-full bg-[radial-gradient(circle,rgba(22,163,74,0.18),transparent_72%)] blur-2xl" />
      <PreviewShell className="px-5 py-6">
        <div className="flex items-center gap-2 text-[#53645A]">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#EAF9EF] text-[#16A34A]">
            <Ticket size={17} />
          </span>
          <span className="text-[13px] font-semibold">Digital Token</span>
        </div>
        <p className="mt-6 text-[44px] font-extrabold leading-none tracking-tight text-[#16A34A]">
          Q-016
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#EAF9EF] px-3 py-1.5 text-xs font-semibold text-[#0F7A3A]">
          <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
          Now Serving
        </div>
        <p className="mt-5 text-sm text-[#5B6B63]">3 people ahead of you</p>
        <div className="mt-4 flex items-center gap-2.5">
          {[true, true, true, false].map((active, index) => (
            <span
              key={index}
              className={[
                "h-2.5 w-2.5 rounded-full",
                active ? "bg-[#16A34A]" : "bg-[#D8DFDA]",
              ].join(" ")}
            />
          ))}
          <span className="h-[3px] flex-1 rounded-full bg-[#DDF8E8]" />
        </div>
      </PreviewShell>
    </div>
  );
}

function QueueTrackingPreview() {
  const rows = [
    { code: "Q-016", status: "Now Serving", tone: "text-[#16A34A]" },
    { code: "Q-017", status: "Next", tone: "text-[#102018]" },
    { code: "Q-018", status: "Waiting", tone: "text-[#5B6B63]" },
  ];

  return (
    <PreviewShell className="mx-auto w-full max-w-[380px] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#EAF9EF] text-[#16A34A]">
            <Monitor size={17} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#102018]">Queue Status</p>
            <p className="text-xs text-[#7A8A82]">Live dashboard</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF9EF] px-3 py-1 text-xs font-semibold text-[#0F7A3A]">
          <Clock size={13} />
          Avg Wait: <span className="text-[#16A34A]">12 min</span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div
            key={row.code}
            className="flex items-center justify-between rounded-2xl border border-[rgba(22,163,74,0.08)] bg-[rgba(250,247,240,0.88)] px-4 py-3"
          >
            <span className="text-sm font-bold text-[#102018]">{row.code}</span>
            <span className={["text-sm font-semibold", row.tone].join(" ")}>
              {row.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[22px] border border-[rgba(22,163,74,0.08)] bg-[rgba(250,247,240,0.65)] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#102018]">Queue Trend</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
            <Clock size={13} />
            12 min
          </span>
        </div>
        <svg viewBox="0 0 280 96" aria-hidden="true" className="mt-3 h-[90px] w-full">
          <defs>
            <linearGradient id="featuresChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path
            d="M0 78 C 26 76, 42 70, 62 58 C 88 44, 118 34, 148 28 C 180 22, 214 28, 244 42 C 258 48, 270 53, 280 58 L280 96 L0 96 Z"
            fill="url(#featuresChartFill)"
          />
          <path
            d="M0 78 C 26 76, 42 70, 62 58 C 88 44, 118 34, 148 28 C 180 22, 214 28, 244 42 C 258 48, 270 53, 280 58"
            fill="none"
            stroke="#16A34A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </PreviewShell>
  );
}

function NotificationPreview() {
  const messages = [
    {
      body: "Hi Ramesh, your turn (Q-016) is next. Please proceed to Counter 3.",
      stamp: "Now",
    },
    {
      body: "Your token Q-016 is now being served. Thank you!",
      stamp: "1 min ago",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[380px] space-y-4">
      {messages.map((message, index) => (
        <PreviewShell key={index} className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EAF9EF] text-[#16A34A]">
              {index === 0 ? <Bell size={18} /> : <MessageCircle size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-bold text-[#102018]">
                  QueueCare Alert
                </p>
                <span className="rounded-full bg-[#EAF9EF] px-2.5 py-1 text-[11px] font-semibold text-[#0F7A3A]">
                  {message.stamp}
                </span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-[#5B6B63]">
                {message.body}
              </p>
            </div>
          </div>
        </PreviewShell>
      ))}
    </div>
  );
}

function FeatureStoryCard({
  icon: Icon,
  title,
  description,
  tag,
  bullets,
  preview,
  reverse = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.6, ease: easeOut }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-[32px] border border-[rgba(22,163,74,0.14)] bg-white/92 p-6 shadow-[0_28px_70px_rgba(16,32,24,0.08)] md:p-8"
    >
      <div className="pointer-events-none absolute right-6 top-6 h-[72px] w-[72px] bg-[radial-gradient(circle,rgba(22,163,74,0.14)_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-25" />
      <div
        className={[
          "grid items-center gap-8 lg:grid-cols-[1fr_0.95fr]",
          reverse ? "lg:grid-cols-[0.95fr_1fr]" : "",
        ].join(" ")}
      >
        <div className={reverse ? "lg:order-2" : ""}>
          <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-[#EAF9EF] text-[#16A34A] shadow-[0_12px_24px_rgba(16,32,24,0.06)]">
            <Icon size={22} />
          </div>
          <div className="mt-5">
            <FeatureTag label={tag} />
            <h3 className="mt-4 text-[28px] font-bold tracking-tight text-[#102018]">
              {title}
            </h3>
            <p className="mt-3 max-w-[520px] text-[17px] leading-relaxed text-[#5B6B63]">
              {description}
            </p>
            <BulletList items={bullets} />
          </div>
        </div>

        <div className={reverse ? "lg:order-1" : ""}>{preview}</div>
      </div>
    </motion.div>
  );
}

function FeaturesCTABar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: easeOut }}
      className="mt-8 rounded-[30px] border border-[rgba(22,163,74,0.14)] bg-white/92 p-6 shadow-[0_28px_70px_rgba(16,32,24,0.08)] md:p-8"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-[#EAF9EF] text-[#16A34A] shadow-[0_12px_24px_rgba(16,32,24,0.06)]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[28px] font-bold leading-tight tracking-tight text-[#102018]">
              Everything your front desk needs
              <br />
              to keep queues calm.
            </p>
          </div>
        </div>

        <motion.a
          href="#product"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#16A34A] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(22,163,74,0.22)]"
        >
          See All Features
          <ArrowRight size={17} />
        </motion.a>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-visible bg-[#FAF7F0] text-[#102018]"
    >
      <div className="mx-auto max-w-[1240px] px-6 pb-20 pt-20 md:px-8 md:pb-24 md:pt-24 lg:px-10">
        <div className="mx-auto max-w-[920px] text-center">
          <SectionBadge label="Core Features" />
          <h2 className="mt-6 text-[36px] font-extrabold leading-[1.08] tracking-tight text-[#102018] md:text-[48px] lg:text-[56px]">
            From booking to visit,
            <br />
            every step <span className="text-[#16A34A]">keeps patients flowing.</span>
          </h2>
          <div className="flex justify-center">
            <AccentUnderline />
          </div>
          <p className="mx-auto mt-5 max-w-[760px] text-[17px] leading-[1.75] text-[#5B6B63] md:text-[18px]">
            QueueCare connects every step of your clinic&apos;s patient
            journey—so you can reduce wait times, improve experience, and run a
            smoother front desk.
          </p>
        </div>

        <StoryStepsRow />

        <div className="flex justify-center">
          <AppointmentChip />
        </div>

        <div className="mt-10 space-y-6">
          <FeatureStoryCard
            icon={Ticket}
            title="Digital Tokens"
            description="Eliminate paper tokens and manual counters."
            tag="Clinic friendly"
            bullets={[
              "Instant digital token on check-in",
              "Token shown on screen & mobile",
              "No duplicates, no confusion",
            ]}
            preview={<TokenPreviewCard />}
          />

          <FeatureStoryCard
            icon={Activity}
            title="Live Queue Tracking"
            description="Know what’s happening in real time."
            tag="Real-time"
            bullets={[
              "Live queue status on dashboard & screens",
              "Estimated wait times at a glance",
              "Smarter planning for staff & patients",
            ]}
            preview={<QueueTrackingPreview />}
            reverse
          />

          <FeatureStoryCard
            icon={Bell}
            title="Turn Notifications"
            description="Keep patients informed, even outside the clinic."
            tag="SMS / WhatsApp"
            bullets={[
              "Turn alerts via SMS & WhatsApp",
              "Custom reminders & updates",
              "Fewer no-shows, happier patients",
            ]}
            preview={<NotificationPreview />}
          />
        </div>

        <FeaturesCTABar />
      </div>
    </section>
  );
}
