"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Building2, UserRound } from "lucide-react";
import { PageContainer, SectionHeading, SurfaceCard } from "./ui";

export function RoleEntryScreen() {
  return (
    <PageContainer>
      <div className="flex min-h-[calc(100svh-120px)] items-center py-8">
        <div className="grid w-full gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="inline-flex items-center rounded-full bg-[#EAF9EF] px-4 py-2 text-sm font-semibold text-[#0F7A3A]">
              QueueCare product app
            </div>
            <SectionHeading
              title="Choose your QueueCare account"
              subtitle="Start with the right experience. Patients can book and track appointments, while clinic users can manage live queues, doctors, and daily availability."
            />
          </div>

          <div className="grid gap-4">
            <RoleCard
              icon={<UserRound className="h-6 w-6 text-[#16A34A]" />}
              title="Patient"
              subtitle="Book appointments, view live wait times, and follow your queue status."
              primaryHref="/app/auth/register/patient"
              primaryLabel="Continue as patient"
              secondaryHref="/app/auth/login/patient"
              secondaryLabel="Patient sign in"
            />
            <RoleCard
              icon={<Building2 className="h-6 w-6 text-[#16A34A]" />}
              title="Clinic"
              subtitle="Manage doctors, appointments, walk-ins, and day-of queue operations."
              primaryHref="/app/auth/register/clinic"
              primaryLabel="Continue as clinic"
              secondaryHref="/app/auth/login/clinic"
              secondaryLabel="Clinic sign in"
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function RoleCard({
  icon,
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <SurfaceCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF9EF]">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#102018]">{title}</h2>
            <p className="text-sm text-[#5B6B63]">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-2xl border border-[rgba(22,163,74,0.18)] px-5 py-3 text-sm font-semibold text-[#0F7A3A]"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </SurfaceCard>
  );
}
