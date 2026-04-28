"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  Clock,
  Grid2x2,
  Play,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1];

function UnderlineStroke() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 22"
      className="mt-3 h-[18px] w-[220px] max-w-full"
    >
      <path
        d="M6 14 C 62 24, 168 24, 234 10"
        fill="none"
        stroke="#16A34A"
        strokeOpacity="0.35"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FeatureItem({ icon: Icon, label }) {
  return (
    <div className="inline-flex h-[40px] items-center gap-2 rounded-full border border-[rgba(22,163,74,0.14)] bg-white/70 px-[14px] py-2 whitespace-nowrap shadow-[0_10px_24px_rgba(16,32,24,0.06)]">
      <span className="grid h-[28px] w-[28px] place-items-center rounded-full bg-[#EAF9EF] text-[#16A34A]">
        <Icon size={14} />
      </span>
      <span className="text-[13px] font-semibold text-[#0F7A3A]">{label}</span>
    </div>
  );
}

function CardShell({
  className = "",
  children,
  initial,
  animate,
  transition,
  floatDuration = 6,
  floatDelay = 0,
  tilt = {},
}) {
  return (
    <motion.div
      className={[
        "relative overflow-hidden rounded-[28px] border border-[rgba(22,163,74,0.15)] bg-[rgba(255,255,255,0.92)] shadow-[0_36px_80px_rgba(15,122,58,0.18),0_16px_34px_rgba(16,32,24,0.08),0_4px_12px_rgba(16,32,24,0.05),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-[16px] [transform-style:preserve-3d] transform-gpu",
        className,
      ].join(" ")}
      initial={initial}
      animate={{
        ...animate,
        y: [0, -8, 0],
      }}
      transition={{
        ...transition,
        y: {
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        },
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        ...tilt,
      }}
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.85),transparent_42%)]" />
      {children}
    </motion.div>
  );
}

function DashboardMockup({ mobile = false }) {
  const statCards = [
    { icon: Users, label: "Total Patients", value: "128" },
    { icon: Ticket, label: "Now Serving", value: "Q-016" },
    { icon: Clock, label: "Avg. Wait", value: "12 min" },
    { icon: Activity, label: "Satisfaction", value: "92%" },
  ];

  return (
    <CardShell
      className={
        mobile
          ? "h-auto w-full rounded-[30px] bg-[rgba(255,255,255,0.94)] p-5"
          : "h-[325px] w-[500px] rounded-[30px] bg-[rgba(255,255,255,0.94)] p-4"
      }
      initial={{ opacity: 0, x: 28, rotateY: -14, rotateX: 6, rotateZ: -2 }}
      animate={{ opacity: 1, x: 0, rotateY: -7, rotateX: 3, rotateZ: -1, y: [-3, 3, -3] }}
      transition={{ duration: 0.75, ease: easeOut, delay: 0.1 }}
      floatDuration={6.4}
      tilt={{ rotateY: -5, rotateX: 2, rotateZ: -1 }}
    >
      {!mobile ? (
        <div className="pointer-events-none absolute bottom-[-18px] left-[10%] right-[10%] -z-10 h-[30px] rounded-[999px] bg-[rgba(15,122,58,0.22)] blur-[18px]" />
      ) : null}
      <div className="relative flex h-full gap-4">
        <div className="hidden w-[48px] shrink-0 rounded-[20px] bg-[rgba(234,249,239,0.55)] p-2 lg:block">
          <div className="space-y-2.5">
            {[
              { icon: Grid2x2, active: true },
              { icon: Users, active: false },
              { icon: Ticket, active: false },
              { icon: Activity, active: false },
            ].map(({ icon: Icon, active }, index) => (
              <div
                key={index}
                className={[
                  "grid h-8 w-8 place-items-center rounded-2xl border",
                  active
                    ? "border-[rgba(22,163,74,0.12)] bg-white text-[#16A34A] shadow-[0_10px_20px_rgba(16,32,24,0.06)]"
                    : "border-transparent bg-transparent text-[#53645A]",
                ].join(" ")}
              >
                <Icon size={16} />
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-2xl bg-[#EAF9EF] text-[#16A34A] shadow-[0_10px_20px_rgba(16,32,24,0.06)]">
                <Grid2x2 size={16} />
              </span>
              <span className="text-[16px] font-bold text-[#102018]">
                Clinic Dashboard
              </span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF9EF] px-2.5 py-1 text-[11px] font-semibold text-[#0F7A3A]">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              System Online
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
            {statCards.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="h-[72px] rounded-[18px] border border-[rgba(22,163,74,0.08)] bg-[rgba(250,247,240,0.88)] p-2.5"
              >
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <Icon size={13} />
                  <span className="text-[10px] font-semibold text-[#53645A]">
                    {label === "Total Patients"
                      ? "Total"
                      : label === "Now Serving"
                        ? "Serving"
                        : label === "Avg. Wait"
                          ? "Wait"
                          : "Rating"}
                  </span>
                </div>
                <p
                  className={[
                    "mt-2 text-[21px] font-extrabold leading-none text-[#102018]",
                    value === "Q-016" ? "whitespace-nowrap" : "",
                  ].join(" ")}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[22px] border border-[rgba(22,163,74,0.08)] bg-[rgba(250,247,240,0.6)] p-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold text-[#102018]">
                Queue Trend Today
              </p>
              <span className="text-[10px] font-medium text-[#53645A]">Live</span>
            </div>

            <div className="mt-3">
              <svg viewBox="0 0 320 120" aria-hidden="true" className="h-[105px] w-full">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A34A" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {[20, 45, 70, 95].map((line) => (
                  <line
                    key={line}
                    x1="0"
                    x2="320"
                    y1={line}
                    y2={line}
                    stroke="rgba(16,32,24,0.08)"
                    strokeWidth="1"
                  />
                ))}

                <path
                  d="M0 96 C 28 92, 44 88, 62 74 C 84 58, 104 52, 128 42 C 152 32, 176 26, 198 38 C 218 48, 236 54, 260 52 C 280 50, 300 58, 320 64 L320 120 L0 120 Z"
                  fill="url(#chartFill)"
                />
                <motion.path
                  d="M0 96 C 28 92, 44 88, 62 74 C 84 58, 104 52, 128 42 C 152 32, 176 26, 198 38 C 218 48, 236 54, 260 52 C 280 50, 300 58, 320 64"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.5 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: easeOut, delay: 0.35 }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function TokenMockup({ mobile = false }) {
  return (
    <CardShell
      className={mobile ? "h-auto w-full p-5" : "h-[270px] w-[205px] p-5"}
      initial={{ opacity: 0, x: 36, rotateY: -24, rotateX: 8, rotateZ: 4 }}
      animate={{ opacity: 1, x: 0, rotateY: -12, rotateX: 4, rotateZ: 2, y: [-5, 5, -5] }}
      transition={{ duration: 0.8, ease: easeOut, delay: 0.2 }}
      floatDuration={5.6}
      floatDelay={0.4}
      tilt={{ rotateY: -10, rotateX: 3, rotateZ: 1 }}
    >
      {!mobile ? (
        <div className="pointer-events-none absolute bottom-[-18px] left-[12%] right-[12%] -z-10 h-[28px] rounded-[999px] bg-[rgba(15,122,58,0.2)] blur-[18px]" />
      ) : null}
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#53645A]">
            <span className="grid h-8 w-8 place-items-center rounded-2xl bg-[#EAF9EF] text-[#16A34A]">
              <Ticket size={16} />
            </span>
            <span className="text-[13px] font-semibold">Digital Token</span>
          </div>

          <div className="mt-5">
            <p className="text-[40px] font-extrabold leading-none tracking-tight text-[#16A34A]">
              Q-016
            </p>
            <p className="mt-3 inline-flex rounded-full bg-[#EAF9EF] px-2.5 py-1 text-[12px] font-semibold text-[#0F7A3A]">
              Now Serving
            </p>
          </div>

          <div className="mt-4 rounded-[20px] bg-[rgba(234,249,239,0.75)] p-3">
            <p className="text-[14px] font-bold text-[#102018]">
              You are next in line
            </p>
          </div>
        </div>

        <div>
          <p className="text-[12px] text-[#53645A]">
            Thank you for your patience.
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#DDF8E8]">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#16A34A,#75C928)]"
              initial={{ width: 0 }}
              animate={{ width: "82%" }}
              transition={{ duration: 1, ease: easeOut, delay: 0.45 }}
            />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function WaitTimeCard({ mobile = false }) {
  return (
    <CardShell
      className={mobile ? "h-auto w-full p-5" : "h-[125px] w-[285px] p-4"}
      initial={{ opacity: 0, x: 18, rotateY: -12, rotateX: 5, rotateZ: 3 }}
      animate={{ opacity: 1, x: 0, rotateY: -6, rotateX: 3, rotateZ: 1, y: [-4, 4, -4] }}
      transition={{ duration: 0.75, ease: easeOut, delay: 0.28 }}
      floatDuration={6.4}
      floatDelay={0.7}
      tilt={{ rotateY: -4, rotateX: 2, rotateZ: 1 }}
    >
      <div className="relative flex h-full items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-[#EAF9EF] text-[#16A34A]">
          <Clock size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#53645A]">
            Estimated Wait
          </p>
          <p className="mt-1.5 text-[32px] font-extrabold leading-none text-[#16A34A]">
            12 <span className="text-[20px]">min</span>
          </p>
          <p className="mt-1.5 text-[13px] text-[#53645A]">
            3 people ahead
          </p>

          <div className="mt-3 flex items-center gap-2.5">
            {[true, true, true, false].map((active, index) => (
              <span
                key={index}
                className={[
                  "h-2 w-2 rounded-full",
                  active ? "bg-[#16A34A]" : "bg-[#D7DED9]",
                ].join(" ")}
              />
            ))}
            <span className="h-[2px] flex-1 rounded-full bg-[#DDF8E8]" />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function NotificationMockup({ mobile = false }) {
  return (
    <CardShell
      className={mobile ? "h-auto w-full p-5" : "h-[135px] w-[340px] px-4 py-3.5"}
      initial={{ opacity: 0, x: 40, rotateY: -16, rotateX: 6, rotateZ: -3 }}
      animate={{ opacity: 1, x: 0, rotateY: -8, rotateX: 3, rotateZ: -1, y: [-4, 4, -4] }}
      transition={{ duration: 0.8, ease: easeOut, delay: 0.35 }}
      floatDuration={5.8}
      floatDelay={1}
      tilt={{ rotateY: -6, rotateX: 2, rotateZ: -1 }}
    >
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#102018]">
            <Bell size={14} className="text-[#16A34A]" />
            <span className="text-[13px] font-semibold">Notification</span>
          </div>
          <span className="rounded-full bg-[#EAF9EF] px-2.5 py-1 text-[11px] font-semibold text-[#0F7A3A]">
            Now
          </span>
        </div>

        <div className="mt-3 flex flex-1 items-start gap-3 rounded-[20px] bg-[rgba(234,249,239,0.7)] p-3.5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EAF9EF] text-[#16A34A] shadow-[0_10px_20px_rgba(16,32,24,0.06)]">
            <Bell size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-[#102018]">
              Your turn is near!
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#53645A]">
              Please be ready.
            </p>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,163,74,0.16)] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#0F7A3A] shadow-[0_10px_24px_rgba(16,32,24,0.06)]"
          >
            View Details
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </CardShell>
  );
}

function FloatingProductCards() {
  return (
    <>
      <div className="relative ml-auto mr-6 hidden h-[540px] w-full max-w-[690px] translate-x-[-24px] translate-y-[20px] [perspective:1600px] [transform-style:preserve-3d] lg:block">
        <div className="absolute inset-0 origin-center scale-[0.92] xl:scale-[0.96] 2xl:scale-100">
        <div className="pointer-events-none absolute right-[20px] top-[90px] z-0 h-[430px] w-[560px] rounded-[9999px] bg-[radial-gradient(circle,rgba(22,163,74,0.18)_0%,rgba(221,248,232,0.38)_38%,transparent_72%)] opacity-90 blur-[18px]" />
        <div className="pointer-events-none absolute right-[80px] top-[180px] z-0 h-[300px] w-[440px] rotate-[-14deg] rounded-[55%_45%_60%_40%_/_45%_60%_40%_55%] bg-[rgba(221,248,232,0.45)] blur-[6px]" />
        <div className="pointer-events-none absolute right-[32px] top-[44px] h-[88px] w-[88px] bg-[radial-gradient(circle,rgba(22,163,74,0.28)_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-25" />
        <div className="pointer-events-none absolute left-[34px] bottom-[28px] h-[72px] w-[110px] bg-[radial-gradient(circle,rgba(22,163,74,0.22)_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-25" />

        <div className="absolute left-[5px] top-[35px] z-[20]">
          <DashboardMockup />
        </div>
        <div className="absolute right-[-28px] top-[108px] z-[32]">
          <TokenMockup />
        </div>
        <div className="absolute bottom-[42px] left-[60px] z-[26]">
          <WaitTimeCard />
        </div>
        <div className="absolute bottom-[8px] right-[48px] z-[35]">
          <NotificationMockup />
        </div>
        </div>
      </div>

      <div className="space-y-5 lg:hidden">
        <DashboardMockup mobile />
        <TokenMockup mobile />
        <NotificationMockup mobile />
      </div>
    </>
  );
}

function LeftHeroContent() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: easeOut }}
      className="pt-0"
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(22,163,74,0.2)] bg-[#EAF9EF] px-[18px] py-[10px] text-[15px] font-semibold text-[#0F7A3A] shadow-[0_16px_40px_rgba(16,32,24,0.08)]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
        Smart Queue Management
      </div>

      <h1 className="mt-6 max-w-[560px] text-[44px] font-extrabold leading-[1.02] tracking-tight text-[#102018] md:text-[52px] lg:text-[54px] xl:text-[60px] 2xl:text-[66px]">
        No More Waiting.
        <br />
        <span className="text-[#16A34A]">Just Flow.</span>
      </h1>
      <UnderlineStroke />

      <p className="mt-5 max-w-[610px] text-[17px] leading-[1.6] text-[#53645A]">
        QueueCare helps clinics manage digital tokens, live queues, wait
        times, and patient turn notifications from one simple dashboard.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <motion.a
          href="#features"
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#16A34A] px-7 py-4 text-sm font-semibold text-white shadow-[0_22px_46px_rgba(22,163,74,0.22)]"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          Explore QueueCare <ArrowRight size={18} />
        </motion.a>
        <motion.a
          href="#product"
          className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[rgba(22,163,74,0.22)] bg-white/70 px-7 py-4 text-sm font-semibold text-[#16A34A] shadow-[0_16px_34px_rgba(16,32,24,0.08)]"
          whileHover={{ y: -2, backgroundColor: "rgba(234,249,239,0.75)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full border border-[rgba(22,163,74,0.25)] bg-[#EAF9EF]">
            <Play size={12} className="ml-[1px]" />
          </span>
          Watch Demo
        </motion.a>
      </div>

      <div className="mt-5 inline-flex items-center gap-3 text-[15px] text-[#53645A]">
        <ShieldCheck size={18} className="text-[#16A34A]" />
        Built for clinics that want faster queues and calmer waiting rooms.
      </div>

      <div className="mt-5 flex flex-wrap gap-[10px] xl:flex-nowrap">
        <FeatureItem icon={Ticket} label="Digital Tokens" />
        <FeatureItem icon={TrendingUp} label="Queue Tracking" />
        <FeatureItem icon={Bell} label="Turn Alerts" />
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] overflow-hidden bg-[#FAF7F0] text-[#102018]"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#FAF7F0]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_25%_18%,rgba(22,163,74,0.10),transparent_60%),radial-gradient(880px_circle_at_72%_40%,rgba(22,163,74,0.10),transparent_64%),radial-gradient(800px_circle_at_48%_92%,rgba(16,32,24,0.08),transparent_60%)]" />
      </div>

      <div className="mx-auto grid min-h-[100svh] max-w-[1500px] grid-cols-1 items-center gap-4 px-8 py-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-10 xl:gap-6">
        <LeftHeroContent />

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.08 }}
          className="relative"
        >
          <FloatingProductCards />
        </motion.div>
      </div>
    </section>
  );
}
