export const FIRESTORE_DB_ID = "default";

export const FIRESTORE_PATHS = {
  users: "users",
  clinics: "clinics",
  doctors: "doctors",
  services: "services",
  doctorAvailability: "doctor_availability",
  appointments: "appointments",
  queueDays: "queue_days",
  notificationLogs: "notification_logs",
  deviceTokens: "device_tokens",
} as const;

export const SPECIALTY_SUGGESTIONS = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Gynecology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Surgery",
];

export const SERVICE_SUGGESTIONS = [
  "General Consultation",
  "Follow-up Consultation",
  "Lab Review",
  "First Visit",
  "Walk-in Consultation",
  "Procedure Review",
];
