import type {
  Appointment,
  AppointmentStatus,
  QueueDayStatus,
  UserRole,
} from "./types";

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

export function formatDateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function queueDayDocId(
  clinicId: string,
  doctorId: string,
  date: Date,
): string {
  return `${clinicId}_${doctorId}_${formatDateKey(date)}`;
}

export function availabilityDocId(
  clinicId: string,
  doctorId: string,
  weekday: number,
): string {
  return `${clinicId}_${doctorId}_${weekday}`;
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-PK", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatTimeFromMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return formatTime(new Date(2000, 0, 1, hours, minutes));
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(date);
}

export function formatStatusLabel(status: AppointmentStatus): string {
  switch (status) {
    case "scheduled":
      return "Waiting";
    case "arrived":
      return "Arrived";
    case "inProgress":
      return "In Progress";
    case "cancelled":
      return "Cancelled";
    case "missed":
      return "Missed";
    case "completed":
      return "Completed";
  }
}

export function formatQueueStatusLabel(status: QueueDayStatus): string {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "running":
      return "Running";
    case "paused":
      return "Paused";
    case "closed":
      return "Closed";
  }
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "patient":
      return "Patient";
    case "clinicAdmin":
      return "Clinic Admin";
    case "receptionStaff":
      return "Reception Staff";
    case "doctor":
      return "Doctor";
  }
}

export function compareAppointments(a: Appointment, b: Appointment): number {
  if (a.source !== b.source) {
    if (a.source === "booking") return -1;
    if (b.source === "booking") return 1;
  }

  const byTime = a.scheduledAt.getTime() - b.scheduledAt.getTime();
  if (byTime !== 0) {
    return byTime;
  }

  return (
    (a.createdAt?.getTime() ?? a.scheduledAt.getTime()) -
    (b.createdAt?.getTime() ?? b.scheduledAt.getTime())
  );
}

export function canCancelAppointment(appointmentTime: Date, now: Date): boolean {
  return appointmentTime.getTime() - now.getTime() > 5 * 60 * 1000;
}

export function blockedUntilForMissedAppointment(missedAt: Date): Date {
  return new Date(missedAt.getTime() + 3 * 24 * 60 * 60 * 1000);
}

export function patientStatusMessage(status: AppointmentStatus): string {
  switch (status) {
    case "arrived":
      return "You have checked in at the clinic.";
    case "inProgress":
      return "It's almost your turn.";
    case "completed":
      return "Completed successfully.";
    case "cancelled":
      return "This appointment was cancelled.";
    case "missed":
      return "This appointment was marked as missed.";
    case "scheduled":
      return "Confirmed and waiting to begin.";
  }
}
