"use client";

import * as React from "react";
import {
  getFirebaseMessagingClient,
  firebaseWebConfigured,
} from "../lib/firebase";
import { registerDeviceToken } from "../lib/repository";
import { useAuthSession } from "./auth-context";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
};

type NotificationContextValue = {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<boolean>;
  messages: NotificationItem[];
  dismissMessage: (id: string) => void;
};

const NotificationContext = React.createContext<NotificationContextValue>({
  supported: false,
  permission: "unsupported",
  requestPermission: async () => false,
  messages: [],
  dismissMessage: () => undefined,
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthSession();
  const [supported, setSupported] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">(
    "unsupported",
  );
  const [messages, setMessages] = React.useState<NotificationItem[]>([]);

  React.useEffect(() => {
    let mounted = true;
    if (!firebaseWebConfigured || typeof window === "undefined") {
      return;
    }

    getFirebaseMessagingClient().then((messaging) => {
      if (!mounted) return;
      const canUseNotifications =
        messaging !== null && typeof Notification !== "undefined";
      setSupported(canUseNotifications);
      setPermission(
        canUseNotifications ? Notification.permission : "unsupported",
      );

      if (!messaging) return;
      import("firebase/messaging").then(({ onMessage }) => {
        onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? "QueueCare update";
          const body = payload.notification?.body ?? "You have a new update.";
          setMessages((current) => [
            { id: crypto.randomUUID(), title, body },
            ...current,
          ]);
        });
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!supported || permission !== "granted" || !user?.uid) return;
    registerDeviceToken(user.uid);
  }, [permission, supported, user?.uid]);

  const requestPermission = React.useCallback(async () => {
    if (!supported || typeof Notification === "undefined") return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, [supported]);

  const dismissMessage = React.useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        supported,
        permission,
        requestPermission,
        messages,
        dismissMessage,
      }}
    >
      {children}
      {messages.length > 0 ? (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className="pointer-events-auto rounded-2xl border border-[rgba(16,32,24,0.08)] bg-white p-4 shadow-[0_16px_40px_rgba(16,32,24,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#102018]">{message.title}</p>
                  <p className="mt-1 text-sm text-[#4B5B52]">{message.body}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissMessage(message.id)}
                  className="text-sm font-semibold text-[#0F7A3A]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </NotificationContext.Provider>
  );
}

export function useNotificationCenter() {
  return React.useContext(NotificationContext);
}
