"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Expand,
  Monitor,
  PhoneCall,
  Play,
  Settings,
  Smartphone,
  User,
  Users,
} from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1];

const productOptions = [
  {
    id: "patientApp",
    title: "Patient App",
    subtitle: "Seamless experience for patients",
    icon: Smartphone,
  },
  {
    id: "dashboard",
    title: "Clinic Dashboard",
    subtitle: "Real-time control for your staff",
    icon: Monitor,
    badge: "Active",
  },
  {
    id: "notifications",
    title: "Notifications",
    subtitle: "Smart alerts that keep everyone informed",
    icon: Bell,
  },
  {
    id: "analytics",
    title: "Analytics",
    subtitle: "Insights that help you make better decisions",
    icon: BarChart3,
  },
];

function SectionBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,163,74,0.14)] bg-[#EAF9EF] px-4 py-2 text-sm font-semibold text-[#0F7A3A] shadow-[0_12px_30px_rgba(16,32,24,0.05)]">
      <Play size={14} className="fill-current" />
      Product Demo
    </div>
  );
}

function StatCard({ label, value, tone = "text-[#102018]" }) {
  return (
    <div className="rounded-2xl border border-[rgba(22,163,74,0.08)] bg-[rgba(250,247,240,0.92)] p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7A8A82]">
        {label}
      </p>
      <p className={["mt-1.5 text-[17px] font-extrabold leading-none", tone].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function StatusPill({ children, tone = "green" }) {
  const classes =
    tone === "green"
      ? "bg-[#EAF9EF] text-[#0F7A3A]"
      : "bg-[rgba(250,247,240,0.92)] text-[#5B6B63]";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold",
        classes,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function MonitorShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24, y: 12 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: easeOut }}
      className="relative mx-auto min-h-[360px] w-full max-w-full overflow-visible sm:min-h-[430px] sm:max-w-[560px] md:min-h-[500px] md:max-w-[680px] lg:mx-0 lg:min-h-[560px] lg:max-w-[760px] xl:min-h-[600px]"
    >
      <div className="pointer-events-none absolute left-[12%] top-[4%] hidden h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(22,163,74,0.10),rgba(234,249,239,0.14),transparent_72%)] blur-2xl sm:block lg:h-[320px] lg:w-[320px]" />
      <div className="pointer-events-none absolute left-[4%] top-[12%] hidden h-[90px] w-[90px] bg-[radial-gradient(circle,rgba(22,163,74,0.2)_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-20 lg:block" />
      <div className="pointer-events-none absolute left-[12%] bottom-[16%] hidden h-[84px] w-[110px] bg-[radial-gradient(circle,rgba(22,163,74,0.18)_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-20 lg:block" />

      <div className="relative mx-auto w-full max-w-[760px] pt-4 lg:mx-0">
        <div className="absolute bottom-[10px] left-1/2 -z-10 h-[26px] w-[26%] min-w-[120px] max-w-[210px] -translate-x-1/2 rounded-full bg-[rgba(16,32,24,0.10)] blur-[10px]" />

        <div className="relative w-full overflow-hidden rounded-[22px] border-[8px] border-[#1A211D] bg-[#1A211D] shadow-[0_24px_60px_rgba(15,122,58,0.10),0_14px_32px_rgba(16,32,24,0.10)] sm:rounded-[24px] sm:border-[9px] lg:rounded-[28px] lg:border-[10px] lg:shadow-[0_30px_80px_rgba(15,122,58,0.12),0_16px_38px_rgba(16,32,24,0.12)]">
          <div className="absolute inset-x-0 top-0 h-[10px] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent)] lg:h-[14px]" />

          <div className="m-[6px] overflow-hidden rounded-[16px] bg-[#FAF7F0] sm:m-[7px] sm:rounded-[18px] lg:m-[8px] lg:rounded-[20px]">
            <div className="aspect-[16/10] w-full">{children}</div>
          </div>
        </div>

        <div className="mx-auto h-[58px] w-[32px] rounded-b-[20px] rounded-t-[16px] bg-[linear-gradient(180deg,#E2E7E1_0%,#BCC6BD_100%)] shadow-[0_8px_16px_rgba(16,32,24,0.08),inset_0_1px_0_rgba(255,255,255,0.88)] sm:h-[66px] sm:w-[36px] lg:h-[78px] lg:w-[40px]" />
        <div className="mx-auto mt-[-8px] h-[18px] w-[32%] min-w-[120px] max-w-[208px] rounded-[999px] bg-[linear-gradient(180deg,#D3DCD3_0%,#AEB9B0_100%)] shadow-[0_10px_18px_rgba(16,32,24,0.12),inset_0_1px_0_rgba(255,255,255,0.82)] sm:h-[20px] lg:h-[22px]" />
      </div>
    </motion.div>
  );
}

function DashboardScreen() {
  const sidebarItems = [
    { label: "Dashboard", icon: Monitor, active: true },
    { label: "Queue", icon: Activity },
    { label: "Appointments", icon: CalendarDays },
    { label: "Patients", icon: Users },
    { label: "Services", icon: ClipboardList },
    { label: "Staff", icon: User },
    { label: "Settings", icon: Settings },
  ];

  const rows = [
    {
      token: "Q-016",
      patient: "Ahmed Raza",
      service: "General Consultation",
      time: "10:30 AM",
      active: true,
    },
    {
      token: "Q-017",
      patient: "Ayesha Khan",
      service: "General Consultation",
      time: "10:42 AM",
    },
    {
      token: "Q-018",
      patient: "Ali Hassan",
      service: "Follow-up",
      time: "10:50 AM",
    },
    {
      token: "Q-019",
      patient: "Fatima Noor",
      service: "General Consultation",
      time: "11:00 AM",
    },
  ];

  return (
    <div className="grid h-full grid-cols-1 sm:grid-cols-[96px_1fr] lg:grid-cols-[124px_1fr]">
      <div className="hidden border-r border-[rgba(22,163,74,0.08)] bg-white/70 px-2 py-3 sm:block lg:px-2.5">
        <div className="space-y-1.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={[
                  "flex items-center gap-2 rounded-2xl px-2 py-1.5 text-[11px] font-medium",
                  item.active ? "bg-[#EAF9EF] text-[#0F7A3A]" : "text-[#5B6B63]",
                ].join(" ")}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(22,163,74,0.08)] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-2xl bg-[#EAF9EF] text-[#16A34A]">
              <Activity size={14} />
            </span>
            <div>
              <p className="text-[13px] font-bold text-[#102018]">QueueCare</p>
              <p className="text-[10px] text-[#7A8A82]">Clinic operations</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-[12px]">
            <div className="rounded-full border border-[rgba(22,163,74,0.1)] bg-white/80 px-2.5 py-1 font-medium text-[#102018]">
              CarePlus Clinic
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#EAF9EF] px-2.5 py-1 font-semibold text-[#0F7A3A]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[#16A34A]">
                <User size={11} />
              </span>
              Dr. Ayesha Malik
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="text-[19px] font-bold tracking-tight text-[#102018]">
            Dashboard
          </h3>
          <p className="mt-1 text-[12px] text-[#5B6B63]">
            Real-time overview of today&apos;s queue
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
            <StatCard label="Now Serving" value="Q-016" tone="text-[#16A34A]" />
            <StatCard label="Waiting" value="15" />
            <StatCard label="Completed" value="17" />
            <StatCard label="Avg Wait Time" value="12 min" tone="text-[#16A34A]" />
          </div>

          <div className="mt-3 overflow-hidden rounded-[18px] border border-[rgba(22,163,74,0.08)] bg-white/82">
            <div className="grid grid-cols-[0.85fr_1.2fr_1fr] gap-2 border-b border-[rgba(22,163,74,0.08)] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7A8A82] sm:grid-cols-[0.8fr_1.1fr_0.95fr_0.9fr] lg:grid-cols-[0.8fr_1.15fr_1.15fr_0.85fr_0.95fr]">
              <span>Token</span>
              <span>Patient</span>
              <span>Status</span>
              <span className="hidden sm:block lg:hidden">Time</span>
              <span className="hidden lg:block">Service</span>
              <span className="hidden lg:block">Time</span>
            </div>

            <div className="divide-y divide-[rgba(22,163,74,0.06)]">
              {rows.slice(0, 3).map((row, index) => (
                <motion.div
                  key={row.token}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: easeOut, delay: index * 0.05 }}
                  className="grid grid-cols-[0.85fr_1.2fr_1fr] gap-2 px-3 py-2 text-[10px] text-[#102018] sm:grid-cols-[0.8fr_1.1fr_0.95fr_0.9fr] lg:grid-cols-[0.8fr_1.15fr_1.15fr_0.85fr_0.95fr]"
                >
                  <span className="font-bold">{row.token}</span>
                  <span>{row.patient}</span>
                  <span>
                    <StatusPill tone={row.active ? "green" : "muted"}>
                      {row.active ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                          In Progress
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-[#C3CCC6]" />
                          Waiting
                        </>
                      )}
                    </StatusPill>
                  </span>
                  <span className="hidden text-[#5B6B63] sm:block lg:hidden">{row.time}</span>
                  <span className="hidden text-[#5B6B63] lg:block">{row.service}</span>
                  <span className="hidden text-[#5B6B63] lg:block">{row.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[#16A34A] px-3.5 py-2 text-[11px] font-semibold text-white shadow-[0_18px_40px_rgba(22,163,74,0.22)]"
          >
            Mark Completed (Q-016)
            <CheckCircle2 size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function PatientAppScreen() {
  return (
    <div className="grid h-full place-items-center bg-[linear-gradient(180deg,#F8FBF8_0%,#F1F6F2_100%)] px-5 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-[620px] sm:origin-center sm:scale-[0.94] xl:scale-[0.98] 2xl:scale-100">
        <div className="grid w-full gap-3 md:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[28px] border border-[rgba(22,163,74,0.12)] bg-[#FCFDFC] p-4 shadow-[0_24px_60px_rgba(16,32,24,0.08)]">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-[rgba(16,32,24,0.10)]" />
            <div className="mt-4">
              <p className="text-[11px] text-[#7A8A82]">Good morning,</p>
              <p className="text-[18px] font-bold text-[#102018]">Ahmed Raza</p>
            </div>

            <div className="mt-4 rounded-[22px] bg-[#EAF9EF] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0F7A3A]">
                Appointment Confirmed
              </p>
              <p className="mt-2 text-[14px] font-bold text-[#102018]">
                Dr. Ayesha Malik
              </p>
              <p className="mt-1 text-[12px] text-[#5B6B63]">General Physician</p>
              <p className="mt-3 text-[12px] text-[#5B6B63]">24 May 2024 ? 10:30 AM</p>
              <p className="mt-1 text-[12px] text-[#5B6B63]">CarePlus Clinic</p>
            </div>

            <div className="mt-4 rounded-[22px] border border-[rgba(22,163,74,0.10)] bg-white p-4">
              <p className="text-[11px] font-semibold text-[#7A8A82]">Your Token</p>
              <p className="mt-2 text-[34px] font-extrabold leading-none text-[#16A34A]">
                Q-016
              </p>
              <div className="mt-3 flex items-center justify-between text-[12px]">
                <span className="text-[#5B6B63]">Estimated wait time</span>
                <span className="font-bold text-[#102018]">12 min</span>
              </div>
            </div>

            <div className="mt-3 rounded-[20px] bg-[rgba(234,249,239,0.72)] p-3">
              <p className="text-[13px] font-bold text-[#102018]">It&apos;s almost your turn!</p>
              <p className="mt-1 text-[12px] text-[#5B6B63]">Please be available.</p>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 rounded-[18px] bg-[rgba(16,32,24,0.04)] p-2 text-center text-[10px] font-semibold text-[#5B6B63]">
              {['Home', 'Appointments', 'Queue', 'Profile'].map((item, index) => (
                <div
                  key={item}
                  className={[
                    'rounded-[14px] px-2 py-2',
                    index === 0 ? 'bg-white text-[#16A34A] shadow-sm' : '',
                  ].join(' ')}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[24px] border border-[rgba(22,163,74,0.12)] bg-white/90 p-5 shadow-[0_20px_44px_rgba(16,32,24,0.06)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7A8A82]">
                Patient Journey
              </p>
              <div className="mt-3 space-y-2.5">
                {[
                  'Online booking in seconds',
                  'Instant token generation',
                  'Live wait time visibility',
                  'Turn alerts before arrival',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                    <span className="text-[13px] text-[#53645A]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Booking Status" value="Confirmed" tone="text-[#16A34A]" />
              <StatCard label="Current Token" value="Q-016" tone="text-[#16A34A]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const alerts = [
    {
      channel: "SMS Alert",
      message: "Ahmed Raza, your token Q-016 is next. Please proceed to Counter 3.",
      stamp: "Now",
    },
    {
      channel: "WhatsApp",
      message: "Your token Q-016 is now being served. Thank you!",
      stamp: "1 min ago",
    },
    {
      channel: "Reminder",
      message: "Appointment at 10:30 AM confirmed for Dr. Ayesha Malik.",
      stamp: "Scheduled",
    },
  ];

  return (
    <div className="h-full bg-[linear-gradient(180deg,#F7FBF8_0%,#EFF6F1_100%)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[22px] font-bold text-[#102018]">Turn Notifications</p>
          <p className="mt-1 text-[13px] text-[#5B6B63]">
            SMS and WhatsApp alerts that keep patients informed.
          </p>
        </div>
        <StatusPill tone="green">Live alerts</StatusPill>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Sent Today" value="128" tone="text-[#16A34A]" />
        <StatCard label="Delivered" value="97%" tone="text-[#16A34A]" />
        <StatCard label="No-Shows" value="-22%" tone="text-[#16A34A]" />
      </div>

      <div className="mt-5 space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.channel}
            className="rounded-[24px] border border-[rgba(22,163,74,0.12)] bg-white/92 p-4 shadow-[0_20px_44px_rgba(16,32,24,0.06)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF9EF] text-[#16A34A]">
                  <Bell size={18} />
                </span>
                <span className="text-[13px] font-bold text-[#102018]">{alert.channel}</span>
              </div>
              <span className="rounded-full bg-[#EAF9EF] px-2.5 py-1 text-[11px] font-semibold text-[#0F7A3A]">
                {alert.stamp}
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[#5B6B63]">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="h-full bg-[linear-gradient(180deg,#F9FBF8_0%,#F1F5F2_100%)] px-5 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-[680px] sm:origin-center sm:scale-[0.94] xl:scale-[0.98] 2xl:scale-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[22px] font-bold text-[#102018]">Queue Analytics</p>
            <p className="mt-1 text-[13px] text-[#5B6B63]">
              Insights to improve wait times and clinic flow.
            </p>
          </div>
          <StatusPill tone="green">Today</StatusPill>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Avg Wait" value="12 min" tone="text-[#16A34A]" />
          <StatCard label="Completed" value="17" />
          <StatCard label="Peak Hour" value="11 AM" />
          <StatCard label="Efficiency" value="94%" tone="text-[#16A34A]" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-[rgba(22,163,74,0.12)] bg-white/92 p-4 shadow-[0_20px_44px_rgba(16,32,24,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-bold text-[#102018]">Average Wait Trend</p>
              <span className="text-[12px] font-semibold text-[#16A34A]">-18% vs last week</span>
            </div>
            <svg viewBox="0 0 360 160" className="mt-4 h-[170px] w-full sm:h-[190px] lg:h-[180px]" aria-hidden="true">
              <defs>
                <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              {[20, 55, 90, 125].map((y) => (
                <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="rgba(16,32,24,0.08)" />
              ))}
              <path
                d="M0 120 C 30 108, 52 98, 78 88 C 106 76, 130 84, 160 66 C 192 46, 214 38, 244 48 C 272 56, 300 70, 330 62 C 342 58, 352 52, 360 48 L360 160 L0 160 Z"
                fill="url(#analyticsFill)"
              />
              <path
                d="M0 120 C 30 108, 52 98, 78 88 C 106 76, 130 84, 160 66 C 192 46, 214 38, 244 48 C 272 56, 300 70, 330 62 C 342 58, 352 52, 360 48"
                fill="none"
                stroke="#16A34A"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-[rgba(22,163,74,0.12)] bg-white/92 p-4 shadow-[0_20px_44px_rgba(16,32,24,0.06)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7A8A82]">
                Queue Insights
              </p>
              <div className="mt-4 space-y-3">
                {[
                  ['Busiest service', 'General Consultation'],
                  ['Fastest counter', 'Counter 3'],
                  ['Patient satisfaction', '92%'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-[#5B6B63]">{label}</span>
                    <span className="font-bold text-[#102018]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(22,163,74,0.12)] bg-[rgba(234,249,239,0.72)] p-4">
              <p className="text-[13px] font-bold text-[#102018]">Recommendation</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#5B6B63]">
                Add one more staff member during peak hour to reduce average wait by
                another 8?10%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainProductShowcase({ activeProduct }) {
  const renderMockup = () => {
    switch (activeProduct) {
      case "patientApp":
        return <PatientAppScreen />;
      case "notifications":
        return <NotificationsScreen />;
      case "analytics":
        return <AnalyticsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="relative w-full min-h-[420px] overflow-visible sm:min-h-[500px] lg:min-h-[560px] xl:min-h-[600px]">
      <MonitorShell>
        <AnimatePresence mode="wait">
        <motion.div
          key={activeProduct}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="relative h-full overflow-visible"
        >
            {renderMockup()}
          </motion.div>
        </AnimatePresence>
      </MonitorShell>
    </div>
  );
}

function DemoVideoCard() {
  const demoVideoSrc = "/WhatsApp%20Video%202026-04-29%20at%2011.25.19%20PM.mp4";

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: easeOut }}
      whileHover={{ y: -4 }}
      className="relative h-[220px] w-full max-w-full overflow-hidden rounded-[24px] border border-[rgba(22,163,74,0.12)] bg-[#102018] text-white shadow-[0_28px_70px_rgba(15,122,58,0.20)] sm:h-[240px] md:h-[260px] lg:h-[250px] lg:rounded-[28px] xl:h-[280px]"
    >
      <video
        className="h-full w-full object-cover"
        controls
        playsInline
        preload="metadata"
      >
        <source src={demoVideoSrc} type="video/mp4" />
        Your browser does not support the demo video.
      </video>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between bg-[linear-gradient(180deg,rgba(16,32,24,0.72),rgba(16,32,24,0.08),transparent)] p-5 sm:p-6 xl:p-7">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
          <Play size={13} className="fill-current" />
          QueueCare demo
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
          <Expand size={14} />
          Live preview
        </div>
      </div>
    </motion.div>
  );
}

function HowItWorksSteps() {
  const steps = [
    {
      number: "1",
      title: "Book appointment",
      text: "Patients book in seconds with real-time availability.",
      icon: CalendarDays,
    },
    {
      number: "2",
      title: "Track live queue",
      text: "Track your place in real time and estimated wait easily.",
      icon: PhoneCall,
    },
    {
      number: "3",
      title: "Get notified",
      text: "Receive alerts when it's your turn—so you never miss it.",
      icon: Bell,
    },
  ];

  return (
    <div className="relative mt-5 space-y-3">
      <div className="pointer-events-none absolute left-[21px] top-10 hidden h-[calc(100%-76px)] w-px bg-[linear-gradient(180deg,rgba(22,163,74,0.18),rgba(22,163,74,0.04))] md:block" />
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: easeOut, delay: index * 0.06 }}
            whileHover={{ y: -3 }}
            className="relative flex min-h-[88px] w-full items-start gap-4 rounded-[22px] border border-[rgba(22,163,74,0.12)] bg-white/92 px-4 py-4 shadow-[0_18px_44px_rgba(16,32,24,0.08)] sm:items-center sm:px-[22px] sm:py-[18px] md:min-h-[92px]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#16A34A] text-sm font-bold text-white sm:h-11 sm:w-11">
              {step.number}
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#EAF9EF] text-[#16A34A] sm:h-[46px] sm:w-[46px]">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold text-[#102018] md:text-[17px]">
                {step.title}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#5B6B63]">
                {step.text}
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-[#7A8A82]" />
          </motion.div>
        );
      })}
    </div>
  );
}

function ProductModeCards({ activeProduct, onSelect }) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-12 xl:mt-14 xl:grid-cols-4">
      {productOptions.map((card, index) => {
        const Icon = card.icon;
        const isActive = activeProduct === card.id;

        return (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: easeOut, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            className={[
              "relative min-h-[112px] rounded-[24px] border bg-white/92 px-5 py-5 text-left shadow-[0_20px_50px_rgba(16,32,24,0.08)] transition-colors sm:px-6 sm:py-[22px]",
              isActive
                ? "border-[#16A34A] bg-[linear-gradient(180deg,rgba(234,249,239,0.82),rgba(255,255,255,0.98))] shadow-[0_24px_54px_rgba(22,163,74,0.12)]"
                : "border-[rgba(22,163,74,0.12)]",
            ].join(" ")}
            aria-pressed={isActive}
          >
            {isActive ? (
              <motion.div
                layoutId="product-selector-active"
                className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-[rgba(22,163,74,0.16)]"
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              />
            ) : null}

            <div className="relative flex items-start justify-between gap-3">
              <div
                className={[
                  "grid h-[52px] w-[52px] place-items-center rounded-[18px]",
                  isActive ? "bg-[#16A34A] text-white" : "bg-[#EAF9EF] text-[#16A34A]",
                ].join(" ")}
              >
                <Icon size={20} />
              </div>
              <div className="flex items-center gap-2">
                {card.badge && isActive ? (
                  <span className="rounded-full bg-[#EAF9EF] px-2.5 py-1 text-[11px] font-semibold text-[#0F7A3A]">
                    {card.badge}
                  </span>
                ) : null}
                <ChevronRight size={18} className="text-[#7A8A82]" />
              </div>
            </div>

            <h3 className="relative mt-5 text-[18px] font-bold tracking-tight text-[#102018]">
              {card.title}
            </h3>
            <p className="relative mt-2 text-[14px] leading-relaxed text-[#5B6B63]">
              {card.subtitle}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

export default function ProductSection() {
  const [activeProduct, setActiveProduct] = useState("dashboard");

  return (
    <section
      id="product"
      className="relative overflow-hidden bg-[#FAF7F0] text-[#102018]"
    >
      <div className="mx-auto w-full max-w-[1500px] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10 lg:py-24 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: easeOut }}
          className="mx-auto max-w-[1000px] text-center"
        >
          <SectionBadge />
          <h2 className="mt-6 text-[34px] font-extrabold leading-[1.06] tracking-tight text-[#102018] sm:text-[42px] md:text-[48px] xl:text-[60px]">
            See <span className="text-[#16A34A]">QueueCare</span> working in real
            time
          </h2>
          <p className="mx-auto mt-5 max-w-[760px] text-[16px] leading-[1.75] text-[#5B6B63] md:text-[18px]">
            From booking to notification—experience a seamless queue management
            flow designed for modern clinics and happier patients.
          </p>
        </motion.div>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 xl:gap-14">
          <MainProductShowcase activeProduct={activeProduct} />

          <div className="w-full lg:pl-2">
            <DemoVideoCard />
            <HowItWorksSteps />
          </div>
        </div>

        <ProductModeCards
          activeProduct={activeProduct}
          onSelect={setActiveProduct}
        />
      </div>
    </section>
  );
}
