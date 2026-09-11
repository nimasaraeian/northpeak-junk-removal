import { useId } from "react";
import { cx } from "@/lib/utils";

export function GuideRobotFace({
  blinking = true,
  className,
}: {
  blinking?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 64 64"
      className={cx("h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-head`} x1="32" y1="8" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#223A52" />
          <stop offset="0.45" stopColor="#0C1B2E" />
          <stop offset="1" stopColor="#071018" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE4A8" />
          <stop offset="0.45" stopColor="#FBB24A" />
          <stop offset="1" stopColor="#C47A1E" />
        </linearGradient>
        <linearGradient id={`${uid}-visor`} x1="32" y1="26" x2="32" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#152A40" />
          <stop offset="1" stopColor="#0A1524" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0" cy="0" r="1" gradientTransform="translate(32 34) scale(24)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBB24A" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FBB24A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-iris`} cx="0" cy="0" r="1" gradientTransform="translate(0 0) scale(3.5)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1A3041" />
          <stop offset="0.7" stopColor="#0C1B2E" />
          <stop offset="1" stopColor="#071018" />
        </radialGradient>
        <radialGradient id={`${uid}-antenna`} cx="0" cy="0" r="1" gradientTransform="translate(32 8) scale(5.5)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8E8" />
          <stop offset="0.35" stopColor="#FDD48A" />
          <stop offset="1" stopColor="#D0892B" />
        </radialGradient>
        <filter id={`${uid}-glow-filter`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient halo */}
      <circle cx="32" cy="34" r="29" fill={`url(#${uid}-glow)`} />

      {/* Head — soft rounded square */}
      <rect x="9" y="13" width="46" height="43" rx="18" fill={`url(#${uid}-head)`} />
      <rect
        x="9"
        y="13"
        width="46"
        height="43"
        rx="18"
        fill="none"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="1.35"
        opacity="0.92"
      />

      {/* Forehead — NorthPeak pillars */}
      <g opacity="0.96">
        <rect x="21.5" y="17.5" width="6.5" height="10" rx="1.1" fill="#071018" stroke="#2E4A66" strokeWidth="0.35" />
        <rect x="36" y="17.5" width="6.5" height="10" rx="1.1" fill="#071018" stroke="#2E4A66" strokeWidth="0.35" />
        <rect x="28.5" y="18.5" width="7" height="8.5" rx="0.9" fill={`url(#${uid}-gold)`} />
        <rect x="30" y="19.5" width="4" height="6.5" rx="0.5" fill="#FFF3D6" opacity="0.35" />
      </g>

      {/* Visor / face screen */}
      <rect x="13.5" y="28.5" width="37" height="23" rx="11.5" fill={`url(#${uid}-visor)`} />
      <rect
        x="13.5"
        y="28.5"
        width="37"
        height="23"
        rx="11.5"
        fill="none"
        stroke="#F0A033"
        strokeWidth="0.55"
        opacity="0.45"
      />
      <ellipse cx="32" cy="40" rx="14" ry="8" fill="#FBB24A" opacity="0.04" />

      {/* Eyebrows — friendly arch */}
      <path
        d="M17.5 33.5 Q23 31 26.5 33"
        fill="none"
        stroke="#FBB24A"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M37.5 33 Q41 31 46.5 33.5"
        fill="none"
        stroke="#FBB24A"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Left eye */}
      <g className={blinking ? "guide-robot-eye guide-robot-eye-left" : undefined}>
        <ellipse cx="23.5" cy="38.5" rx="6.8" ry="7.4" fill="#FAF6EE" />
        <ellipse cx="23.5" cy="38.5" rx="6.8" ry="7.4" fill="none" stroke="#F0A033" strokeWidth="0.5" opacity="0.4" />
        <circle cx="24" cy="39.5" r="3.6" fill={`url(#${uid}-iris)`} />
        <circle cx="25.4" cy="37.6" r="1.35" fill="#FAF6EE" opacity="0.98" />
        <circle cx="22.8" cy="40.2" r="0.55" fill="#FAF6EE" opacity="0.55" />
      </g>

      {/* Right eye */}
      <g className={blinking ? "guide-robot-eye guide-robot-eye-right" : undefined}>
        <ellipse cx="40.5" cy="38.5" rx="6.8" ry="7.4" fill="#FAF6EE" />
        <ellipse cx="40.5" cy="38.5" rx="6.8" ry="7.4" fill="none" stroke="#F0A033" strokeWidth="0.5" opacity="0.4" />
        <circle cx="40" cy="39.5" r="3.6" fill={`url(#${uid}-iris)`} />
        <circle cx="41.4" cy="37.6" r="1.35" fill="#FAF6EE" opacity="0.98" />
        <circle cx="38.8" cy="40.2" r="0.55" fill="#FAF6EE" opacity="0.55" />
      </g>

      {/* Cheeks */}
      <ellipse cx="16.5" cy="43.5" rx="3.8" ry="2.3" fill="#FBB24A" opacity="0.22" />
      <ellipse cx="47.5" cy="43.5" rx="3.8" ry="2.3" fill="#FBB24A" opacity="0.22" />

      {/* Smile — warm curve with dimple hints */}
      <path
        d="M24 45.2 Q32 50.5 40 45.2"
        fill="none"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M27 46.2 Q32 48.8 37 46.2"
        fill="none"
        stroke="#FFE4A8"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Antenna */}
      <path
        d="M32 13 C32 9.5 32 7 32 5.5"
        fill="none"
        stroke="#F0A033"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle
        cx="32"
        cy="4.8"
        r="3.4"
        fill={`url(#${uid}-antenna)`}
        filter={`url(#${uid}-glow-filter)`}
        className="guide-robot-antenna"
      />
      <circle cx="31.2" cy="3.8" r="0.9" fill="#FFF8E8" opacity="0.85" />

      {/* Side panels */}
      <rect x="5.5" y="31" width="4.5" height="13" rx="2.2" fill="#16324F" stroke="#F0A033" strokeWidth="0.4" opacity="0.82" />
      <rect x="54" y="31" width="4.5" height="13" rx="2.2" fill="#16324F" stroke="#F0A033" strokeWidth="0.4" opacity="0.82" />
      <rect x="6.5" y="33.5" width="2.5" height="2" rx="0.6" fill="#FBB24A" opacity="0.35" />
      <rect x="55" y="33.5" width="2.5" height="2" rx="0.6" fill="#FBB24A" opacity="0.35" />

      {/* Chin highlight */}
      <path
        d="M19 53.5 Q32 57 45 53.5"
        fill="none"
        stroke="#FBB24A"
        strokeWidth="0.7"
        opacity="0.22"
        strokeLinecap="round"
      />
    </svg>
  );
}
