"use client";

import * as React from "react";
import Link from "next/link";
import { ConfigRequiredScreen } from "./config-required";
import { PageContainer, SectionHeading, SurfaceCard } from "./ui";
import { firebaseWebConfigured } from "../lib/firebase";
import { resetPassword } from "../lib/repository";

export function ForgotPasswordScreen({
  audience,
}: {
  audience: "patient" | "clinic";
}) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  if (!firebaseWebConfigured) {
    return <ConfigRequiredScreen />;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resetPassword(email.trim());
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send reset email.");
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
              title="Reset your password"
              subtitle={`Enter the email for your ${audience} account and we’ll send a reset link.`}
            />
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#102018]">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                />
              </label>

              {message ? (
                <p className="rounded-2xl bg-[#EAF9EF] px-4 py-3 text-sm font-medium text-[#0F7A3A]">{message}</p>
              ) : null}
              {error ? (
                <p className="rounded-2xl bg-[#FFF1F1] px-4 py-3 text-sm font-medium text-[#B42318]">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset email"}
              </button>
              <Link href={`/app/auth/login/${audience}`} className="inline-flex text-sm font-semibold text-[#0F7A3A]">
                Back to sign in
              </Link>
            </form>
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}
