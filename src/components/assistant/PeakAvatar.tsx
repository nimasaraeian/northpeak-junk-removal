import { useId } from "react";
import { cx } from "@/lib/utils";

export function PeakAvatar({
  className,
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 64 64"
      className={cx("h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-shell`} x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#223A52" />
          <stop offset="1" stopColor="#1A3041" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0" cy="0" r="1" gradientTransform="translate(32 34) scale(20)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D6762B" stopOpacity="0.16" />
          <stop offset="1" stopColor="#D6762B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="32" cy="34" r="28" fill={`url(#${uid}-glow)`} className={animated ? "peak-avatar-glow" : undefined} />

      <rect x="10" y="14" width="44" height="40" rx="14" fill={`url(#${uid}-shell)`} />
      <rect
        x="10"
        y="14"
        width="44"
        height="40"
        rx="14"
        fill="none"
        stroke="#888887"
        strokeWidth="0.8"
        opacity="0.45"
      />

      <rect x="15" y="22" width="34" height="24" rx="11" fill="#EDEBE8" />

      {/* NorthPeak doorway / N negative space */}
      <path
        d="M26 26 V42 H30 V34 H34 V42 H38 V26 H34 V32 H30 V26 Z"
        fill="#1A3041"
        opacity="0.12"
      />

      <g className={animated ? "peak-avatar-eye peak-avatar-eye-left" : undefined}>
        <rect x="20" y="31" width="7" height="7" rx="2" fill="#D6762B" opacity="0.95" />
        <rect x="21.2" y="32.2" width="2.2" height="2.2" rx="0.6" fill="#FFF6EC" opacity="0.85" />
      </g>
      <g className={animated ? "peak-avatar-eye peak-avatar-eye-right" : undefined}>
        <rect x="37" y="31" width="7" height="7" rx="2" fill="#D6762B" opacity="0.95" />
        <rect x="38.2" y="32.2" width="2.2" height="2.2" rx="0.6" fill="#FFF6EC" opacity="0.85" />
      </g>

      <path
        d="M22 46 H42"
        stroke="#888887"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
