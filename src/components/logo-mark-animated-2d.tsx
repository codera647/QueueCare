"use client";

import { motion } from "framer-motion";
import * as React from "react";

function arcPath({
  cx,
  cy,
  r,
  startDeg,
  endDeg,
}: {
  cx: number;
  cy: number;
  r: number;
  startDeg: number;
  endDeg: number;
}) {
  const s = startDeg;
  let e = endDeg;
  while (e < s) e += 360;
  const delta = e - s;

  const start = (s * Math.PI) / 180;
  const end = (e * Math.PI) / 180;

  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);

  const largeArcFlag = delta > 180 ? 1 : 0;
  const sweepFlag = 1; // clockwise

  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x2.toFixed(
    2,
  )} ${y2.toFixed(2)}`;
}

export function LogoMarkAnimated2D({
  size = 240,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const commonTransition = {
    duration: 1.2,
    delay: 0.07,
    ease: [0.22, 1, 0.36, 1] as const, // easeOutCubic-ish
  };

  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="QueueCare logo"
      initial="hidden"
      animate="shown"
    >
      {/* Mirror to match reference mark */}
      <g transform="translate(200 0) scale(-1 1)">
        <g transform="rotate(18 100 100)">
          <motion.g
            variants={{
              hidden: { opacity: 0, scale: 0.15, rotate: -55, x: -10, y: 10 },
              shown: { opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 },
            }}
            transition={commonTransition}
            style={{
              transformOrigin: "100px 100px",
              transformBox: "fill-box",
            }}
          >
            <path
              d={arcPath({ cx: 91, cy: 88, r: 54, startDeg: 235, endDeg: 25 })}
              stroke="#16A34A"
              strokeWidth="32"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>

          <motion.g
            variants={{
              hidden: { opacity: 0, scale: 0.15, rotate: 55, x: 10, y: -10 },
              shown: { opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 },
            }}
            transition={{ ...commonTransition, delay: commonTransition.delay + 0.02 }}
            style={{
              transformOrigin: "100px 100px",
              transformBox: "fill-box",
            }}
          >
            <path
              d={arcPath({ cx: 109, cy: 112, r: 54, startDeg: 55, endDeg: 205 })}
              stroke="#A3E635"
              strokeWidth="32"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </g>
      </g>
    </motion.svg>
  );
}
