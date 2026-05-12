"use client";

import * as React from "react";
import Link from "next/link";
import {
  createAppointment,
  generateAvailableSlots,
  subscribeClinics,
  subscribeDoctors,
  subscribeServices,
} from "../lib/repository";
import type {
  AvailableSlot,
  ClinicProfile,
  ClinicService,
  DoctorProfile,
} from "../lib/types";
import { useAuthSession } from "../context/auth-context";
import { EmptyState, PageContainer, SectionHeading, SurfaceCard } from "./ui";
import { RequireAuth } from "./route-guard";

export function PatientBookingScreen() {
  return (
    <RequireAuth audience="patient">
      <PatientBookingInner />
    </RequireAuth>
  );
}

function PatientBookingInner() {
  const { profile } = useAuthSession();
  const [clinics, setClinics] = React.useState<ClinicProfile[]>([]);
  const [doctors, setDoctors] = React.useState<DoctorProfile[]>([]);
  const [services, setServices] = React.useState<ClinicService[]>([]);
  const [slots, setSlots] = React.useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    clinicId: "",
    doctorId: "",
    serviceId: "",
    date: new Date().toISOString().slice(0, 10),
    slotValue: "",
    phone: "",
    notes: "",
  });

  React.useEffect(() => {
    if (!profile) return;
    setForm((current) => ({
      ...current,
      phone: current.phone || profile.phoneNumber || "",
    }));
  }, [profile]);

  React.useEffect(() => subscribeClinics(setClinics), []);

  React.useEffect(() => {
    if (!form.clinicId) {
      setDoctors([]);
      setServices([]);
      return;
    }
    const unsubDoctors = subscribeDoctors(form.clinicId, (items) => {
      setDoctors(items.filter((item) => item.isActive));
    });
    const unsubServices = subscribeServices(form.clinicId, (items) => {
      setServices(items.filter((item) => item.isActive));
    });
    return () => {
      unsubDoctors();
      unsubServices();
    };
  }, [form.clinicId]);

  const selectedClinic = clinics.find((item) => item.id === form.clinicId) ?? null;
  const selectedDoctor = doctors.find((item) => item.id === form.doctorId) ?? null;
  const selectedService = services.find((item) => item.id === form.serviceId) ?? null;

  React.useEffect(() => {
    if (!selectedClinic || !selectedDoctor || !selectedService || !form.date) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setError(null);
    generateAvailableSlots({
      clinicId: selectedClinic.id,
      doctor: selectedDoctor,
      service: selectedService,
      date: new Date(`${form.date}T00:00:00`),
    })
      .then((items) => setSlots(items))
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load available slots."),
      )
      .finally(() => setLoadingSlots(false));
  }, [form.date, selectedClinic, selectedDoctor, selectedService]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!profile || !selectedClinic || !selectedDoctor || !selectedService) return;
    const selectedSlot = slots.find((item) => item.value === form.slotValue);
    if (!selectedSlot) {
      setError("Please choose an available slot.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await createAppointment(profile.uid, {
        clinicId: selectedClinic.id,
        clinicName: selectedClinic.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.displayName,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        patientName: profile.displayName,
        patientPhone: form.phone.trim(),
        scheduledAt: selectedSlot.startsAt,
        notes: form.notes.trim() || undefined,
      });
      setSuccess("Appointment booked successfully.");
      setForm((current) => ({ ...current, slotValue: "", notes: "" }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create appointment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <SectionHeading
          title="Book an appointment"
          subtitle={`Today is ${new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(new Date())}. Choose a clinic, doctor, service, date, and one generated slot based on live availability.`}
        />

        {clinics.length === 0 ? (
          <EmptyState
            title="No clinics are available yet"
            body="Ask your clinic team to finish clinic setup first, then you’ll be able to book live slots here."
          />
        ) : (
          <SurfaceCard className="p-6">
            <form className="grid gap-4 lg:grid-cols-2" onSubmit={submit}>
              <SelectField
                label="Clinic"
                value={form.clinicId}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    clinicId: value,
                    doctorId: "",
                    serviceId: "",
                    slotValue: "",
                  }))
                }
                options={clinics.map((item) => ({ value: item.id, label: item.name }))}
              />
              <SelectField
                label="Doctor"
                value={form.doctorId}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, doctorId: value, slotValue: "" }))
                }
                options={doctors.map((item) => ({
                  value: item.id,
                  label: `${item.displayName} - ${item.specialty}`,
                }))}
                disabled={!form.clinicId}
              />
              <SelectField
                label="Service"
                value={form.serviceId}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, serviceId: value, slotValue: "" }))
                }
                options={services.map((item) => ({
                  value: item.id,
                  label: `${item.name} - ${item.durationMinutes} min`,
                }))}
                disabled={!form.clinicId}
              />
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#102018]">Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, date: event.target.value, slotValue: "" }))
                  }
                  className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                />
              </label>
              <SelectField
                label="Available slot"
                value={form.slotValue}
                onChange={(value) => setForm((prev) => ({ ...prev, slotValue: value }))}
                options={slots.map((item) => ({ value: item.value, label: item.label }))}
                disabled={!selectedDoctor || !selectedService || loadingSlots}
                helper={
                  loadingSlots
                    ? "Loading available slots..."
                    : "Only real available slots for the selected date are shown."
                }
              />
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#102018]">Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                />
                <span className="text-xs text-[#5B6B63]">
                  Use 10 to 15 digits. Spaces, dashes, and brackets are okay.
                </span>
              </label>
              <label className="block space-y-2 lg:col-span-2">
                <span className="text-sm font-semibold text-[#102018]">Notes (optional)</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                />
              </label>

              {error ? (
                <p className="rounded-2xl bg-[#FFF1F1] px-4 py-3 text-sm font-medium text-[#B42318] lg:col-span-2">
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="rounded-2xl bg-[#EAF9EF] px-4 py-3 text-sm font-medium text-[#0F7A3A] lg:col-span-2">
                  {success}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3 lg:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Booking..." : "Book appointment"}
                </button>
                <Link
                  href="/app/patient"
                  className="rounded-2xl border border-[rgba(16,32,24,0.08)] px-5 py-3 text-sm font-semibold text-[#102018]"
                >
                  Back to dashboard
                </Link>
              </div>
            </form>
          </SurfaceCard>
        )}
      </div>
    </PageContainer>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  helper?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#102018]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A] disabled:bg-[#F7FAF8]"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helper ? <span className="text-xs text-[#5B6B63]">{helper}</span> : null}
    </label>
  );
}
