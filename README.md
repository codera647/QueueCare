# QueueCare Web

This Next.js app now contains:

- the marketing landing page at `/`
- the full QueueCare product app at `/app`

## Product routes

- `/app`
- `/app/auth/login/patient`
- `/app/auth/register/patient`
- `/app/auth/login/clinic`
- `/app/auth/register/clinic`
- `/app/auth/forgot-password/[audience]`
- `/app/auth/verify-email`
- `/app/patient`
- `/app/patient/book`
- `/app/clinic`
- `/app/clinic/settings`

## Firebase setup

The web app uses the same Firebase project as mobile and expects the named Firestore database:

- `default`

Copy `.env.example` to `.env.local` and fill in your Firebase Web App values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_FIREBASE_WEB_API_KEY`
- `NEXT_PUBLIC_FIREBASE_WEB_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_WEB_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_WEB_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_WEB_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_WEB_APP_ID`

Optional variables:

- `NEXT_PUBLIC_FIREBASE_WEB_MEASUREMENT_ID`
- `NEXT_PUBLIC_FIREBASE_WEB_VAPID_KEY`

## Web push notifications

The web app now supports:

- foreground notification toasts while the tab is open
- FCM browser push through `/firebase-messaging-sw.js`
- patient notification preferences in `/app/patient/settings`
- Firebase Cloud Functions for appointment reminders and status updates

For full browser push you still need:

1. a valid `NEXT_PUBLIC_FIREBASE_WEB_VAPID_KEY`
2. browser notification permission granted by the patient
3. the Firebase Functions workspace in `web/functions` installed and deployed

## Install and run

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:3000` for the landing page
- `http://localhost:3000/app` for the product app

## Current feature coverage

### Clinic

- email/password and Google auth
- session restore and email verification gate
- doctor switching and selected-date dashboard
- walk-ins
- appointment state updates
- queue start, pause, resume, close
- clinic profile, doctors, services
- weekly doctor availability
- daily queue override with reason

### Patient

- email/password and Google auth
- clinic browse
- doctor/service/date/slot booking flow
- live active booking tracker
- upcoming bookings and history
- cancellation rules aligned with mobile
- patient settings and notification preferences
- patient arrival request button for same-day visits

## Notes

- The landing page keeps its current design and now links into the product app.
- Web push token registration is wired, but full outbound push delivery still needs backend trigger logic.
