"use client";

import * as React from "react";
import styles from "./bubble-cursor.module.css";

type BubbleCursorProps = {
  size?: number;
  followLerp?: number;
};

function isCoarsePointer() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia?.("(pointer: coarse)").matches ||
    window.matchMedia?.("(hover: none)").matches
  );
}

function isClickableElement(el: Element | null) {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const clickable = node.closest(
    [
      "a[href]",
      "button",
      "[role='button']",
      "input",
      "select",
      "textarea",
      "[data-cursor='pointer']",
    ].join(","),
  ) as HTMLElement | null;

  if (!clickable) return false;

  // Respect disabled states
  if (clickable instanceof HTMLButtonElement && clickable.disabled) return false;
  if (clickable instanceof HTMLInputElement && clickable.disabled) return false;
  if (clickable instanceof HTMLSelectElement && clickable.disabled) return false;
  if (clickable instanceof HTMLTextAreaElement && clickable.disabled) return false;
  if (clickable.getAttribute("aria-disabled") === "true") return false;

  return true;
}

export function BubbleCursor({
  size = 44,
  followLerp = 0.16,
}: BubbleCursorProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const targetRef = React.useRef({ x: 0, y: 0 });
  const currentRef = React.useRef({ x: 0, y: 0 });
  const visibleRef = React.useRef(false);

  const hoverRef = React.useRef(false);
  const downRef = React.useRef(false);
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    if (isCoarsePointer()) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, []);

  React.useEffect(() => {
    if (!enabled) return;

    const root = rootRef.current;
    if (!root) return;

    document.documentElement.classList.add("qc-cursor-enabled");

    root.style.setProperty("--qc-cursor-size", `${size}px`);
    root.style.setProperty("--qc-follow-lerp", `${followLerp}`);

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX;
      const y = e.clientY;
      targetRef.current.x = x;
      targetRef.current.y = y;

      if (!visibleRef.current) {
        visibleRef.current = true;
        currentRef.current.x = x;
        currentRef.current.y = y;
        root.classList.add(styles.visible);
      }

      const el = document.elementFromPoint(x, y);
      const shouldHover = isClickableElement(el);
      if (shouldHover !== hoverRef.current) {
        hoverRef.current = shouldHover;
        root.classList.toggle(styles.hover, shouldHover);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      downRef.current = true;
      root.classList.add(styles.down);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      downRef.current = false;
      // Soft “release” after a short moment to feel liquid.
      window.setTimeout(() => {
        root.classList.remove(styles.down);
      }, 90);
    };

    const onMouseLeave = () => {
      visibleRef.current = false;
      root.classList.remove(styles.visible);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("blur", onMouseLeave);
    document.addEventListener("mouseleave", onMouseLeave);

    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;

      c.x += (t.x - c.x) * followLerp;
      c.y += (t.y - c.y) * followLerp;

      root.style.setProperty("--qc-x", `${c.x.toFixed(2)}px`);
      root.style.setProperty("--qc-y", `${c.y.toFixed(2)}px`);

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("qc-cursor-enabled");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("blur", onMouseLeave);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, followLerp, size]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      className={styles.cursor}
      style={
        {
          // Theme-tweakable tokens (can be overridden in globals.css)
          ["--qc-cursor-glow" as never]: "rgba(22, 163, 74, 0.35)", // #16a34a
          ["--qc-cursor-tint" as never]: "rgba(22, 163, 74, 0.14)",
          ["--qc-cursor-edge" as never]: "rgba(163, 230, 53, 0.35)", // #a3e635
          ["--qc-cursor-highlight" as never]: "rgba(255, 255, 255, 0.45)",
        } as React.CSSProperties
      }
      aria-hidden="true"
    />
  );
}
