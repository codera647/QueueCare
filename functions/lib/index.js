"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyUpcomingAppointments = exports.sendAppointmentStatusNotifications = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
const databaseId = "default";
const nearMinutes = 15;
const appointmentCollection = "appointments";
const userCollection = "users";
const deviceTokenCollection = "device_tokens";
const notificationLogCollection = "notification_logs";
function isSameMinute(left, right) {
    return (left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate() &&
        left.getHours() === right.getHours() &&
        left.getMinutes() === right.getMinutes());
}
async function fetchTokens(uid) {
    const snapshot = await db
        .collection(userCollection)
        .doc(uid)
        .collection(deviceTokenCollection)
        .get();
    return snapshot.docs.map((doc) => doc.id);
}
async function writeNotificationLog(entry) {
    await db.collection(notificationLogCollection).add({
        ...entry,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}
async function sendPatientNotification(params) {
    const tokens = await fetchTokens(params.patientId);
    if (tokens.length === 0) {
        return { delivered: 0, invalidTokens: [] };
    }
    const response = await messaging.sendEachForMulticast({
        tokens,
        notification: {
            title: params.title,
            body: params.body,
        },
        data: {
            ...params.data,
            link: params.link,
        },
        webpush: {
            fcmOptions: {
                link: params.link,
            },
        },
    });
    const invalidTokens = response.responses
        .map((item, index) => ({ item, token: tokens[index] }))
        .filter(({ item }) => !item.success &&
        item.error?.code !== undefined &&
        [
            "messaging/invalid-registration-token",
            "messaging/registration-token-not-registered",
        ].includes(item.error.code))
        .map(({ token }) => token);
    await Promise.all(invalidTokens.map((token) => db.collection(userCollection).doc(params.patientId).collection(deviceTokenCollection).doc(token).delete()));
    return {
        delivered: response.successCount,
        invalidTokens,
    };
}
exports.sendAppointmentStatusNotifications = (0, firestore_1.onDocumentUpdated)({
    document: `${appointmentCollection}/{appointmentId}`,
    database: databaseId,
    region: "us-central1",
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const appointmentId = event.params.appointmentId;
    if (!before || !after || !after.patientId)
        return;
    if (before.status !== after.status) {
        const allowedStatuses = ["arrived", "inProgress", "completed"];
        if (!allowedStatuses.includes(after.status))
            return;
        if (after.notificationState?.lastStatusSent === after.status)
            return;
        const title = "QueueCare appointment update";
        const body = after.status === "arrived"
            ? "Clinic has acknowledged your arrival."
            : after.status === "inProgress"
                ? "It is your turn now."
                : "Your appointment has been completed.";
        await sendPatientNotification({
            patientId: after.patientId,
            title,
            body,
            link: "/app/patient",
            data: {
                event: `appointment_status_${after.status}`,
                appointmentId,
            },
        });
        await writeNotificationLog({
            event: `appointment_status_${after.status}`,
            patientId: after.patientId,
            appointmentId,
            clinicId: after.clinicId,
            doctorId: after.doctorId,
            message: body,
        });
        await event.data?.after.ref.set({
            notificationState: {
                ...(after.notificationState ?? {}),
                lastStatusSent: after.status,
            },
        }, { merge: true });
    }
});
exports.notifyUpcomingAppointments = (0, scheduler_1.onSchedule)({
    schedule: "every 5 minutes",
    region: "us-central1",
}, async () => {
    const now = new Date();
    const soonCutoff = new Date(now.getTime() + nearMinutes * 60 * 1000);
    const appointmentSnapshot = await db
        .collection(appointmentCollection)
        .where("scheduledAt", ">=", admin.firestore.Timestamp.fromDate(now))
        .where("scheduledAt", "<=", admin.firestore.Timestamp.fromDate(soonCutoff))
        .get();
    await Promise.all(appointmentSnapshot.docs.map(async (document) => {
        const appointment = document.data();
        if (!appointment.patientId)
            return;
        if (!["scheduled", "arrived"].includes(appointment.status))
            return;
        const appointmentDate = appointment.scheduledAt.toDate();
        const nearTarget = new Date(appointmentDate.getTime() - nearMinutes * 60 * 1000);
        const shouldSendNear = isSameMinute(now, nearTarget) &&
            appointment.notificationState?.nearSentAt === undefined;
        const shouldSendNow = isSameMinute(now, appointmentDate) &&
            appointment.notificationState?.nowSentAt === undefined;
        if (!shouldSendNear && !shouldSendNow)
            return;
        const userDoc = await db.collection(userCollection).doc(appointment.patientId).get();
        const userData = userDoc.data();
        if (!userData?.notificationsEnabled)
            return;
        if (shouldSendNear && userData.nearAppointmentAlertsEnabled === false)
            return;
        if (shouldSendNow && userData.appointmentTimeAlertsEnabled === false)
            return;
        const eventName = shouldSendNow ? "appointment_now" : "appointment_near";
        const title = shouldSendNow
            ? "It’s time for your appointment"
            : "Your appointment is coming up";
        const body = shouldSendNow
            ? `${appointment.clinicName ?? "QueueCare"} is ready for you now.`
            : `${appointment.serviceName ?? "Your visit"} starts in ${nearMinutes} minutes.`;
        await sendPatientNotification({
            patientId: appointment.patientId,
            title,
            body,
            link: "/app/patient",
            data: {
                event: eventName,
                appointmentId: document.id,
            },
        });
        await writeNotificationLog({
            event: eventName,
            patientId: appointment.patientId,
            appointmentId: document.id,
            clinicId: appointment.clinicId,
            doctorId: appointment.doctorId,
            message: body,
        });
        await document.ref.set({
            notificationState: {
                ...(appointment.notificationState ?? {}),
                ...(shouldSendNear
                    ? { nearSentAt: admin.firestore.FieldValue.serverTimestamp() }
                    : {}),
                ...(shouldSendNow
                    ? { nowSentAt: admin.firestore.FieldValue.serverTimestamp() }
                    : {}),
            },
        }, { merge: true });
    }));
    firebase_functions_1.logger.info("Processed appointment reminder notifications.");
});
