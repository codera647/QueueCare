"use client";

import type { PropsWithChildren, ReactNode } from "react";

export function PageContainer({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

export function SurfaceCard({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={[
        "rounded-3xl border border-[rgba(16,32,24,0.08)] bg-white shadow-[0_16px_40px_rgba(16,32,24,0.06)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-[#102018] sm:text-3xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="max-w-3xl text-sm leading-6 text-[#5B6B63] sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <SurfaceCard className="p-8 text-center">
      <div className="mx-auto max-w-xl space-y-3">
        <h2 className="text-xl font-semibold text-[#102018]">{title}</h2>
        <p className="text-sm leading-6 text-[#5B6B63]">{body}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </SurfaceCard>
  );
}
