"use client";

import { LogoMarkAnimated2D } from "@/components/logo-mark-animated-2d";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-[#FAF7F0]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className={[
            "absolute inset-0 opacity-70 blur-2xl",
            "[background:radial-gradient(800px_circle_at_20%_20%,rgba(22,163,74,0.14),transparent_60%),radial-gradient(800px_circle_at_80%_50%,rgba(163,230,53,0.10),transparent_62%),radial-gradient(700px_circle_at_50%_90%,rgba(6,182,212,0.06),transparent_58%)]",
          ].join(" ")}
        />
      </div>
      <div className="flex flex-col items-center">
        <LogoMarkAnimated2D size={240} />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
