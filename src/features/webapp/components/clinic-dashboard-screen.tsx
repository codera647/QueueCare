"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { where } from "firebase/firestore";
import {
  CalendarDays,
  Clock3,
  Play,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { useAuthSession } from "../context/auth-context";
import {
  createWalkIn,
  fetchClinic,
  subscribeAppointments,
  subscribeDoctors,
  subscribeQueueDay,
  subscribeServices,
  updateAppointmentStatus,
  updateQueueDay,
} from "../lib/repository";
import type {
  Appointment,
  ClinicProfile,
  ClinicService,
  DoctorProfile,
  QueueDay,
} from "../lib/types";
import {
  compareAppointments,
  formatDate,
  formatDateTime,
  formatQueueStatusLabel,
  formatStatusLabel,
} from "../lib/utils";
import { EmptyState, PageContainer, SectionHeading, SurfaceCard } from "./ui";
import { RequireAuth } from "./route-guard";

export function ClinicDashboardScreen() {
  return (
    <RequireAuth audience="clinic">
      <ClinicDashboardInner />
    </RequireAuth>
  );
}

function ClinicDashboardInner() {
  const { profile } = useAuthSession();
  const [clinic, setClinic] = React.useState<ClinicProfile | null>(null);
  const [doctors, setDoctors] = React.useState<DoctorProfile[]>([]);
  const [services, setServices] = React.useState<ClinicService[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [queueDay, setQueueDay] = React.useState<QueueDay | null>(null);
  const [tab, setTab] = React.useState<"appointments" | "history">("appointments");
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [walkInOpen, setWalkInOpen] = React.useState(false);
  const [walkInForm, setWalkInForm] = React.useState({
    patientName: "",
    patientPhone: "",
    serviceId: "",
    notes: "",
  });

  const clinicId = profile?.clinicId ?? null;
  const selectedDateValue = React.useMemo(
    () => new Date(`${selectedDate}T00:00:00`),
    [selectedDate],
  );

  React.useEffect(() => {
    if (!clinicId) return;
    fetchClinic(clinicId).then((item) => setClinic(item));
    const unsubDoctors = subscribeDoctors(clinicId, (items) => {
      const active = items.filter((item) => item.isActive);
      setDoctors(active);
      setSelectedDoctorId((current) => current || active[0]?.id || "");
    });
    const unsubServices = subscribeServices(clinicId, (items) => {
      setServices(items.filter((item) => item.isActive));
    });
    return () => {
      unsubDoctors();
      unsubServices();
    };
  }, [clinicId]);

  const selectedDoctor = doctors.find((item) => item.id === selectedDoctorId) ?? null;

  React.useEffect(() => {
    if (!clinicId || !selectedDoctor) {
      setAppointments([]);
      setQueueDay(null);
      return;
    }
    const unsubscribeAppointments = subscribeAppointments(
      [
        where("clinicId", "==", clinicId),
        where("doctorId", "==", selectedDoctor.id),
      ],
      (items) => {
        const dayStart = new Date(selectedDateValue);
        const dayEnd = new Date(selectedDateValue);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const sameDay = items
          .filter((item) => item.scheduledAt >= dayStart && item.scheduledAt < dayEnd)
          .sort(compareAppointments);
        setAppointments(sameDay);
      },
    );
    const unsubscribeQueueDay = subscribeQueueDay(
      clinicId,
      selectedDoctor.id,
      selectedDateValue,
      setQueueDay,
    );
    return () => {
      unsubscribeAppointments();
      unsubscribeQueueDay();
    };
  }, [clinicId, selectedDateValue, selectedDoctor]);

  const activeAppointments = appointments.filter((item) =>
    ["scheduled", "arrived", "inProgress"].includes(item.status),
  );
  const historyAppointments = appointments.filter((item) =>
    ["completed", "missed", "cancelled"].includes(item.status),
  );
  const pendingArrivalRequests = activeAppointments.filter(
    (item) => item.arrivalRequestStatus === "pending",
  );

  const handleStatus = async (
    appointment: Appointment,
    status: Appointment["status"],
  ) => {
    try {
      setError(null);
      setBusyKey(`${appointment.id}-${status}`);
      await updateAppointmentStatus(appointment, status);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update appointment.");
    } finally {
      setBusyKey(null);
    }
  };

  const updateQueue = async (
    status: QueueDay["status"],
    reason = queueDay?.delayReason ?? "",
  ) => {
    if (!clinic || !selectedDoctor) return;
    try {
      setBusyKey(`queue-${status}`);
      await updateQueueDay({
        clinicId: clinic.id,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.displayName,
        date: selectedDateValue,
        status,
        delayReason: reason,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update queue.");
    } finally {
      setBusyKey(null);
    }
  };

  const submitWalkIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!clinic || !selectedDoctor) return;
    const service = services.find((item) => item.id === walkInForm.serviceId);
    if (!service) return;
    try {
      setBusyKey("walkin");
      setError(null);
      await createWalkIn({
        clinicId: clinic.id,
        clinicName: clinic.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.displayName,
        patientName: walkInForm.patientName.trim(),
        patientPhone: walkInForm.patientPhone.trim(),
        serviceId: service.id,
        serviceName: service.name,
        scheduledAt: new Date(),
        notes: walkInForm.notes.trim() || undefined,
      });
      setWalkInForm({ patientName: "", patientPhone: "", serviceId: "", notes: "" });
      setWalkInOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create walk-in.");
    } finally {
      setBusyKey(null);
    }
  };

  if (!clinicId) {
    return (
      <PageContainer>
        <EmptyState
          title="Clinic profile is missing"
          body="This account does not have a clinic attached yet."
        />
      </PageContainer>
    );
  }

  if (!selectedDoctor) {
    return (
      <PageContainer>
        <EmptyState
          title="Set up your clinic first"
          body="Add at least one doctor and one service in clinic settings before using the live dashboard."
          action={
            <Link
              href="/app/clinic/settings"
              className="inline-flex rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white"
            >
              Open clinic settings
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeading
            title={clinic?.name ?? "Clinic dashboard"}
            subtitle={`Today is ${formatDate(new Date())}. Monitor the selected doctor’s queue, manage appointment state, and control the queue in real time.`}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedDoctorId}
              onChange={(event) => setSelectedDoctorId(event.target.value)}
              className="rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm font-semibold"
            >
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.displayName} - {doctor.specialty}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm font-semibold"
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl bg-[#FFF1F1] px-4 py-3 text-sm font-medium text-[#B42318]">
            {error}
          </p>
        ) : null}
        {pendingArrivalRequests.length > 0 ? (
          <p className="rounded-2xl bg-[#FFF8E7] px-4 py-3 text-sm font-medium text-[#92400E]">
            {pendingArrivalRequests.length} patient
            {pendingArrivalRequests.length > 1 ? "s have" : " has"} requested arrival for{" "}
            {formatDate(selectedDateValue)}.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Queue status"
            value={queueDay ? formatQueueStatusLabel(queueDay.status) : "Scheduled"}
            icon={<Play className="h-5 w-5 text-[#16A34A]" />}
          />
          <MetricCard
            label="Now serving"
            value={queueDay?.nowServingToken ?? "—"}
            icon={<Clock3 className="h-5 w-5 text-[#16A34A]" />}
          />
          <MetricCard
            label="Waiting"
            value={`${queueDay?.waitingCount ?? activeAppointments.length}`}
            icon={<CalendarDays className="h-5 w-5 text-[#16A34A]" />}
          />
          <MetricCard
            label="Completed"
            value={`${queueDay?.completedCount ?? historyAppointments.filter((item) => item.status === "completed").length}`}
            icon={<CheckCircle2 className="h-5 w-5 text-[#16A34A]" />}
          />
        </div>

        <SurfaceCard className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#102018]">Queue control</h2>
              <p className="text-sm text-[#5B6B63]">
                Selected date: {formatDate(selectedDateValue)}
                {queueDay?.delayReason ? ` • ${queueDay.delayReason}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateQueue("running")}
                className="rounded-2xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Start / Resume
              </button>
              <button
                type="button"
                onClick={() => updateQueue("paused", "Temporarily paused by clinic")}
                className="rounded-2xl border border-[rgba(16,32,24,0.08)] px-4 py-2.5 text-sm font-semibold"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={() => updateQueue("closed", "Queue closed for the day")}
                className="rounded-2xl border border-[rgba(185,28,28,0.2)] px-4 py-2.5 text-sm font-semibold text-[#B42318]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setWalkInOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(16,32,24,0.08)] px-4 py-2.5 text-sm font-semibold"
              >
                <UserPlus className="h-4 w-4" />
                Walk-in
              </button>
            </div>
          </div>

          {walkInOpen ? (
            <form
              className="mt-4 grid gap-3 rounded-2xl bg-[#F7FAF8] p-4 lg:grid-cols-2"
              onSubmit={submitWalkIn}
            >
              <input
                placeholder="Patient name"
                value={walkInForm.patientName}
                onChange={(event) =>
                  setWalkInForm((prev) => ({ ...prev, patientName: event.target.value }))
                }
                className="rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm"
                required
              />
              <div className="space-y-2">
                <input
                  placeholder="Patient phone"
                  value={walkInForm.patientPhone}
                  onChange={(event) =>
                    setWalkInForm((prev) => ({ ...prev, patientPhone: event.target.value }))
                  }
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  className="w-full rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm"
                  required
                />
                <p className="text-xs text-[#5B6B63]">
                  Use 10 to 15 digits. Spaces, dashes, and brackets are okay.
                </p>
              </div>
              <select
                value={walkInForm.serviceId}
                onChange={(event) =>
                  setWalkInForm((prev) => ({ ...prev, serviceId: event.target.value }))
                }
                className="rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm"
                required
              >
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Notes (optional)"
                value={walkInForm.notes}
                onChange={(event) =>
                  setWalkInForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                className="rounded-2xl border border-[rgba(16,32,24,0.1)] bg-white px-4 py-3 text-sm"
              />
              <div className="flex gap-3 lg:col-span-2">
                <button
                  type="submit"
                  disabled={busyKey === "walkin"}
                  className="rounded-2xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {busyKey === "walkin" ? "Adding..." : "Add walk-in"}
                </button>
                <button
                  type="button"
                  onClick={() => setWalkInOpen(false)}
                  className="rounded-2xl border border-[rgba(16,32,24,0.08)] px-4 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </SurfaceCard>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("appointments")}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold",
              tab === "appointments" ? "bg-[#EAF9EF] text-[#0F7A3A]" : "bg-white text-[#4B5B52]",
            ].join(" ")}
          >
            Appointments
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold",
              tab === "history" ? "bg-[#EAF9EF] text-[#0F7A3A]" : "bg-white text-[#4B5B52]",
            ].join(" ")}
          >
            History
          </button>
        </div>

        <SurfaceCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[rgba(16,32,24,0.08)]">
              <thead className="bg-[#F7FAF8]">
                <tr className="text-left text-sm text-[#5B6B63]">
                  {["Token", "Patient", "Service", "Time", "Status", "Actions"].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(16,32,24,0.06)] bg-white">
                {(tab === "appointments" ? activeAppointments : historyAppointments).map(
                  (appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-4 py-4 text-sm font-semibold text-[#102018]">
                        {appointment.tokenNumber ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#102018]">
                        {appointment.patientName}
                        {appointment.arrivalRequestStatus === "pending" ? (
                          <div className="mt-2 inline-flex rounded-full bg-[#FFF8E7] px-3 py-1 text-xs font-semibold text-[#92400E]">
                            Arrival requested
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#4B5B52]">
                        {appointment.serviceName}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#4B5B52]">
                        {formatDateTime(appointment.scheduledAt)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="rounded-full bg-[#F3F7F4] px-3 py-1 text-xs font-semibold text-[#4B5B52]">
                          {formatStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {tab === "appointments" ? (
                          <div className="flex flex-wrap gap-2">
                            {appointment.status === "scheduled" ? (
                              <ActionButton
                                label="Arrived"
                                busy={busyKey === `${appointment.id}-arrived`}
                                onClick={() => handleStatus(appointment, "arrived")}
                              />
                            ) : null}
                            {appointment.status !== "inProgress" &&
                            appointment.status !== "completed" ? (
                              <ActionButton
                                label="In progress"
                                busy={busyKey === `${appointment.id}-inProgress`}
                                onClick={() => handleStatus(appointment, "inProgress")}
                              />
                            ) : null}
                            {appointment.status !== "completed" ? (
                              <ActionButton
                                label="Complete"
                                busy={busyKey === `${appointment.id}-completed`}
                                onClick={() => handleStatus(appointment, "completed")}
                              />
                            ) : null}
                            {appointment.status !== "missed" &&
                            appointment.status !== "completed" ? (
                              <ActionButton
                                label="Missed"
                                busy={busyKey === `${appointment.id}-missed`}
                                onClick={() => handleStatus(appointment, "missed")}
                                tone="danger"
                              />
                            ) : null}
                            {appointment.status !== "cancelled" &&
                            appointment.status !== "completed" ? (
                              <ActionButton
                                label="Cancel"
                                busy={busyKey === `${appointment.id}-cancelled`}
                                onClick={() => handleStatus(appointment, "cancelled")}
                                tone="danger"
                              />
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-[#5B6B63]">Finished entry</span>
                        )}
                      </td>
                    </tr>
                  ),
                )}
                {(tab === "appointments" ? activeAppointments : historyAppointments).length ===
                0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#5B6B63]">
                      No {tab} for {formatDate(selectedDateValue)}.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      </div>
    </PageContainer>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-2 text-[#16A34A]">{icon}</div>
      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#5B6B63]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[#102018]">{value}</p>
    </SurfaceCard>
  );
}

function ActionButton({
  label,
  onClick,
  busy,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  busy: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={[
        "rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-60",
        tone === "danger"
          ? "border border-[rgba(185,28,28,0.18)] text-[#B42318]"
          : "bg-[#EAF9EF] text-[#0F7A3A]",
      ].join(" ")}
    >
      {busy ? "Saving..." : label}
    </button>
  );
}
