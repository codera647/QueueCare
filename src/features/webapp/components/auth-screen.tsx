"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfigRequiredScreen } from "./config-required";
import { PageContainer, SectionHeading, SurfaceCard } from "./ui";
import { firebaseWebConfigured } from "../lib/firebase";
import { loginWithEmail, loginWithGoogle, registerWithEmail } from "../lib/repository";
import type { UserRole } from "../lib/types";

const passwordHint =
  "Use at least 8 characters with uppercase, lowercase, and a number.";
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function AuthScreen({
  audience,
  mode,
}: {
  audience: "patient" | "clinic";
  mode: "login" | "register";
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    clinicName: "",
  });

  if (!firebaseWebConfigured) {
    return <ConfigRequiredScreen />;
  }

  const role: UserRole = audience === "patient" ? "patient" : "clinicAdmin";
  const isRegister = mode === "register";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (isRegister && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordPattern.test(form.password)) {
      setError(passwordHint);
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail({
          email: form.email.trim(),
          password: form.password,
          displayName: form.displayName.trim(),
          role,
          clinicName: audience === "clinic" ? form.clinicName.trim() : undefined,
        });
        router.replace("/app/auth/verify-email");
      } else {
        const credential = await loginWithEmail(form.email.trim(), form.password, audience);
        const nextPath = role === "patient" ? "/app/patient" : "/app/clinic";
        if (
          credential.user.providerData.some((item) => item.providerId === "password") &&
          !credential.user.emailVerified
        ) {
          router.replace("/app/auth/verify-email");
          return;
        }
        router.replace(nextPath);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function continueWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(role, audience);
      router.replace(role === "patient" ? "/app/patient" : "/app/clinic");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="flex min-h-[100svh] items-center py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="inline-flex rounded-full bg-[#EAF9EF] px-4 py-2 text-sm font-semibold text-[#0F7A3A]">
              {audience === "patient" ? "Patient account" : "Clinic account"}
            </div>
            <SectionHeading
              title={isRegister ? "Create your QueueCare account" : "Sign in to QueueCare"}
              subtitle={
                audience === "patient"
                  ? "Patients can book appointments, follow live queue status, and manage upcoming visits."
                  : "Clinic users can manage doctors, appointments, walk-ins, and daily queue operations."
              }
            />
          </div>

          <SurfaceCard className="p-6 sm:p-8">
            <form className="space-y-4" onSubmit={submit}>
              {isRegister ? (
                <Field
                  label="Full name"
                  value={form.displayName}
                  onChange={(value) => setForm((prev) => ({ ...prev, displayName: value }))}
                />
              ) : null}
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
              />
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                minLength={8}
                pattern={passwordPattern.source}
                helper={passwordHint}
              />
              {isRegister ? (
                <Field
                  label="Confirm password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(value) => setForm((prev) => ({ ...prev, confirmPassword: value }))}
                  minLength={8}
                />
              ) : null}
              {isRegister && audience === "clinic" ? (
                <Field
                  label="Clinic name"
                  value={form.clinicName}
                  onChange={(value) => setForm((prev) => ({ ...prev, clinicName: value }))}
                />
              ) : null}

              {error ? (
                <p className="rounded-2xl bg-[#FFF1F1] px-4 py-3 text-sm font-medium text-[#B42318]">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
              </button>

              <button
                type="button"
                onClick={continueWithGoogle}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[rgba(16,32,24,0.08)] bg-white px-4 py-3 text-sm font-semibold text-[#102018] disabled:opacity-60"
              >
                Continue with Google
              </button>

              {!isRegister ? (
                <div className="text-right">
                  <Link
                    href={`/app/auth/forgot-password/${audience}`}
                    className="text-sm font-semibold text-[#0F7A3A]"
                  >
                    Forgot password?
                  </Link>
                </div>
              ) : null}

              <div className="border-t border-[rgba(16,32,24,0.08)] pt-4 text-sm text-[#5B6B63]">
                {isRegister ? "Already have an account?" : "Need an account?"}{" "}
                <Link
                  href={isRegister ? `/app/auth/login/${audience}` : `/app/auth/register/${audience}`}
                  className="font-semibold text-[#0F7A3A]"
                >
                  {isRegister ? "Sign in" : "Register"}
                </Link>
              </div>
            </form>
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  minLength,
  pattern,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  minLength?: number;
  pattern?: string;
  helper?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#102018]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={minLength}
        pattern={pattern}
        className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm text-[#102018] outline-none ring-0 transition focus:border-[#16A34A]"
      />
      {helper ? <span className="text-xs text-[#5B6B63]">{helper}</span> : null}
    </label>
  );
}
