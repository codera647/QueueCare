"use client";

import * as React from "react";
import Link from "next/link";
import { fetchClinic, saveAvailabilityRules, subscribeAvailability, subscribeDoctors, subscribeServices, upsertClinic, upsertDoctor, upsertService, updateQueueDay } from "../lib/repository";
import type { ClinicService, DoctorAvailabilityRule, DoctorProfile, QueueDayStatus } from "../lib/types";
import { SPECIALTY_SUGGESTIONS, SERVICE_SUGGESTIONS } from "../lib/constants";
import { availabilityDocId, formatDate, formatTimeFromMinutes, slugify } from "../lib/utils";
import { useAuthSession } from "../context/auth-context";
import { EmptyState, PageContainer, SectionHeading, SurfaceCard } from "./ui";
import { RequireAuth } from "./route-guard";

const weekdays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export function ClinicSettingsScreen() {
  return (
    <RequireAuth audience="clinic">
      <ClinicSettingsInner />
    </RequireAuth>
  );
}

function ClinicSettingsInner() {
  const { profile } = useAuthSession();
  const clinicId = profile?.clinicId ?? null;
  const [doctors, setDoctors] = React.useState<DoctorProfile[]>([]);
  const [services, setServices] = React.useState<ClinicService[]>([]);
  const [availabilityRules, setAvailabilityRules] = React.useState<DoctorAvailabilityRule[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [clinicForm, setClinicForm] = React.useState({
    name: "",
    phone: "",
    address: "",
    timezone: "Asia/Karachi",
    lateCancelCutoffMinutes: 5,
    missedBookingBlockDays: 3,
    allowWalkIns: true,
  });
  const [doctorForm, setDoctorForm] = React.useState({
    displayName: "",
    specialty: "",
    defaultSlotMinutes: 15,
  });
  const [serviceForm, setServiceForm] = React.useState({
    name: "",
    durationMinutes: 15,
  });
  const [availabilityForm, setAvailabilityForm] = React.useState({
    weekdays: [1, 2, 3, 4, 5] as number[],
    startTime: "08:00",
    endTime: "17:00",
  });
  const [dailyOverride, setDailyOverride] = React.useState({
    date: new Date().toISOString().slice(0, 10),
    scheduledStartTime: "08:00",
    actualStartTime: "08:00",
    status: "scheduled" as QueueDayStatus,
    delayReason: "",
  });

  React.useEffect(() => {
    if (!clinicId) return;
    fetchClinic(clinicId).then((item) => {
      if (item) {
        setClinicForm({
          name: item.name,
          phone: item.phone,
          address: item.address,
          timezone: item.timezone,
          lateCancelCutoffMinutes: item.lateCancelCutoffMinutes,
          missedBookingBlockDays: item.missedBookingBlockDays,
          allowWalkIns: item.allowWalkIns,
        });
      }
    });
    const unsubDoctors = subscribeDoctors(clinicId, (items) => {
      setDoctors(items);
      setSelectedDoctorId((current) => current || items[0]?.id || "");
    });
    const unsubServices = subscribeServices(clinicId, setServices);
    return () => {
      unsubDoctors();
      unsubServices();
    };
  }, [clinicId]);

  React.useEffect(() => {
    if (!clinicId || !selectedDoctorId) {
      setAvailabilityRules([]);
      return;
    }
    return subscribeAvailability(clinicId, selectedDoctorId, setAvailabilityRules);
  }, [clinicId, selectedDoctorId]);

  const selectedDoctor = doctors.find((item) => item.id === selectedDoctorId) ?? null;

  if (!clinicId) {
    return (
      <PageContainer>
        <EmptyState title="Clinic profile is missing" body="This account does not have a clinic attached yet." />
      </PageContainer>
    );
  }

  const saveClinic = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await upsertClinic({
        id: clinicId,
        ...clinicForm,
      });
      setMessage("Clinic profile saved.");
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save clinic profile.");
    }
  };

  const saveDoctor = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const id = `${clinicId}_${slugify(doctorForm.displayName)}`;
      await upsertDoctor({
        id,
        clinicId,
        displayName: doctorForm.displayName.trim(),
        specialty: doctorForm.specialty.trim(),
        isActive: true,
        defaultSlotMinutes: Number(doctorForm.defaultSlotMinutes) || 15,
      });
      setDoctorForm({ displayName: "", specialty: "", defaultSlotMinutes: 15 });
      setMessage("Doctor saved.");
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save doctor.");
    }
  };

  const saveService = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const id = `${clinicId}_${slugify(serviceForm.name)}`;
      await upsertService({
        id,
        clinicId,
        name: serviceForm.name.trim(),
        durationMinutes: Number(serviceForm.durationMinutes) || 15,
        isActive: true,
      });
      setServiceForm({ name: "", durationMinutes: 15 });
      setMessage("Service saved.");
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save service.");
    }
  };

  const saveAvailability = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDoctor) return;
    try {
      const [startHour, startMinute] = availabilityForm.startTime.split(":").map(Number);
      const [endHour, endMinute] = availabilityForm.endTime.split(":").map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      const rules: DoctorAvailabilityRule[] = availabilityForm.weekdays.map((weekday) => ({
        id: availabilityDocId(clinicId, selectedDoctor.id, weekday),
        clinicId,
        doctorId: selectedDoctor.id,
        weekday,
        startTimeMinutes,
        endTimeMinutes,
        isAvailable: true,
      }));
      await saveAvailabilityRules(clinicId, selectedDoctor.id, rules);
      setMessage("Weekly availability saved.");
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save availability.");
    }
  };

  const saveDailyOverride = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDoctor) return;
    try {
      const date = new Date(`${dailyOverride.date}T00:00:00`);
      const scheduled = new Date(`${dailyOverride.date}T${dailyOverride.scheduledStartTime}:00`);
      const actual = new Date(`${dailyOverride.date}T${dailyOverride.actualStartTime}:00`);
      await updateQueueDay({
        clinicId,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.displayName,
        date,
        scheduledStartTime: scheduled,
        actualStartTime: actual,
        status: dailyOverride.status,
        delayReason: dailyOverride.delayReason,
      });
      setMessage(`Daily override saved for ${formatDate(date)}.`);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save daily override.");
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeading
            title="Clinic settings"
            subtitle="Manage clinic profile, doctors, services, weekly availability, queue rules, and daily queue overrides."
          />
          <Link href="/app/clinic" className="rounded-2xl border border-[rgba(16,32,24,0.08)] px-5 py-3 text-sm font-semibold text-[#102018]">
            Back to dashboard
          </Link>
        </div>

        {message ? <p className="rounded-2xl bg-[#EAF9EF] px-4 py-3 text-sm font-medium text-[#0F7A3A]">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-[#FFF1F1] px-4 py-3 text-sm font-medium text-[#B42318]">{error}</p> : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <SurfaceCard className="p-5">
            <h2 className="text-lg font-semibold text-[#102018]">Clinic profile</h2>
            <form className="mt-4 space-y-4" onSubmit={saveClinic}>
              <Field label="Clinic name" value={clinicForm.name} onChange={(value) => setClinicForm((prev) => ({ ...prev, name: value }))} />
              <Field
                label="Phone"
                value={clinicForm.phone}
                onChange={(value) => setClinicForm((prev) => ({ ...prev, phone: value }))}
                type="tel"
                pattern="^\\+?[0-9]{10,15}$"
                helper="Use 10 to 15 digits, with an optional leading +."
              />
              <Field label="Address" value={clinicForm.address} onChange={(value) => setClinicForm((prev) => ({ ...prev, address: value }))} />
              <Field label="Timezone" value={clinicForm.timezone} onChange={(value) => setClinicForm((prev) => ({ ...prev, timezone: value }))} />
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField label="Late cancel cutoff (min)" value={clinicForm.lateCancelCutoffMinutes} onChange={(value) => setClinicForm((prev) => ({ ...prev, lateCancelCutoffMinutes: value }))} />
                <NumberField label="Missed-booking block (days)" value={clinicForm.missedBookingBlockDays} onChange={(value) => setClinicForm((prev) => ({ ...prev, missedBookingBlockDays: value }))} />
              </div>
              <label className="flex items-center gap-3 text-sm font-semibold text-[#102018]">
                <input type="checkbox" checked={clinicForm.allowWalkIns} onChange={(event) => setClinicForm((prev) => ({ ...prev, allowWalkIns: event.target.checked }))} />
                Allow walk-ins
              </label>
              <button type="submit" className="rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white">Save clinic profile</button>
            </form>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <h2 className="text-lg font-semibold text-[#102018]">Add doctor</h2>
            <form className="mt-4 space-y-4" onSubmit={saveDoctor}>
              <Field label="Doctor name" value={doctorForm.displayName} onChange={(value) => setDoctorForm((prev) => ({ ...prev, displayName: value }))} />
              <DatalistField label="Specialty" value={doctorForm.specialty} onChange={(value) => setDoctorForm((prev) => ({ ...prev, specialty: value }))} listId="specialty-options" options={SPECIALTY_SUGGESTIONS} />
              <NumberField label="Default slot minutes" value={doctorForm.defaultSlotMinutes} onChange={(value) => setDoctorForm((prev) => ({ ...prev, defaultSlotMinutes: value }))} />
              <button type="submit" className="rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white">Save doctor</button>
            </form>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <h2 className="text-lg font-semibold text-[#102018]">Add service</h2>
            <form className="mt-4 space-y-4" onSubmit={saveService}>
              <DatalistField label="Service name" value={serviceForm.name} onChange={(value) => setServiceForm((prev) => ({ ...prev, name: value }))} listId="service-options" options={SERVICE_SUGGESTIONS} />
              <NumberField label="Duration minutes" value={serviceForm.durationMinutes} onChange={(value) => setServiceForm((prev) => ({ ...prev, durationMinutes: value }))} />
              <button type="submit" className="rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white">Save service</button>
            </form>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <h2 className="text-lg font-semibold text-[#102018]">Doctor availability</h2>
            {doctors.length === 0 ? (
              <p className="mt-4 text-sm text-[#5B6B63]">Add a doctor first to set weekly availability.</p>
            ) : (
              <form className="mt-4 space-y-4" onSubmit={saveAvailability}>
                <select value={selectedDoctorId} onChange={(event) => setSelectedDoctorId(event.target.value)} className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm">
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>{doctor.displayName}</option>
                  ))}
                </select>
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#102018]">Apply this rule to multiple days</p>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map((day) => {
                      const active = availabilityForm.weekdays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() =>
                            setAvailabilityForm((prev) => ({
                              ...prev,
                              weekdays: active
                                ? prev.weekdays.filter((item) => item !== day.value)
                                : [...prev.weekdays, day.value].sort(),
                            }))
                          }
                          className={[
                            "rounded-full px-3 py-2 text-sm font-semibold",
                            active ? "bg-[#EAF9EF] text-[#0F7A3A]" : "bg-[#F3F7F4] text-[#4B5B52]",
                          ].join(" ")}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Start time" type="time" value={availabilityForm.startTime} onChange={(value) => setAvailabilityForm((prev) => ({ ...prev, startTime: value }))} />
                  <Field label="End time" type="time" value={availabilityForm.endTime} onChange={(value) => setAvailabilityForm((prev) => ({ ...prev, endTime: value }))} />
                </div>
                <button type="submit" className="rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white">Save weekly rule</button>
                {availabilityRules.length > 0 ? (
                  <div className="rounded-2xl bg-[#F7FAF8] p-4">
                    <p className="text-sm font-semibold text-[#102018]">Saved weekly rules</p>
                    <div className="mt-3 space-y-2">
                      {availabilityRules.map((rule) => (
                        <div key={rule.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-[#4B5B52]">
                          <span className="font-semibold text-[#102018]">
                            {weekdays.find((day) => day.value === rule.weekday)?.label ?? "Day"}
                          </span>
                          {` • ${formatTimeFromMinutes(rule.startTimeMinutes)} to ${formatTimeFromMinutes(rule.endTimeMinutes)}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </form>
            )}
          </SurfaceCard>
        </div>

        <SurfaceCard className="p-5">
          <h2 className="text-lg font-semibold text-[#102018]">Today / single-day override</h2>
          {doctors.length === 0 ? (
            <p className="mt-4 text-sm text-[#5B6B63]">Add a doctor first to adjust same-day timing.</p>
          ) : (
            <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={saveDailyOverride}>
              <select value={selectedDoctorId} onChange={(event) => setSelectedDoctorId(event.target.value)} className="rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm">
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.displayName}</option>
                ))}
              </select>
              <Field label="Date" type="date" value={dailyOverride.date} onChange={(value) => setDailyOverride((prev) => ({ ...prev, date: value }))} />
              <Field label="Scheduled start" type="time" value={dailyOverride.scheduledStartTime} onChange={(value) => setDailyOverride((prev) => ({ ...prev, scheduledStartTime: value }))} />
              <Field label="Actual start" type="time" value={dailyOverride.actualStartTime} onChange={(value) => setDailyOverride((prev) => ({ ...prev, actualStartTime: value }))} />
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#102018]">Queue status</span>
                <select value={dailyOverride.status} onChange={(event) => setDailyOverride((prev) => ({ ...prev, status: event.target.value as QueueDayStatus }))} className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm">
                  <option value="scheduled">Scheduled</option>
                  <option value="running">Running</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <Field label="Reason / note" value={dailyOverride.delayReason} onChange={(value) => setDailyOverride((prev) => ({ ...prev, delayReason: value }))} />
              <div className="lg:col-span-2">
                <button type="submit" className="rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white">
                  Save daily override
                </button>
              </div>
            </form>
          )}
        </SurfaceCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <SurfaceCard className="p-5">
            <h3 className="text-lg font-semibold text-[#102018]">Doctors</h3>
            <div className="mt-4 space-y-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="rounded-2xl border border-[rgba(16,32,24,0.08)] p-4">
                  <p className="font-semibold text-[#102018]">{doctor.displayName}</p>
                  <p className="text-sm text-[#5B6B63]">{doctor.specialty} • {doctor.defaultSlotMinutes} min slots</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <h3 className="text-lg font-semibold text-[#102018]">Services</h3>
            <div className="mt-4 space-y-3">
              {services.map((service) => (
                <div key={service.id} className="rounded-2xl border border-[rgba(16,32,24,0.08)] p-4">
                  <p className="font-semibold text-[#102018]">{service.name}</p>
                  <p className="text-sm text-[#5B6B63]">{service.durationMinutes} minutes</p>
                </div>
              ))}
            </div>
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
  pattern,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
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
        inputMode={type === "tel" ? "tel" : undefined}
        pattern={pattern}
        className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
      />
      {helper ? <span className="text-xs text-[#5B6B63]">{helper}</span> : null}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#102018]">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        required
        className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
      />
    </label>
  );
}

function DatalistField({
  label,
  value,
  onChange,
  listId,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  listId: string;
  options: string[];
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#102018]">{label}</span>
      <input
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  );
}
