"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  getMessaging,
  isSupported as isMessagingSupported,
  type Messaging,
} from "firebase/messaging";
import { FIRESTORE_DB_ID } from "./constants";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_WEB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_WEB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_WEB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_WEB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_WEB_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_WEB_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_WEB_MEASUREMENT_ID,
};

export const firebaseWebConfigured = Boolean(
  config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId,
);

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedMessaging: Promise<Messaging | null> | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseWebConfigured) {
    throw new Error("Firebase web app config is missing.");
  }

  if (cachedApp) return cachedApp;
  cachedApp = getApps().length ? getApp() : initializeApp(config);
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(getFirebaseApp());
  return cachedAuth;
}

export function getFirebaseDb(): Firestore {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(getFirebaseApp(), FIRESTORE_DB_ID);
  return cachedDb;
}

export async function getFirebaseMessagingClient(): Promise<Messaging | null> {
  if (cachedMessaging) return cachedMessaging;
  cachedMessaging = (async () => {
    if (!firebaseWebConfigured || typeof window === "undefined") {
      return null;
    }
    const supported = await isMessagingSupported();
    if (!supported) {
      return null;
    }
    return getMessaging(getFirebaseApp());
  })();

  return cachedMessaging;
}

export function getGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export function getFirebaseConfigSummary(): string[] {
  return [
    "NEXT_PUBLIC_FIREBASE_WEB_API_KEY",
    "NEXT_PUBLIC_FIREBASE_WEB_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_WEB_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_WEB_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_WEB_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_WEB_APP_ID",
  ];
}
