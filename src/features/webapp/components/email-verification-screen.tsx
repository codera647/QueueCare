"use client";

import { useRouter } from "next/navigation";
import { PageContainer, SectionHeading, SurfaceCard } from "./ui";
import { useAuthSession } from "../context/auth-context";
import { reloadCurrentUser, resendVerificationEmail } from "../lib/repository";
import * as React from "react";

export function EmailVerificationScreen() {
  const router = useRouter();
  const { user } = useAuthSession();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function confirmVerified() {
    setLoading(true);
    setMessage(null);
    try {
      const refreshed = await reloadCurrentUser();
      if (refreshed?.emailVerified) {
        router.replace("/app");
        return;
      }
      setMessage("Your email is not verified yet. Please verify first and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setLoading(true);
    setMessage(null);
    try {
      await resendVerificationEmail();
      setMessage("Verification email sent again.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to resend email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="flex min-h-[100svh] items-center py-10">
        <div className="mx-auto w-full max-w-2xl">
          <SurfaceCard className="p-6 sm:p-8">
            <SectionHeading
              title="Verify your email"
              subtitle={`We sent a verification link to ${user?.email ?? "your email"}. Verify it before continuing into QueueCare.`}
            />
            <div className="mt-6 space-y-4">
              {message ? (
                <p className="rounded-2xl bg-[#F3F7F4] px-4 py-3 text-sm font-medium text-[#102018]">{message}</p>
              ) : null}
              <button
                type="button"
                onClick={confirmVerified}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Checking..." : "I have verified my email"}
              </button>
              <button
                type="button"
                onClick={resend}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[rgba(16,32,24,0.08)] bg-white px-4 py-3 text-sm font-semibold"
              >
                Resend verification email
              </button>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}
