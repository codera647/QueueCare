"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthSession } from "../context/auth-context";
import { useNotificationCenter } from "../context/notification-context";
import {
  updatePatientNotificationPreferences,
  updatePatientProfile,
} from "../lib/repository";
import { EmptyState, PageContainer, SectionHeading, SurfaceCard } from "./ui";
import { RequireAuth } from "./route-guard";

export function PatientSettingsScreen() {
  return (
    <RequireAuth audience="patient">
      <PatientSettingsInner />
    </RequireAuth>
  );
}

function PatientSettingsInner() {
  const { profile } = useAuthSession();
  const notificationCenter = useNotificationCenter();
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [profileForm, setProfileForm] = React.useState({
    displayName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [preferenceForm, setPreferenceForm] = React.useState({
    notificationsEnabled: false,
    nearAppointmentAlertsEnabled: true,
    appointmentTimeAlertsEnabled: true,
  });

  React.useEffect(() => {
    if (!profile) return;
    setProfileForm({
      displayName: profile.displayName ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      gender: profile.gender ?? "",
      emergencyContactName: profile.emergencyContactName ?? "",
      emergencyContactPhone: profile.emergencyContactPhone ?? "",
    });
    setPreferenceForm({
      notificationsEnabled: profile.notificationsEnabled ?? false,
      nearAppointmentAlertsEnabled: profile.nearAppointmentAlertsEnabled ?? true,
      appointmentTimeAlertsEnabled: profile.appointmentTimeAlertsEnabled ?? true,
    });
  }, [profile]);

  if (!profile) {
    return (
      <PageContainer>
        <EmptyState
          title="Patient profile is missing"
          body="Please sign in again to update your patient settings."
        />
      </PageContainer>
    );
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSavingProfile(true);
      setError(null);
      setMessage(null);
      await updatePatientProfile(profile.uid, profileForm);
      setMessage("Patient profile saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save patient profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePreferences = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSavingPrefs(true);
      setError(null);
      setMessage(null);
      await updatePatientNotificationPreferences(profile.uid, preferenceForm);
      setMessage("Notification preferences saved.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to save notification preferences.",
      );
    } finally {
      setSavingPrefs(false);
    }
  };

  const enableBrowserNotifications = async () => {
    const granted = await notificationCenter.requestPermission();
    if (granted) {
      setPreferenceForm((current) => ({ ...current, notificationsEnabled: true }));
      setMessage("Browser notifications are enabled. Save preferences to keep this setting.");
      setError(null);
    } else {
      setError("Browser notification permission was not granted.");
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeading
            title="Patient settings"
            subtitle="Keep your phone number and care details up to date, and choose how QueueCare should notify you."
          />
          <Link
            href="/app/patient"
            className="rounded-2xl border border-[rgba(16,32,24,0.08)] px-5 py-3 text-sm font-semibold text-[#102018]"
          >
            Back to dashboard
          </Link>
        </div>

        {message ? (
          <p className="rounded-2xl bg-[#EAF9EF] px-4 py-3 text-sm font-medium text-[#0F7A3A]">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-2xl bg-[#FFF1F1] px-4 py-3 text-sm font-medium text-[#B42318]">
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <SurfaceCard className="p-6">
            <h2 className="text-lg font-semibold text-[#102018]">Profile</h2>
            <form className="mt-4 space-y-4" onSubmit={saveProfile}>
              <Field
                label="Full name"
                value={profileForm.displayName}
                onChange={(value) =>
                  setProfileForm((current) => ({ ...current, displayName: value }))
                }
              />
              <Field
                label="Phone number"
                type="tel"
                value={profileForm.phoneNumber}
                onChange={(value) =>
                  setProfileForm((current) => ({ ...current, phoneNumber: value }))
                }
                helper="Use 10 to 15 digits. Spaces, dashes, and brackets are okay."
              />
              <Field
                label="Date of birth"
                type="date"
                value={profileForm.dateOfBirth}
                onChange={(value) =>
                  setProfileForm((current) => ({ ...current, dateOfBirth: value }))
                }
              />
              <SelectField
                label="Gender"
                value={profileForm.gender}
                onChange={(value) =>
                  setProfileForm((current) => ({ ...current, gender: value }))
                }
                options={[
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                  { value: "other", label: "Other" },
                  { value: "prefer_not_to_say", label: "Prefer not to say" },
                ]}
              />
              <Field
                label="Emergency contact name"
                value={profileForm.emergencyContactName}
                onChange={(value) =>
                  setProfileForm((current) => ({
                    ...current,
                    emergencyContactName: value,
                  }))
                }
              />
              <Field
                label="Emergency contact phone"
                type="tel"
                value={profileForm.emergencyContactPhone}
                onChange={(value) =>
                  setProfileForm((current) => ({
                    ...current,
                    emergencyContactPhone: value,
                  }))
                }
                helper="Use 10 to 15 digits. Spaces, dashes, and brackets are okay."
              />
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
            </form>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <h2 className="text-lg font-semibold text-[#102018]">Notifications</h2>
            <div className="mt-4 rounded-2xl bg-[#F7FAF8] p-4 text-sm text-[#4B5B52]">
              Browser permission:{" "}
              <span className="font-semibold text-[#102018]">
                {notificationCenter.permission}
              </span>
            </div>
            <form className="mt-4 space-y-4" onSubmit={savePreferences}>
              <ToggleRow
                label="Enable browser notifications"
                checked={preferenceForm.notificationsEnabled}
                onChange={(checked) =>
                  setPreferenceForm((current) => ({
                    ...current,
                    notificationsEnabled: checked,
                  }))
                }
              />
              <ToggleRow
                label="15-minute reminder"
                checked={preferenceForm.nearAppointmentAlertsEnabled}
                onChange={(checked) =>
                  setPreferenceForm((current) => ({
                    ...current,
                    nearAppointmentAlertsEnabled: checked,
                  }))
                }
              />
              <ToggleRow
                label="Appointment-time alert"
                checked={preferenceForm.appointmentTimeAlertsEnabled}
                onChange={(checked) =>
                  setPreferenceForm((current) => ({
                    ...current,
                    appointmentTimeAlertsEnabled: checked,
                  }))
                }
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingPrefs ? "Saving..." : "Save notification preferences"}
                </button>
                <button
                  type="button"
                  onClick={enableBrowserNotifications}
                  disabled={!notificationCenter.supported}
                  className="rounded-2xl border border-[rgba(16,32,24,0.08)] px-5 py-3 text-sm font-semibold text-[#102018] disabled:opacity-60"
                >
                  Request browser permission
                </button>
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
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
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
        inputMode={type === "tel" ? "tel" : undefined}
        autoComplete={type === "tel" ? "tel" : undefined}
        maxLength={type === "tel" ? 20 : undefined}
        className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
      />
      {helper ? <span className="text-xs text-[#5B6B63]">{helper}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#102018]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl bg-[#F7FAF8] px-4 py-3">
      <span className="text-sm font-semibold text-[#102018]">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5"
      />
    </label>
  );
}
