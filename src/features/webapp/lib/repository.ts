"use client";

import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Unsubscribe,
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe as FirestoreUnsubscribe,
} from "firebase/firestore";
import {
  FIRESTORE_PATHS,
} from "./constants";
import {
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseMessagingClient,
  getGoogleProvider,
} from "./firebase";
import type {
  AppUserProfile,
  Appointment,
  AppointmentStatus,
  AvailableSlot,
  BookingRequest,
  ClinicProfile,
  ClinicService,
  DoctorAvailabilityRule,
  DoctorProfile,
  NotificationLogEntry,
  QueueDay,
  QueueDayStatus,
  UserRole,
} from "./types";
import {
  availabilityDocId,
  blockedUntilForMissedAppointment,
  canCancelAppointment,
  compareAppointments,
  formatDateKey,
  patientStatusMessage,
  queueDayDocId,
  slugify,
  startOfDay,
  endOfDay,
} from "./utils";

const auth = () => getFirebaseAuth();
const db = () => getFirebaseDb();
const phoneNumberPattern = /^\+?[0-9]{10,15}$/;

function isRoleAllowedForAudience(
  role: UserRole,
  audience: "patient" | "clinic",
): boolean {
  if (audience === "patient") {
    return role === "patient";
  }
  return role !== "patient";
}

function asDate(value: unknown, fallback?: Date): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return fallback ?? new Date();
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizePhoneNumber(value: string): string {
  return value.replace(/[\s\-()]/g, "").trim();
}

function validatePhoneNumber(value: string, fieldName: string): string {
  const normalized = normalizePhoneNumber(value);
  if (!phoneNumberPattern.test(normalized)) {
    throw new Error(`${fieldName} must use 10 to 15 digits, with an optional leading +.`);
  }
  return normalized;
}

export function mapUserProfile(uid: string, data: DocumentData): AppUserProfile {
  return {
    uid,
    email: asString(data.email),
    displayName: asString(data.displayName),
    role: (data.role as UserRole) ?? "patient",
    createdAt: asDate(data.createdAt),
    status: asString(data.status, "active"),
    clinicName: asString(data.clinicName, "") || null,
    clinicId: asString(data.clinicId, "") || null,
    doctorId: asString(data.doctorId, "") || null,
    phoneNumber: asString(data.phoneNumber, "") || null,
    dateOfBirth: asString(data.dateOfBirth, "") || null,
    gender: asString(data.gender, "") || null,
    emergencyContactName: asString(data.emergencyContactName, "") || null,
    emergencyContactPhone: asString(data.emergencyContactPhone, "") || null,
    notificationsEnabled: Boolean(data.notificationsEnabled ?? false),
    nearAppointmentAlertsEnabled: Boolean(data.nearAppointmentAlertsEnabled ?? true),
    appointmentTimeAlertsEnabled: Boolean(data.appointmentTimeAlertsEnabled ?? true),
  };
}

function mapClinicProfile(id: string, data: DocumentData): ClinicProfile {
  const queuePolicy = (data.queuePolicy ?? {}) as Record<string, unknown>;
  return {
    id,
    name: asString(data.name),
    phone: asString(data.phone),
    address: asString(data.address),
    timezone: asString(data.timezone, "Asia/Karachi"),
    lateCancelCutoffMinutes:
      Number(queuePolicy.lateCancelCutoffMinutes ?? 5) || 5,
    missedBookingBlockDays:
      Number(queuePolicy.missedBookingBlockDays ?? 3) || 3,
    allowWalkIns: Boolean(queuePolicy.allowWalkIns ?? true),
  };
}

function mapDoctorProfile(id: string, data: DocumentData): DoctorProfile {
  return {
    id,
    clinicId: asString(data.clinicId),
    displayName: asString(data.displayName),
    specialty: asString(data.specialty),
    isActive: Boolean(data.isActive ?? true),
    defaultSlotMinutes: Number(data.defaultSlotMinutes ?? 15) || 15,
  };
}

function mapClinicService(id: string, data: DocumentData): ClinicService {
  return {
    id,
    clinicId: asString(data.clinicId),
    name: asString(data.name),
    durationMinutes: Number(data.durationMinutes ?? 15) || 15,
    isActive: Boolean(data.isActive ?? true),
  };
}

function mapAvailability(id: string, data: DocumentData): DoctorAvailabilityRule {
  return {
    id,
    clinicId: asString(data.clinicId),
    doctorId: asString(data.doctorId),
    weekday: Number(data.weekday ?? 0),
    startTimeMinutes: Number(data.startTimeMinutes ?? 540),
    endTimeMinutes: Number(data.endTimeMinutes ?? 1020),
    isAvailable: Boolean(data.isAvailable ?? true),
  };
}

export function mapAppointment(id: string, data: DocumentData): Appointment {
  return {
    id,
    patientId: asString(data.patientId, "") || null,
    patientName: asString(data.patientName),
    patientPhone: asString(data.patientPhone),
    clinicId: asString(data.clinicId),
    clinicName: asString(data.clinicName),
    doctorId: asString(data.doctorId),
    doctorName: asString(data.doctorName),
    serviceId: asString(data.serviceId),
    serviceName: asString(data.serviceName),
    scheduledAt: asDate(data.scheduledAt),
    source: (data.source as "booking" | "walkIn") ?? "booking",
    status: (data.status as AppointmentStatus) ?? "scheduled",
    tokenNumber: asString(data.tokenNumber, "") || null,
    estimatedWaitMinutes: Number(data.estimatedWaitMinutes ?? 12) || 12,
    notes: asString(data.notes, "") || null,
    createdAt: data.createdAt ? asDate(data.createdAt) : null,
    arrivalRequestedAt: data.arrivalRequestedAt ? asDate(data.arrivalRequestedAt) : null,
    arrivalRequestedByPatient: Boolean(data.arrivalRequestedByPatient ?? false),
    arrivalRequestStatus:
      (data.arrivalRequestStatus as "pending" | "acknowledged" | null) ?? null,
  };
}

function mapQueueDay(data: DocumentData): QueueDay {
  return {
    clinicId: asString(data.clinicId),
    doctorId: asString(data.doctorId),
    doctorName: asString(data.doctorName),
    dateKey: asString(data.dateKey),
    scheduledStartTime: asDate(data.scheduledStartTime),
    actualStartTime: asDate(data.actualStartTime),
    delayReason: asString(data.delayReason),
    status: (data.status as QueueDayStatus) ?? "scheduled",
    nowServingToken: asString(data.nowServingToken, "") || null,
    waitingCount: Number(data.waitingCount ?? 0) || 0,
    completedCount: Number(data.completedCount ?? 0) || 0,
    averageWaitMinutes: Number(data.averageWaitMinutes ?? 12) || 12,
  };
}

function timestamp(date: Date) {
  return Timestamp.fromDate(date);
}

async function ensurePersistence() {
  await setPersistence(auth(), browserLocalPersistence);
}

export async function subscribeToAuthSession(
  callback: (session: { user: User | null; profile: AppUserProfile | null; loading: boolean }) => void,
): Promise<Unsubscribe> {
  await ensurePersistence();

  let profileUnsubscribe: FirestoreUnsubscribe | null = null;
  callback({ user: auth().currentUser, profile: null, loading: true });

  return onAuthStateChanged(auth(), (user) => {
    if (profileUnsubscribe) {
      profileUnsubscribe();
      profileUnsubscribe = null;
    }

    if (!user) {
      callback({ user: null, profile: null, loading: false });
      return;
    }

    const profileRef = doc(db(), FIRESTORE_PATHS.users, user.uid);
    profileUnsubscribe = onSnapshot(profileRef, (snapshot) => {
      callback({
        user,
        profile: snapshot.exists() ? mapUserProfile(user.uid, snapshot.data()) : null,
        loading: false,
      });
    });
  });
}

export async function registerWithEmail(params: {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  clinicName?: string;
}) {
  await ensurePersistence();
  const credential = await createUserWithEmailAndPassword(
    auth(),
    params.email,
    params.password,
  );
  if (credential.user) {
    await updateProfile(credential.user, { displayName: params.displayName });
    await upsertInitialProfile(credential.user, params);
    await sendEmailVerification(credential.user);
  }
  return credential;
}

export async function loginWithEmail(
  email: string,
  password: string,
  audience: "patient" | "clinic",
) {
  await ensurePersistence();
  const credential = await signInWithEmailAndPassword(auth(), email, password);
  const profile = await fetchUserProfile(credential.user.uid);
  if (!profile) {
    await signOut(auth());
    throw new Error("We could not find a QueueCare profile for this account.");
  }
  if (!isRoleAllowedForAudience(profile.role, audience)) {
    await signOut(auth());
    throw new Error(
      audience === "patient"
        ? "This account is not registered as a patient. Please use the clinic login instead."
        : "This account is not registered as clinic staff. Please use the patient login instead.",
    );
  }
  return credential;
}

export async function loginWithGoogle(role: UserRole, audience: "patient" | "clinic") {
  await ensurePersistence();
  const credential = await signInWithPopup(auth(), getGoogleProvider());
  const user = credential.user;
  if (user) {
    const existing = await fetchUserProfile(user.uid);
    if (!existing) {
      await upsertInitialProfile(user, {
        email: user.email ?? "",
        password: "",
        displayName: user.displayName ?? user.email?.split("@")[0] ?? "QueueCare User",
        role,
        clinicName: role === "patient" ? undefined : "QueueCare Clinic",
      });
    } else if (!isRoleAllowedForAudience(existing.role, audience)) {
      await signOut(auth());
      throw new Error(
        audience === "patient"
          ? "This Google account is linked to clinic staff. Please use the clinic login instead."
          : "This Google account is linked to a patient profile. Please use the patient login instead.",
      );
    }
  }
  return credential;
}

export function logout() {
  return signOut(auth());
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth(), email);
}

export async function resendVerificationEmail() {
  const currentUser = auth().currentUser;
  if (!currentUser) {
    throw new Error("No signed in user.");
  }
  await sendEmailVerification(currentUser);
}

export async function reloadCurrentUser() {
  const currentUser = auth().currentUser;
  if (!currentUser) return null;
  await reload(currentUser);
  return auth().currentUser;
}

export async function fetchUserProfile(uid: string): Promise<AppUserProfile | null> {
  const snapshot = await getDoc(doc(db(), FIRESTORE_PATHS.users, uid));
  return snapshot.exists() ? mapUserProfile(uid, snapshot.data()) : null;
}

async function upsertInitialProfile(
  user: User,
  params: {
    email: string;
    password?: string;
    displayName: string;
    role: UserRole;
    clinicName?: string;
  },
) {
  const clinicName =
    params.role === "patient"
      ? null
      : params.clinicName?.trim() || "QueueCare Clinic";
  const clinicId = clinicName ? slugify(clinicName) : null;
  const profile: AppUserProfile = {
    uid: user.uid,
    email: params.email,
    displayName: params.displayName,
    role: params.role,
    createdAt: new Date(),
    status: "active",
    clinicName,
    clinicId,
    doctorId: params.role === "doctor" && clinicId
      ? `${clinicId}_${slugify(params.displayName)}`
      : null,
    phoneNumber: null,
    dateOfBirth: null,
    gender: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    notificationsEnabled: false,
    nearAppointmentAlertsEnabled: true,
    appointmentTimeAlertsEnabled: true,
  };

  await setDoc(doc(db(), FIRESTORE_PATHS.users, user.uid), {
    ...profile,
    createdAt: timestamp(profile.createdAt),
  });

  if (profile.role !== "patient" && clinicId && clinicName) {
    await upsertClinic({
      id: clinicId,
      name: clinicName,
      phone: "",
      address: "",
      timezone: "Asia/Karachi",
      lateCancelCutoffMinutes: 5,
      missedBookingBlockDays: 3,
      allowWalkIns: true,
    });
  }
}

export function subscribeClinics(
  callback: (clinics: ClinicProfile[]) => void,
): FirestoreUnsubscribe {
  return onSnapshot(
    query(collection(db(), FIRESTORE_PATHS.clinics), orderBy("name", "asc")),
    (snapshot) => {
      callback(snapshot.docs.map((item) => mapClinicProfile(item.id, item.data())));
    },
  );
}

export function subscribeDoctors(
  clinicId: string,
  callback: (doctors: DoctorProfile[]) => void,
): FirestoreUnsubscribe {
  return onSnapshot(
    query(
      collection(db(), FIRESTORE_PATHS.doctors),
      where("clinicId", "==", clinicId),
    ),
    (snapshot) => {
      callback(
        snapshot.docs
          .map((item) => mapDoctorProfile(item.id, item.data()))
          .sort((left, right) => left.displayName.localeCompare(right.displayName)),
      );
    },
  );
}

export function subscribeServices(
  clinicId: string,
  callback: (services: ClinicService[]) => void,
): FirestoreUnsubscribe {
  return onSnapshot(
    query(
      collection(db(), FIRESTORE_PATHS.services),
      where("clinicId", "==", clinicId),
    ),
    (snapshot) => {
      callback(
        snapshot.docs
          .map((item) => mapClinicService(item.id, item.data()))
          .sort((left, right) => left.name.localeCompare(right.name)),
      );
    },
  );
}

export function subscribeAvailability(
  clinicId: string,
  doctorId: string,
  callback: (rules: DoctorAvailabilityRule[]) => void,
): FirestoreUnsubscribe {
  return onSnapshot(
    query(
      collection(db(), FIRESTORE_PATHS.doctorAvailability),
      where("clinicId", "==", clinicId),
      where("doctorId", "==", doctorId),
    ),
    (snapshot) => {
      callback(
        snapshot.docs
          .map((item) => mapAvailability(item.id, item.data()))
          .sort((left, right) => left.weekday - right.weekday),
      );
    },
  );
}

export function subscribeAppointments(
  constraints: QueryConstraint[],
  callback: (appointments: Appointment[]) => void,
): FirestoreUnsubscribe {
  return onSnapshot(query(collection(db(), FIRESTORE_PATHS.appointments), ...constraints), (snapshot) => {
    const appointments = snapshot.docs.map((item) => mapAppointment(item.id, item.data()));
    callback(appointments);
  });
}

export function subscribeQueueDay(
  clinicId: string,
  doctorId: string,
  date: Date,
  callback: (queueDay: QueueDay | null) => void,
): FirestoreUnsubscribe {
  return onSnapshot(
    doc(db(), FIRESTORE_PATHS.queueDays, queueDayDocId(clinicId, doctorId, date)),
    (snapshot) => {
      callback(snapshot.exists() ? mapQueueDay(snapshot.data()) : null);
    },
  );
}

export async function fetchClinic(clinicId: string) {
  const snapshot = await getDoc(doc(db(), FIRESTORE_PATHS.clinics, clinicId));
  return snapshot.exists() ? mapClinicProfile(snapshot.id, snapshot.data()) : null;
}

export async function fetchAppointmentsForDoctorDay(
  clinicId: string,
  doctorId: string,
  date: Date,
): Promise<Appointment[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), FIRESTORE_PATHS.appointments),
      where("clinicId", "==", clinicId),
      where("doctorId", "==", doctorId),
    ),
  );

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  return snapshot.docs
    .map((item) => mapAppointment(item.id, item.data()))
    .filter(
      (appointment) =>
        appointment.scheduledAt >= dayStart && appointment.scheduledAt < dayEnd,
    )
    .sort(compareAppointments);
}

export async function generateAvailableSlots(params: {
  clinicId: string;
  doctor: DoctorProfile;
  service: ClinicService;
  date: Date;
}): Promise<AvailableSlot[]> {
  const [availabilitySnapshot, queueDaySnapshot, appointments] = await Promise.all([
    getDocs(
      query(
        collection(db(), FIRESTORE_PATHS.doctorAvailability),
        where("clinicId", "==", params.clinicId),
        where("doctorId", "==", params.doctor.id),
      ),
    ),
    getDoc(doc(db(), FIRESTORE_PATHS.queueDays, queueDayDocId(params.clinicId, params.doctor.id, params.date))),
    fetchAppointmentsForDoctorDay(params.clinicId, params.doctor.id, params.date),
  ]);

  const weekday = params.date.getDay();
  const availability = availabilitySnapshot.docs
    .map((item) => mapAvailability(item.id, item.data()))
    .find((rule) => rule.weekday === weekday && rule.isAvailable);

  if (!availability) {
    return [];
  }

  const queueDay = queueDaySnapshot.exists() ? mapQueueDay(queueDaySnapshot.data()!) : null;
  const interval = Math.max(params.service.durationMinutes, params.doctor.defaultSlotMinutes);
  const startMinutes = queueDay?.actualStartTime
    ? queueDay.actualStartTime.getHours() * 60 + queueDay.actualStartTime.getMinutes()
    : availability.startTimeMinutes;
  const endMinutes = availability.endTimeMinutes;
  const dayStart = startOfDay(params.date);
  const now = new Date();

  const bookedKeys = new Set(
    appointments
      .filter((appointment) => appointment.status !== "cancelled" && appointment.status !== "missed")
      .map((appointment) => appointment.scheduledAt.toISOString()),
  );

  const slots: AvailableSlot[] = [];
  for (let minute = startMinutes; minute + interval <= endMinutes; minute += interval) {
    const slot = new Date(dayStart);
    slot.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    if (slot <= now) continue;
    if (bookedKeys.has(slot.toISOString())) continue;
    slots.push({
      value: slot.toISOString(),
      startsAt: slot,
      label: slot.toLocaleTimeString("en-PK", {
        hour: "numeric",
        minute: "2-digit",
      }),
    });
  }

  return slots;
}

export async function createAppointment(
  patientId: string,
  request: BookingRequest,
): Promise<void> {
  const now = new Date();
  if (request.scheduledAt <= now) {
    throw new Error("Please choose a future appointment time.");
  }

  const existingAppointmentsSnapshot = await getDocs(
    query(
      collection(db(), FIRESTORE_PATHS.appointments),
      where("patientId", "==", patientId),
    ),
  );

  const previousAppointments = existingAppointmentsSnapshot.docs
    .map((item) => mapAppointment(item.id, item.data()))
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());

  const lastMissed = previousAppointments.find((item) => item.status === "missed");
  if (lastMissed) {
    const blockedUntil = blockedUntilForMissedAppointment(lastMissed.scheduledAt);
    if (blockedUntil > now) {
      throw new Error(
        `Booking is blocked until ${blockedUntil.toLocaleString("en-PK")} because of a missed appointment.`,
      );
    }
  }

  const patientPhone = validatePhoneNumber(request.patientPhone, "Patient phone");
  const tokenNumber = await nextTokenNumber(request.clinicId, request.doctorId, request.scheduledAt);
  const appointmentData = {
    patientId,
    patientName: request.patientName,
    patientPhone,
    clinicId: request.clinicId,
    clinicName: request.clinicName,
    doctorId: request.doctorId,
    doctorName: request.doctorName,
    serviceId: request.serviceId,
    serviceName: request.serviceName,
    scheduledAt: timestamp(request.scheduledAt),
    source: "booking",
    status: "scheduled",
    tokenNumber,
    estimatedWaitMinutes: 12,
    notes: request.notes ?? null,
    createdAt: serverTimestamp(),
  };

  const createdRef = await addDoc(collection(db(), FIRESTORE_PATHS.appointments), appointmentData);
  await logNotification({
    event: "appointment_booked",
    patientId,
    appointmentId: createdRef.id,
    clinicId: request.clinicId,
    doctorId: request.doctorId,
    message: "Appointment booked successfully.",
  });

  await refreshQueueDayFromAppointments(
    request.clinicId,
    request.doctorId,
    request.doctorName,
    request.scheduledAt,
  );
}

export async function createWalkIn(params: {
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  serviceId: string;
  serviceName: string;
  scheduledAt: Date;
  notes?: string;
}) {
  const patientPhone = validatePhoneNumber(params.patientPhone, "Patient phone");
  const tokenNumber = await nextTokenNumber(params.clinicId, params.doctorId, params.scheduledAt);
  await addDoc(collection(db(), FIRESTORE_PATHS.appointments), {
    patientId: null,
    patientName: params.patientName,
    patientPhone,
    clinicId: params.clinicId,
    clinicName: params.clinicName,
    doctorId: params.doctorId,
    doctorName: params.doctorName,
    serviceId: params.serviceId,
    serviceName: params.serviceName,
    scheduledAt: timestamp(params.scheduledAt),
    source: "walkIn",
    status: "arrived",
    tokenNumber,
    estimatedWaitMinutes: 10,
    notes: params.notes ?? null,
    createdAt: serverTimestamp(),
  });
  await refreshQueueDayFromAppointments(
    params.clinicId,
    params.doctorId,
    params.doctorName,
    params.scheduledAt,
  );
}

export async function cancelAppointment(appointment: Appointment) {
  if (!canCancelAppointment(appointment.scheduledAt, new Date())) {
    throw new Error("Appointments can only be cancelled until 5 minutes before the scheduled time.");
  }
  await updateAppointmentStatus(appointment, "cancelled");
}

export async function updateAppointmentStatus(
  appointment: Appointment,
  status: AppointmentStatus,
) {
  await updateDoc(doc(db(), FIRESTORE_PATHS.appointments, appointment.id), {
    status,
    ...(status === "arrived"
      ? {
          arrivalRequestStatus: appointment.arrivalRequestedByPatient ? "acknowledged" : null,
        }
      : {}),
  });

  if (appointment.patientId) {
    await logNotification({
      event: `appointment_${status}`,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      clinicId: appointment.clinicId,
      doctorId: appointment.doctorId,
      message: patientStatusMessage(status),
    });
  }

  await refreshQueueDayFromAppointments(
    appointment.clinicId,
    appointment.doctorId,
    appointment.doctorName,
    appointment.scheduledAt,
  );
}

export async function updatePatientProfile(
  uid: string,
  profile: {
    displayName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  },
) {
  const currentAuth = auth() as Auth;
  if (currentAuth.currentUser?.uid === uid) {
    await updateProfile(currentAuth.currentUser, {
      displayName: profile.displayName,
    });
  }

  const phoneNumber = validatePhoneNumber(profile.phoneNumber, "Phone number");
  const emergencyContactPhone = profile.emergencyContactPhone.trim()
    ? validatePhoneNumber(profile.emergencyContactPhone, "Emergency contact phone")
    : "";

  await setDoc(
    doc(db(), FIRESTORE_PATHS.users, uid),
    {
      displayName: profile.displayName,
      phoneNumber,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone,
    },
    { merge: true },
  );
}

export async function updatePatientNotificationPreferences(
  uid: string,
  preferences: {
    notificationsEnabled: boolean;
    nearAppointmentAlertsEnabled: boolean;
    appointmentTimeAlertsEnabled: boolean;
  },
) {
  await setDoc(
    doc(db(), FIRESTORE_PATHS.users, uid),
    preferences,
    { merge: true },
  );
}

export async function requestPatientArrival(appointment: Appointment) {
  await updateDoc(doc(db(), FIRESTORE_PATHS.appointments, appointment.id), {
    arrivalRequestedAt: serverTimestamp(),
    arrivalRequestedByPatient: true,
    arrivalRequestStatus: "pending",
  });

  if (appointment.patientId) {
    await logNotification({
      event: "arrival_request_received",
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      clinicId: appointment.clinicId,
      doctorId: appointment.doctorId,
      message: "Patient has arrived and is waiting for clinic acknowledgement.",
    });
  }
}

export async function upsertClinic(clinic: ClinicProfile) {
  await setDoc(doc(db(), FIRESTORE_PATHS.clinics, clinic.id), {
    name: clinic.name,
    phone: clinic.phone,
    address: clinic.address,
    timezone: clinic.timezone,
    queuePolicy: {
      lateCancelCutoffMinutes: clinic.lateCancelCutoffMinutes,
      missedBookingBlockDays: clinic.missedBookingBlockDays,
      allowWalkIns: clinic.allowWalkIns,
    },
  }, { merge: true });
}

export async function upsertDoctor(doctor: DoctorProfile) {
  await setDoc(doc(db(), FIRESTORE_PATHS.doctors, doctor.id), doctor, { merge: true });
}

export async function upsertService(service: ClinicService) {
  await setDoc(doc(db(), FIRESTORE_PATHS.services, service.id), service, { merge: true });
}

export async function saveAvailabilityRules(
  clinicId: string,
  doctorId: string,
  rules: DoctorAvailabilityRule[],
) {
  const batch = writeBatch(db());
  for (const rule of rules) {
    batch.set(
      doc(db(), FIRESTORE_PATHS.doctorAvailability, availabilityDocId(clinicId, doctorId, rule.weekday)),
      rule,
      { merge: true },
    );
  }
  await batch.commit();
}

export async function updateQueueDay(params: {
  clinicId: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  scheduledStartTime?: Date;
  actualStartTime?: Date;
  delayReason?: string;
  status?: QueueDayStatus;
}) {
  const ref = doc(db(), FIRESTORE_PATHS.queueDays, queueDayDocId(params.clinicId, params.doctorId, params.date));
  const snapshot = await getDoc(ref);
  const existing = snapshot.exists() ? mapQueueDay(snapshot.data()!) : null;

  await setDoc(ref, {
    clinicId: params.clinicId,
    doctorId: params.doctorId,
    doctorName: params.doctorName,
    dateKey: formatDateKey(params.date),
    scheduledStartTime: timestamp(
      params.scheduledStartTime ??
        existing?.scheduledStartTime ??
        new Date(params.date.getFullYear(), params.date.getMonth(), params.date.getDate(), 9, 0),
    ),
    actualStartTime: timestamp(
      params.actualStartTime ??
        existing?.actualStartTime ??
        params.scheduledStartTime ??
        new Date(params.date.getFullYear(), params.date.getMonth(), params.date.getDate(), 9, 0),
    ),
    delayReason: params.delayReason ?? existing?.delayReason ?? "",
    status: params.status ?? existing?.status ?? "scheduled",
  }, { merge: true });

  await refreshQueueDayFromAppointments(
    params.clinicId,
    params.doctorId,
    params.doctorName,
    params.date,
    {
      preserveStatus: params.status,
      preserveScheduledStartTime: params.scheduledStartTime,
      preserveActualStartTime: params.actualStartTime,
      preserveDelayReason: params.delayReason,
    },
  );
}

export async function registerDeviceToken(uid: string) {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_WEB_VAPID_KEY;
  if (!vapidKey) return;

  try {
    const messaging = await getFirebaseMessagingClient();
    if (!messaging) return;
    const { getToken } = await import("firebase/messaging");
    let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      serviceWorkerRegistration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
    }
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });
    if (!token) return;

    await setDoc(
      doc(db(), FIRESTORE_PATHS.users, uid, FIRESTORE_PATHS.deviceTokens, token),
      {
        token,
        platform: "web",
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    // ignore token registration failures in MVP
  }
}

async function nextTokenNumber(clinicId: string, doctorId: string, date: Date) {
  const appointments = await fetchAppointmentsForDoctorDay(clinicId, doctorId, date);
  const maxToken = appointments.reduce((current, appointment) => {
    const parsed = Number((appointment.tokenNumber ?? "0").replace(/[^0-9]/g, "")) || 0;
    return Math.max(current, parsed);
  }, 0);

  return String(maxToken === 0 ? 1 : maxToken + 1);
}

async function refreshQueueDayFromAppointments(
  clinicId: string,
  doctorId: string,
  doctorName: string,
  date: Date,
  preserve?: {
    preserveStatus?: QueueDayStatus;
    preserveScheduledStartTime?: Date;
    preserveActualStartTime?: Date;
    preserveDelayReason?: string;
  },
) {
  const appointments = await fetchAppointmentsForDoctorDay(clinicId, doctorId, date);
  const ref = doc(db(), FIRESTORE_PATHS.queueDays, queueDayDocId(clinicId, doctorId, date));
  const snapshot = await getDoc(ref);
  const existing = snapshot.exists() ? mapQueueDay(snapshot.data()!) : null;

  const active = appointments.filter(
    (item) => !["cancelled", "missed", "completed"].includes(item.status),
  );
  const inProgress = appointments.find((item) => item.status === "inProgress");
  const next = inProgress ??
    appointments.find((item) => item.status === "arrived" || item.status === "scheduled");

  const waits = appointments
    .map((item) => item.estimatedWaitMinutes ?? 12)
    .filter((value) => Number.isFinite(value));
  const averageWait =
    waits.length === 0
      ? 12
      : Math.round(waits.reduce((sum, value) => sum + value, 0) / waits.length);

  await setDoc(ref, {
    clinicId,
    doctorId,
    doctorName,
    dateKey: formatDateKey(date),
    scheduledStartTime: timestamp(
      preserve?.preserveScheduledStartTime ??
        existing?.scheduledStartTime ??
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0),
    ),
    actualStartTime: timestamp(
      preserve?.preserveActualStartTime ??
        existing?.actualStartTime ??
        preserve?.preserveScheduledStartTime ??
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0),
    ),
    delayReason: preserve?.preserveDelayReason ?? existing?.delayReason ?? "",
    status: preserve?.preserveStatus ?? existing?.status ?? "scheduled",
    nowServingToken: next?.tokenNumber ?? null,
    waitingCount: active.filter((item) => item.status === "scheduled" || item.status === "arrived").length,
    completedCount: appointments.filter((item) => item.status === "completed").length,
    averageWaitMinutes: averageWait,
  }, { merge: true });
}

async function logNotification(entry: Omit<NotificationLogEntry, "createdAt">) {
  await addDoc(collection(db(), FIRESTORE_PATHS.notificationLogs), {
    ...entry,
    createdAt: serverTimestamp(),
  });
}
