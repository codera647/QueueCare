"use client";

import type { LucideIcon } from "lucide-react";
import {
  Home,
  Sparkles,
  Info,
  Monitor,
  MessageCircle,
  Users,
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
  { id: "about", label: "About", icon: Info },
  { id: "product", label: "Product", icon: Monitor },
  { id: "reviews", label: "Reviews", icon: MessageCircle },
  { id: "team", label: "Team", icon: Users },
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
  const [disabled, setDisabled] = React.useState(true);

  React.useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    setDisabled(isCoarsePointer());
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
    if (disabled) return;

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
  }, [activeIndex, disabled, recalcHill]);

  const onNavClick = (id: string, index: number) => {
    setActiveIndex(index);
    // Move immediately (before scroll finishes)
    window.requestAnimationFrame(() => recalcHill());
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside
      className={styles.sidebar}
      aria-label="QueueCare navigation"
      ref={sidebarRef}
    >
      {/* z-index: 1 (behind the sidebar surface) */}
      <motion.div
        className={styles.hill}
        aria-hidden="true"
        animate={{ y: hillY }}
        transition={
          reduceMotion || disabled
            ? { duration: 0 }
            : { type: "spring", stiffness: 230, damping: 28 }
        }
      />

      {/* z-index: 2 */}
      <motion.div
        className={styles.bg}
        aria-hidden="true"
      />

      {/* z-index: 3 */}
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
      </div>
    </aside>
  );
}
