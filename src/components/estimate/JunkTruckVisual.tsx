"use client";

import { useId } from "react";
import { cx } from "@/lib/utils";

type ViewVariant = "front" | "side" | "rear";

function viewFromFrame(frame: number, total: number): ViewVariant {
  const t = frame / (total - 1);
  if (t < 0.28) return "front";
  if (t > 0.72) return "rear";
  return "side";
}

function JunkPile({
  fill,
  clipId,
  originX = 228,
  floorY = 248,
  width = 268,
  maxHeight = 118,
}: {
  fill: number;
  clipId: string;
  originX?: number;
  floorY?: number;
  width?: number;
  maxHeight?: number;
}) {
  if (fill <= 0) return null;

  const h = (fill / 100) * maxHeight;
  const y = floorY - h;
  const w = width;

  return (
    <g clipPath={`url(#${clipId})`}>
      <rect x={originX} y={y} width={w} height={h + 4} fill="#3d3428" opacity="0.35" />
      <rect x={originX + 10} y={y + h * 0.15} width="52" height="38" rx="3" fill="#8b6914" opacity="0.85" />
      <rect x={originX + 70} y={y + h * 0.05} width="44" height="32" rx="2" fill="#a07820" opacity="0.8" />
      <rect x={originX + 124} y={y + h * 0.22} width="58" height="42" rx="3" fill="#7a5c18" opacity="0.85" />
      <rect x={originX + 190} y={y + h * 0.08} width="48" height="36" rx="2" fill="#9a7420" opacity="0.75" />
      {fill >= 50 ? (
        <rect x={originX + 42} y={y - 8} width="64" height="28" rx="2" fill="#6b5012" opacity="0.8" />
      ) : null}
      {fill >= 75 ? (
        <>
          <rect x={originX + 112} y={y - 14} width="72" height="34" rx="2" fill="#5c4610" opacity="0.85" />
          <ellipse cx={originX + w - 36} cy={y + 10} rx="22" ry="18" fill="#2a2520" opacity="0.7" />
        </>
      ) : null}
      {fill >= 100 ? (
        <rect x={originX + 22} y={y - 22} width="90" height="40" rx="3" fill="#4a3810" opacity="0.9" />
      ) : null}
    </g>
  );
}

function TruckBody({
  fill,
  interiorClipId,
  showInterior,
}: {
  fill: number;
  interiorClipId: string;
  showInterior: boolean;
}) {
  const lift = fill > 0 ? Math.min(fill * 0.018, 2.2) : 0;

  return (
    <g transform={`rotate(${-lift} 196 310)`}>
      {/* hydraulic jack */}
      <rect x="178" y="268" width="28" height="44" rx="4" fill="#8a9098" />
      <rect x="184" y="256" width="16" height="18" rx="3" fill="#b8bcc2" />
      <rect x="186" y="248" width="12" height="10" rx="2" fill="#f0a033" opacity={0.35 + fill / 200} />

      {/* dump box */}
      <path
        d="M206 128 L518 128 L518 308 L206 308 Z"
        fill="#0c1b2e"
        stroke="#16324f"
        strokeWidth="2"
      />
      <path d="M206 128 L518 128 L512 118 L212 118 Z" fill="#16324f" />
      {/* tarp rail */}
      <rect x="206" y="112" width="312" height="8" rx="2" fill="#6b7280" />
      <rect x="220" y="104" width="6" height="14" rx="1" fill="#9ca3af" />
      <rect x="280" y="104" width="6" height="14" rx="1" fill="#9ca3af" />
      <rect x="340" y="104" width="6" height="14" rx="1" fill="#9ca3af" />
      <rect x="400" y="104" width="6" height="14" rx="1" fill="#9ca3af" />
      <rect x="460" y="104" width="6" height="14" rx="1" fill="#9ca3af" />

      {/* brand panel — cream NorthPeak lockup zone */}
      <rect x="248" y="168" width="200" height="112" rx="4" fill="#f6f1e8" />
      <rect x="248" y="168" width="200" height="6" fill="#f0a033" />
      <rect x="248" y="274" width="200" height="6" fill="#f0a033" />

      {/* logo mark */}
      <rect x="318" y="182" width="14" height="40" rx="1" fill="#0c1b2e" />
      <rect x="364" y="182" width="14" height="40" rx="1" fill="#0c1b2e" />
      <rect x="332" y="186" width="32" height="32" fill="#f0a033" opacity="0.85" />
      <ellipse cx="348" cy="218" rx="18" ry="6" fill="#fbb24a" opacity="0.45" />

      <text
        x="348"
        y="242"
        textAnchor="middle"
        fill="#0c1b2e"
        fontSize="15"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="-0.02em"
      >
        NorthPeak
      </text>
      <text
        x="348"
        y="258"
        textAnchor="middle"
        fill="#16324f"
        fontSize="7"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.28em"
      >
        JUNK REMOVAL
      </text>
      <text
        x="348"
        y="272"
        textAnchor="middle"
        fill="#8a8378"
        fontSize="5.5"
        fontWeight="500"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.12em"
      >
        MORE SPACE · A BETTER TOMORROW
      </text>

      {showInterior ? (
        <>
          <defs>
            <clipPath id={interiorClipId}>
              <rect x="214" y="130" width="296" height="174" />
            </clipPath>
          </defs>
          <rect x="214" y="130" width="296" height="174" fill="#1a2535" opacity="0.6" />
          <JunkPile fill={fill} clipId={interiorClipId} />
        </>
      ) : null}
    </g>
  );
}

function SideView({ fill, uid }: { fill: number; uid: string }) {
  const clipId = `${uid}-side-interior`;
  return (
    <svg viewBox="0 0 640 400" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-ground`} x1="0" y1="340" x2="640" y2="340">
          <stop stopColor="#050b14" />
          <stop offset="0.5" stopColor="#0a1624" />
          <stop offset="1" stopColor="#050b14" />
        </linearGradient>
        <radialGradient id={`${uid}-spot`} cx="50%" cy="40%" r="50%">
          <stop stopColor="#f0a033" stopOpacity="0.12" />
          <stop offset="1" stopColor="#050b14" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="400" fill="#050b14" />
      <rect width="640" height="400" fill={`url(#${uid}-spot)`} />
      <rect x="0" y="338" width="640" height="62" fill={`url(#${uid}-ground)`} />
      <line x1="40" y1="338" x2="600" y2="338" stroke="#16324f" strokeWidth="1" opacity="0.5" />

      {/* cab-over cab */}
      <path
        d="M48 308 L48 198 Q48 168 78 158 L148 148 L148 308 Z"
        fill="#fbf8f2"
        stroke="#c8c0b3"
        strokeWidth="1.5"
      />
      <path d="M48 198 Q48 168 78 158 L148 148 L148 178 L58 188 Q48 192 48 208 Z" fill="#e8e2d8" />
      <rect x="62" y="188" width="52" height="38" rx="4" fill="#94a3b8" opacity="0.35" />
      <rect x="68" y="248" width="18" height="12" rx="2" fill="#0c1b2e" opacity="0.5" />

      <TruckBody fill={fill} interiorClipId={clipId} showInterior={fill > 0} />

      {/* wheels */}
      <circle cx="118" cy="338" r="34" fill="#111827" />
      <circle cx="118" cy="338" r="20" fill="#374151" />
      <circle cx="118" cy="338" r="8" fill="#6b7280" />
      <circle cx="468" cy="338" r="34" fill="#111827" />
      <circle cx="468" cy="338" r="20" fill="#374151" />
      <circle cx="468" cy="338" r="8" fill="#6b7280" />
      <circle cx="508" cy="338" r="34" fill="#111827" />
      <circle cx="508" cy="338" r="20" fill="#374151" />
      <circle cx="508" cy="338" r="8" fill="#6b7280" />
    </svg>
  );
}

function RearView({ fill, uid }: { fill: number; uid: string }) {
  const clipId = `${uid}-rear-interior`;
  const lift = fill > 0 ? Math.min(fill * 0.025, 3) : 0;

  return (
    <svg viewBox="0 0 640 400" className="h-full w-full" aria-hidden>
      <rect width="640" height="400" fill="#050b14" />
      <rect x="0" y="338" width="640" height="62" fill="#0a1624" />
      <line x1="80" y1="338" x2="560" y2="338" stroke="#16324f" strokeWidth="1" opacity="0.5" />

      {/* cab back */}
      <rect x="180" y="148" width="80" height="190" rx="4" fill="#fbf8f2" stroke="#c8c0b3" />

      <g transform={`rotate(${-lift} 360 310)`}>
        <rect x="268" y="256" width="24" height="52" rx="4" fill="#8a9098" />
        <rect x="274" y="242" width="12" height="16" rx="2" fill="#f0a033" opacity="0.5" />

        {/* open box rear */}
        <path d="M292 118 L548 118 L548 308 L292 308 Z" fill="#0c1b2e" stroke="#16324f" strokeWidth="2" />
        <path d="M292 118 L548 118 L540 108 L300 108 Z" fill="#16324f" />

        {/* tailgate open */}
        <path
          d="M292 308 L292 118 L278 108 L278 318 Z"
          fill="#16324f"
          opacity="0.85"
        />

        <defs>
          <clipPath id={clipId}>
            <rect x="300" y="122" width="240" height="182" />
          </clipPath>
        </defs>
        <rect x="300" y="122" width="240" height="182" fill="#141e2e" />
        <JunkPile
          fill={fill}
          clipId={clipId}
          originX={308}
          floorY={300}
          width={224}
          maxHeight={168}
        />

        {/* interior depth lines */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={320 + i * 50}
            y1="122"
            x2={320 + i * 50}
            y2="304"
            stroke="#1e293b"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}
      </g>

      <circle cx="340" cy="338" r="34" fill="#111827" />
      <circle cx="340" cy="338" r="20" fill="#374151" />
      <circle cx="480" cy="338" r="34" fill="#111827" />
      <circle cx="480" cy="338" r="20" fill="#374151" />
      {/* tail lights */}
      <rect x="548" y="268" width="10" height="28" rx="2" fill="#dc2626" opacity="0.8" />
      <rect x="548" y="238" width="10" height="20" rx="2" fill="#fbbf24" opacity="0.7" />
    </svg>
  );
}

function FrontView({ fill, uid }: { fill: number; uid: string }) {
  return (
    <svg viewBox="0 0 640 400" className="h-full w-full" aria-hidden>
      <rect width="640" height="400" fill="#050b14" />
      <rect x="0" y="338" width="640" height="62" fill="#0a1624" />
      <path
        d="M280 308 L280 168 Q280 138 310 128 L380 128 Q410 138 410 168 L410 308 Z"
        fill="#fbf8f2"
        stroke="#c8c0b3"
      />
      <rect x="300" y="168" width="90" height="55" rx="6" fill="#94a3b8" opacity="0.3" />
      <rect x="318" y="200" width="54" height="8" rx="2" fill="#0c1b2e" opacity="0.2" />
      <TruckBody fill={fill} interiorClipId={`${uid}-front-int`} showInterior={false} />
      <circle cx="310" cy="338" r="34" fill="#111827" />
      <circle cx="310" cy="338" r="20" fill="#374151" />
      <circle cx="390" cy="338" r="34" fill="#111827" />
      <circle cx="390" cy="338" r="20" fill="#374151" />
    </svg>
  );
}

export function JunkTruckVisual({
  frame,
  frameCount,
  fill,
  className,
}: {
  frame: number;
  frameCount: number;
  fill: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const variant = viewFromFrame(frame, frameCount);

  return (
    <div
      className={cx(
        "relative h-full w-full transition-transform duration-300 ease-out",
        className,
      )}
      style={{
        perspective: "1200px",
      }}
    >
      <div
        className="h-full w-full transition-transform duration-500 ease-out"
        style={{
          transform: `rotateY(${((frame - (frameCount - 1) / 2) / (frameCount - 1)) * 38}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {variant === "front" ? (
          <FrontView fill={fill} uid={uid} />
        ) : variant === "rear" ? (
          <RearView fill={fill} uid={uid} />
        ) : (
          <SideView fill={fill} uid={uid} />
        )}
      </div>
    </div>
  );
}
