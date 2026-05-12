"use client";

import type { ReactNode } from "react";
import { useTheme } from "next-themes";
import * as React from "react";

function ToggleButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1.5 text-sm transition",
        "border border-border bg-surface hover:bg-surface-2",
        active ? "text-text" : "text-text-muted",
      ].join(" ")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveTheme = theme === "system" ? systemTheme : theme;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-muted">
        Current:{" "}
        <span className="text-text">
          {mounted ? effectiveTheme ?? "…" : "…"}
        </span>
      </span>
      <div className="flex flex-wrap gap-2">
        <ToggleButton
          active={mounted ? theme === "dark" : false}
          onClick={() => setTheme("dark")}
        >
          Dark
        </ToggleButton>
        <ToggleButton
          active={mounted ? theme === "light" : false}
          onClick={() => setTheme("light")}
        >
          Light
        </ToggleButton>
        <ToggleButton
          active={mounted ? theme === "system" : false}
          onClick={() => setTheme("system")}
        >
          System
        </ToggleButton>
      </div>
    </div>
  );
}
