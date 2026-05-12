"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CalendarDays, Home, LogOut, Settings, UserRound } from "lucide-react";
import { LogoMark2D } from "@/components/logo-mark-2d";
import { useAuthSession } from "../context/auth-context";
import { logout } from "../lib/repository";

export function ProductFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuthSession();
  const isAuthRoute = pathname.startsWith("/app/auth");

  const navItems =
    profile?.role === "patient"
      ? [
          { href: "/app/patient", label: "Dashboard", icon: Home },
          { href: "/app/patient/book", label: "Book", icon: CalendarDays },
          { href: "/app/patient/settings", label: "Settings", icon: Settings },
        ]
      : [
          { href: "/app/clinic", label: "Dashboard", icon: Building2 },
          { href: "/app/clinic/settings", label: "Settings", icon: Settings },
        ];

  const signOut = async () => {
    await logout();
    router.replace("/app");
  };

  if (isAuthRoute || pathname === "/app" || pathname === "/app/auth/verify-email") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100svh] bg-[#FAF7F0] text-[#102018]">
      <div className="grid min-h-[100svh] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-[rgba(16,32,24,0.08)] bg-white/80 p-6 backdrop-blur lg:flex lg:flex-col">
          <Link href="/app" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF9EF]">
              <LogoMark2D size={26} />
            </div>
            <div>
              <p className="text-lg font-bold">QueueCare</p>
              <p className="text-sm text-[#5B6B63]">Web workspace</p>
            </div>
          </Link>

          <div className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                    active
                      ? "bg-[#EAF9EF] text-[#0F7A3A]"
                      : "text-[#4B5B52] hover:bg-[#F3F7F4]",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto rounded-3xl bg-[#F7FAF8] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF9EF] text-[#16A34A]">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{profile?.displayName ?? "QueueCare User"}</p>
                <p className="truncate text-sm text-[#5B6B63]">{profile?.email ?? ""}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(16,32,24,0.08)] bg-white px-4 py-3 text-sm font-semibold text-[#102018]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          {!isAuthRoute ? (
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[rgba(16,32,24,0.08)] bg-[#FAF7F0]/90 px-4 py-4 backdrop-blur lg:hidden">
              <Link href="/app" className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#EAF9EF]">
                  <LogoMark2D size={22} />
                </div>
                <span className="font-semibold">QueueCare</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-xl border border-[rgba(16,32,24,0.08)] bg-white px-3 py-2 text-sm font-semibold"
              >
                Sign out
              </button>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
