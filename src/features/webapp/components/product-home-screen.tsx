"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "../context/auth-context";
import { ConfigRequiredScreen } from "./config-required";
import { RoleEntryScreen } from "./role-entry-screen";

export function ProductHomeScreen() {
  const router = useRouter();
  const session = useAuthSession();

  useEffect(() => {
    if (!session.configured || session.loading || !session.user || !session.profile) {
      return;
    }

    if (
      session.user.providerData.some((item) => item.providerId === "password") &&
      !session.user.emailVerified
    ) {
      router.replace("/app/auth/verify-email");
      return;
    }

    router.replace(session.profile.role === "patient" ? "/app/patient" : "/app/clinic");
  }, [router, session]);

  if (!session.configured) {
    return <ConfigRequiredScreen />;
  }

  if (session.loading) {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-[#FAF7F0]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DDF8E8] border-t-[#16A34A]" />
      </div>
    );
  }

  if (!session.user || !session.profile) {
    return <RoleEntryScreen />;
  }

  return null;
}
