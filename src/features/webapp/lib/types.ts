export type UserRole = "patient" | "clinicAdmin" | "receptionStaff" | "doctor";

export type AppointmentStatus =
  | "scheduled"
  | "arrived"
  | "inProgress"
  | "cancelled"
  | "missed"
  | "completed";

export type QueueDayStatus = "scheduled" | "running" | "paused" | "closed";

export interface AppUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  status: string;
  clinicName?: string | null;
  clinicId?: string | null;
  doctorId?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notificationsEnabled?: boolean;
  nearAppointmentAlertsEnabled?: boolean;
  appointmentTimeAlertsEnabled?: boolean;
}

export interface ClinicProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  timezone: string;
  lateCancelCutoffMinutes: number;
  missedBookingBlockDays: number;
  allowWalkIns: boolean;
}

export interface DoctorProfile {
  id: string;
  clinicId: string;
  displayName: string;
  specialty: string;
  isActive: boolean;
  defaultSlotMinutes: number;
}

export interface ClinicService {
  id: string;
  clinicId: string;
  name: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface DoctorAvailabilityRule {
  id: string;
  clinicId: string;
  doctorId: string;
  weekday: number;
  startTimeMinutes: number;
  endTimeMinutes: number;
  isAvailable: boolean;
}

export interface QueueDay {
  clinicId: string;
  doctorId: string;
  doctorName: string;
  dateKey: string;
  scheduledStartTime: Date;
  actualStartTime: Date;
  delayReason: string;
  status: QueueDayStatus;
  nowServingToken?: string | null;
  waitingCount: number;
  completedCount: number;
  averageWaitMinutes: number;
}

export interface Appointment {
  id: string;
  patientId?: string | null;
  patientName: string;
  patientPhone: string;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  scheduledAt: Date;
  source: "booking" | "walkIn";
  status: AppointmentStatus;
  tokenNumber?: string | null;
  estimatedWaitMinutes?: number | null;
  notes?: string | null;
  createdAt?: Date | null;
  arrivalRequestedAt?: Date | null;
  arrivalRequestedByPatient?: boolean;
  arrivalRequestStatus?: "pending" | "acknowledged" | null;
}

export interface AvailableSlot {
  value: string;
  startsAt: Date;
  label: string;
}

export interface NotificationLogEntry {
  event: string;
  patientId: string;
  appointmentId: string;
  clinicId: string;
  doctorId: string;
  message: string;
  createdAt: Date;
}

export interface BookingRequest {
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  patientName: string;
  patientPhone: string;
  scheduledAt: Date;
  notes?: string;
}

export interface QueueEntry extends Appointment {
  statusLabel: string;
}

export interface PatientDashboardOverview {
  patientName: string;
  bookingRuleSummary: string[];
  activeAppointment: Appointment | null;
  upcomingAppointments: Appointment[];
  recentAppointments: Appointment[];
  patientsAhead: number;
  nowServingToken?: string | null;
  queueStatus?: QueueDayStatus | null;
  delayReason: string;
  estimatedWaitMinutes: number;
  statusMessage: string;
  isLiveData: boolean;
}

export interface ClinicDashboardOverview {
  profile: AppUserProfile;
  clinic: ClinicProfile;
  selectedDate: Date;
  selectedDoctor: DoctorProfile | null;
  doctors: DoctorProfile[];
  services: ClinicService[];
  availability: DoctorAvailabilityRule[];
  queueDay: QueueDay | null;
  entries: QueueEntry[];
  todayAppointments: QueueEntry[];
  historyEntries: QueueEntry[];
}
