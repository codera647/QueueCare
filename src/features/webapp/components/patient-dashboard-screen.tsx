"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  RefreshCcw,
  Ticket,
  TriangleAlert,
} from "lucide-react";
import { where } from "firebase/firestore";
import { useAuthSession } from "../context/auth-context";
import {
  cancelAppointment,
  fetchAppointmentsForDoctorDay,
  requestPatientArrival,
  subscribeAppointments,
  subscribeQueueDay,
} from "../lib/repository";
import type { Appointment, QueueDay } from "../lib/types";
import {
  compareAppointments,
  formatDate,
  formatDateTime,
  formatQueueStatusLabel,
  formatStatusLabel,
  patientStatusMessage,
} from "../lib/utils";
import { EmptyState, PageContainer, SectionHeading, SurfaceCard } from "./ui";
import { RequireAuth } from "./route-guard";

const activeStatuses = new Set(["scheduled", "arrived", "inProgress"] as const);

export function PatientDashboardScreen() {
  return (
    <RequireAuth audience="patient">
      <PatientDashboardInner />
    </RequireAuth>
  );
}

function PatientDashboardInner() {
  const { profile } = useAuthSession();
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [queueDay, setQueueDay] = React.useState<QueueDay | null>(null);
  const [patientsAhead, setPatientsAhead] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!profile?.uid) return;
    return subscribeAppointments(
      [where("patientId", "==", profile.uid)],
      (items) => {
        setAppointments(
          [...items].sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime()),
        );
      },
    );
  }, [profile?.uid]);

  const activeAppointment = React.useMemo(
    () =>
      appointments.find((appointment) =>
        activeStatuses.has(appointment.status as "scheduled" | "arrived" | "inProgress"),
      ) ?? null,
    [appointments],
  );
  const isArrivalWindow =
    activeAppointment !== null &&
    activeAppointment.status === "scheduled" &&
    activeAppointment.scheduledAt.toDateString() === new Date().toDateString();

  const upcomingAppointments = React.useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.id !== activeAppointment?.id &&
          appointment.status === "scheduled" &&
          appointment.scheduledAt > new Date(),
      ),
    [activeAppointment?.id, appointments],
  );

  const recentAppointments = React.useMemo(
    () =>
      appointments.filter((appointment) =>
        ["completed", "cancelled", "missed"].includes(appointment.status),
      ),
    [appointments],
  );

  React.useEffect(() => {
    if (!activeAppointment) {
      setQueueDay(null);
      setPatientsAhead(0);
      return;
    }

    const unsubscribe = subscribeQueueDay(
      activeAppointment.clinicId,
      activeAppointment.doctorId,
      activeAppointment.scheduledAt,
      setQueueDay,
    );

    let cancelled = false;
    fetchAppointmentsForDoctorDay(
      activeAppointment.clinicId,
      activeAppointment.doctorId,
      activeAppointment.scheduledAt,
    ).then((dayAppointments) => {
      if (cancelled) return;
      const activeDay = dayAppointments
        .filter((item) => !["cancelled", "missed", "completed"].includes(item.status))
        .sort(compareAppointments);
      const index = activeDay.findIndex((item) => item.id === activeAppointment.id);
      setPatientsAhead(index > 0 ? index : 0);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [activeAppointment]);

  const onCancel = async (appointment: Appointment) => {
    try {
      setBusyId(appointment.id);
      setError(null);
      await cancelAppointment(appointment);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to cancel appointment.");
    } finally {
      setBusyId(null);
    }
  };

  const onArrivalRequest = async (appointment: Appointment) => {
    try {
      setBusyId(`${appointment.id}-arrival`);
      setError(null);
      await requestPatientArrival(appointment);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to notify the clinic.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <SectionHeading
          title={`Welcome back${profile?.displayName ? `, ${profile.displayName}` : ""}`}
          subtitle={`Today is ${formatDate(new Date())}. Track your live queue position, upcoming bookings, and recent appointment history.`}
        />

        {activeAppointment ? (
          <SurfaceCard className="p-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B6B63]">
                      Active booking
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-[#102018]">
                      {activeAppointment.clinicName}
                    </h2>
                    <p className="mt-1 text-sm text-[#5B6B63]">
                      {activeAppointment.doctorName} - {activeAppointment.serviceName}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#EAF9EF] px-3 py-1 text-sm font-semibold text-[#0F7A3A]">
                    {formatStatusLabel(activeAppointment.status)}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard icon={<Ticket className="h-5 w-5" />} label="Token" value={activeAppointment.tokenNumber ?? "—"} />
                  <StatCard icon={<Clock3 className="h-5 w-5" />} label="Estimated wait" value={`${activeAppointment.estimatedWaitMinutes ?? 12} min`} />
                  <StatCard icon={<RefreshCcw className="h-5 w-5" />} label="Patients ahead" value={`${patientsAhead}`} />
                </div>

                <div className="rounded-2xl bg-[#F7FAF8] p-4 text-sm text-[#4B5B52]">
                  <p className="font-semibold text-[#102018]">{patientStatusMessage(activeAppointment.status)}</p>
                  <p className="mt-2">Appointment time: {formatDateTime(activeAppointment.scheduledAt)}</p>
                  <p className="mt-1">
                    Queue status: {queueDay ? formatQueueStatusLabel(queueDay.status) : "Scheduled"}
                  </p>
                  {queueDay?.delayReason ? (
                    <p className="mt-1">Delay reason: {queueDay.delayReason}</p>
                  ) : null}
                  {queueDay?.nowServingToken ? (
                    <p className="mt-1">Now serving: {queueDay.nowServingToken}</p>
                  ) : null}
                </div>

                {error ? (
                  <p className="rounded-2xl bg-[#FFF1F1] px-4 py-3 text-sm font-medium text-[#B42318]">{error}</p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  {isArrivalWindow ? (
                    <button
                      type="button"
                      onClick={() => onArrivalRequest(activeAppointment)}
                      disabled={
                        busyId === `${activeAppointment.id}-arrival` ||
                        activeAppointment.arrivalRequestStatus === "pending"
                      }
                      className="rounded-2xl border border-[rgba(22,163,74,0.18)] px-5 py-3 text-sm font-semibold text-[#0F7A3A] disabled:opacity-60"
                    >
                      {activeAppointment.arrivalRequestStatus === "pending"
                        ? "Arrival sent to clinic"
                        : busyId === `${activeAppointment.id}-arrival`
                          ? "Sending..."
                          : "I’ve arrived"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onCancel(activeAppointment)}
                    disabled={busyId === activeAppointment.id}
                    className="rounded-2xl border border-[rgba(185,28,28,0.2)] px-5 py-3 text-sm font-semibold text-[#B42318] disabled:opacity-60"
                  >
                    {busyId === activeAppointment.id ? "Cancelling..." : "Cancel appointment"}
                  </button>
                  <Link
                    href="/app/patient/book"
                    className="rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Book another visit
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <RulesCard />
              </div>
            </div>
          </SurfaceCard>
        ) : (
          <EmptyState
            title="No active appointment yet"
            body="Book your first appointment to start live token tracking and queue updates."
            action={
              <Link
                href="/app/patient/book"
                className="inline-flex rounded-2xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white"
              >
                Book appointment
              </Link>
            }
          />
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <AppointmentList
            title="Upcoming bookings"
            emptyText="No upcoming bookings."
            appointments={upcomingAppointments}
          />
          <AppointmentList
            title="Recent history"
            emptyText="No recent history yet."
            appointments={recentAppointments}
          />
        </div>
      </div>
    </PageContainer>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(16,32,24,0.08)] bg-white p-4">
      <div className="flex items-center gap-2 text-[#16A34A]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5B6B63]">
          {label}
        </span>
      </div>
      <p className="mt-3 text-xl font-bold text-[#102018]">{value}</p>
    </div>
  );
}

function RulesCard() {
  const rules = [
    "Cancel up to 5 minutes before the appointment.",
    "Missed appointments block new booking for 3 days.",
    "Arrival status is updated by the clinic team.",
  ];

  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-2">
        <TriangleAlert className="h-5 w-5 text-[#16A34A]" />
        <h3 className="text-lg font-semibold text-[#102018]">Booking rules</h3>
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[#4B5B52]">
        {rules.map((rule) => (
          <li key={rule} className="rounded-2xl bg-[#F7FAF8] px-4 py-3">
            {rule}
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}

function AppointmentList({
  title,
  emptyText,
  appointments,
}: {
  title: string;
  emptyText: string;
  appointments: Appointment[];
}) {
  return (
    <SurfaceCard className="p-5">
      <h3 className="text-lg font-semibold text-[#102018]">{title}</h3>
      <div className="mt-4 space-y-3">
        {appointments.length === 0 ? (
          <p className="text-sm text-[#5B6B63]">{emptyText}</p>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-2xl border border-[rgba(16,32,24,0.08)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#102018]">{appointment.clinicName}</p>
                  <p className="text-sm text-[#5B6B63]">
                    {appointment.doctorName} - {appointment.serviceName}
                  </p>
                </div>
                <span className="rounded-full bg-[#F3F7F4] px-3 py-1 text-xs font-semibold text-[#4B5B52]">
                  {formatStatusLabel(appointment.status)}
                </span>
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#4B5B52]">
                <CalendarDays className="h-4 w-4 text-[#16A34A]" />
                {formatDateTime(appointment.scheduledAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </SurfaceCard>
  );
}
