"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Download,
  Home,
  MessageCircle,
  Sparkles,
  Monitor,
  Mail,
} from "lucide-react";
import * as React from "react";
import { motion } from "framer-motion";
import { LogoMark2D } from "@/components/logo-mark-2d";
import styles from "./animated-sidebar.module.css";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { id: "hero", label: "Hero", icon: Home },
  { id: "features", label: "Features", icon: Sparkles },
  { id: "product", label: "Product", icon: Monitor },
  { id: "contact", label: "Contact", icon: Mail },
];

function isCoarsePointer() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia?.("(pointer: coarse)").matches ||
    window.matchMedia?.("(hover: none)").matches
  );
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function AnimatedSidebar() {
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [disableHill, setDisableHill] = React.useState(true);

  React.useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    setDisableHill(isCoarsePointer());
  }, []);

  const sidebarRef = React.useRef<HTMLElement | null>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const hillHeight = 98;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [hillY, setHillY] = React.useState(0);

  const recalcHill = React.useCallback(() => {
    const root = sidebarRef.current;
    const activeButton = itemRefs.current[activeIndex];
    if (!root || !activeButton) return;
    const rootRect = root.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    const y = buttonRect.top - rootRect.top + buttonRect.height / 2 - hillHeight / 2;
    setHillY(y);
  }, [activeIndex, hillHeight]);

  React.useEffect(() => {
    recalcHill();
  }, [recalcHill]);

  React.useEffect(() => {
    const sectionEls = navItems
      .map((item) => {
        const el = document.getElementById(item.id);
        if (!el) {
          console.warn(`[AnimatedSidebar] Missing section id="#${item.id}"`);
        }
        return el;
      })
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sectionEls.length) return;

    let frame = 0;

    const updateActiveSection = () => {
      const probeY = window.innerHeight * 0.34;

      const containingSection = sectionEls.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= probeY && rect.bottom >= probeY;
      });

      let nextId = containingSection?.id;

      if (!nextId) {
        const nearest = sectionEls
          .map((section) => {
            const rect = section.getBoundingClientRect();
            return {
              id: section.id,
              distance: Math.abs(rect.top - probeY),
            };
          })
          .sort((a, b) => a.distance - b.distance)[0];

        nextId = nearest?.id;
      }

      if (!nextId) return;

      const idx = navItems.findIndex((item) => item.id === nextId);
      if (idx >= 0) {
        setActiveIndex((current) => (current === idx ? current : idx));
      }
    };

    const onScrollOrResize = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        updateActiveSection();
        recalcHill();
      });
    };

    updateActiveSection();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [activeIndex, recalcHill]);

  const onNavClick = (id: string, index: number) => {
    setActiveIndex(index);
    // Move immediately (before scroll finishes)
    window.requestAnimationFrame(() => recalcHill());
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <aside
        className={styles.sidebar}
        aria-label="QueueCare navigation"
        ref={sidebarRef}
      >
        <motion.div
          className={styles.hill}
          aria-hidden="true"
          animate={{ y: hillY }}
          transition={
            reduceMotion || disableHill
              ? { duration: 0 }
              : { type: "spring", stiffness: 230, damping: 28 }
          }
        />

        <motion.div
          className={styles.bg}
          aria-hidden="true"
        />

        <div className={styles.content}>
          <div className={styles.logoBox}>
            <LogoMark2D size={30} />
          </div>

          <nav className={styles.nav} aria-label="Sections">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavClick(item.id, index)}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className={[
                    styles.navButton,
                    isActive ? styles.navButtonActive : "",
                  ].join(" ")}
                  aria-label={item.label}
                  aria-current={isActive ? "true" : undefined}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </nav>

          <div className={styles.ctaWrap} aria-label="Quick actions">
            <Link
              href="/app"
              className={styles.ctaButton}
              aria-label="Launch app"
            >
              <Download size={18} />
              <span className={styles.ctaTooltip}>Launch App</span>
            </Link>

            <Link
              href="/app/auth/login/clinic"
              className={[styles.ctaButton, styles.ctaButtonStrong].join(" ")}
              aria-label="Clinic sign in"
            >
              <MessageCircle size={18} />
              <span className={styles.ctaTooltip}>Clinic Sign In</span>
            </Link>
          </div>
        </div>
      </aside>

      <nav
        className="fixed inset-x-4 bottom-4 z-50 flex items-center gap-2 rounded-[24px] border border-[rgba(22,163,74,0.14)] bg-white/92 p-2 shadow-[0_20px_50px_rgba(16,32,24,0.12)] backdrop-blur-md lg:hidden"
        aria-label="Mobile sections"
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavClick(item.id, index)}
              className={[
                "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-[11px] font-semibold transition-colors",
                isActive
                  ? "bg-[#EAF9EF] text-[#0F7A3A]"
                  : "text-[#5B6B63]",
              ].join(" ")}
              aria-label={item.label}
              aria-current={isActive ? "true" : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
