import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_WEB_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_WEB_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_WEB_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_WEB_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_WEB_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_WEB_APP_ID,
  };

  const body = `
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'QueueCare';
  const options = {
    body: payload.notification?.body || 'You have a QueueCare update.',
    icon: '/favicon.svg',
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification?.data?.link || '/app/patient';
  event.waitUntil(clients.openWindow(target));
});
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
