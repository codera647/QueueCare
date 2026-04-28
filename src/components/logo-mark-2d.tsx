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

  // Keep these arcs < 180deg for the "leaf" look.
  const largeArcFlag = delta > 180 ? 1 : 0;
  const sweepFlag = 1; // clockwise

  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x2.toFixed(
    2,
  )} ${y2.toFixed(2)}`;
}

export function LogoMark2D({
  size = 240,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="QueueCare logo"
    >
      {/* Tuned to match the reference mark: slight tilt + offset centers */}
      <g transform="translate(200 0) scale(-1 1)">
        <g transform="rotate(18 100 100)">
          <path
            d={arcPath({ cx: 91, cy: 88, r: 54, startDeg: 235, endDeg: 25 })}
            stroke="#16A34A"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={arcPath({ cx: 109, cy: 112, r: 54, startDeg: 55, endDeg: 205 })}
            stroke="#A3E635"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}
