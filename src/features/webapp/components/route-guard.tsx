"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthSession } from "../context/auth-context";
import { ConfigRequiredScreen } from "./config-required";

export function RequireAuth({
  audience,
  children,
}: {
  audience: "patient" | "clinic";
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthSession();

  useEffect(() => {
    if (!session.configured || session.loading) return;
    if (!session.user) {
      router.replace(
        audience === "patient"
          ? "/app/auth/login/patient"
          : "/app/auth/login/clinic",
      );
      return;
    }

    if (
      session.user &&
      !session.user.emailVerified &&
      session.user.providerData.some((item) => item.providerId === "password")
    ) {
      router.replace("/app/auth/verify-email");
      return;
    }

    if (
      audience === "patient" &&
      session.profile &&
      session.profile.role !== "patient"
    ) {
      router.replace("/app/clinic");
      return;
    }

    if (
      audience === "clinic" &&
      session.profile &&
      session.profile.role === "patient"
    ) {
      router.replace("/app/patient");
    }
  }, [audience, pathname, router, session]);

  if (!session.configured) return <ConfigRequiredScreen />;
  if (session.loading) {
    return (
      <div className="grid min-h-[60svh] place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DDF8E8] border-t-[#16A34A]" />
      </div>
    );
  }
  if (!session.user) return null;
  if (
    !session.user.emailVerified &&
    session.user.providerData.some((item) => item.providerId === "password")
  ) {
    return null;
  }
  if (audience === "patient" && session.profile?.role !== "patient") return null;
  if (audience === "clinic" && session.profile?.role === "patient") return null;

  return <>{children}</>;
}
