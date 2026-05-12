# QueueCare Web Functions

These Firebase Cloud Functions handle:

- 15-minute appointment reminders
- appointment-time reminders
- appointment status push notifications for `arrived`, `inProgress`, and `completed`

## Setup

1. Install Firebase CLI and authenticate
2. From `web/functions`, run:

```bash
npm install
npm run build
```

3. Deploy from the `web` directory with a Firebase project already linked:

```bash
firebase deploy --only functions
```

## Notes

- The web client stores device tokens under `users/{uid}/device_tokens`
- Invalid FCM tokens are pruned automatically when FCM reports them as expired/invalid
- Scheduled reminders assume the patient has enabled notification preferences in the web app
