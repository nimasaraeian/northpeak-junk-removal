"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  truckFrames,
  truckRearFrameIndex,
  volumeLevels,
  summarizeVolume,
} from "@/content/truck";
import { cx } from "@/lib/utils";

export function TruckVolumePad({
  levelId,
  onChange,
}: {
  levelId: string;
  onChange: (levelId: string) => void;
}) {
  const summary = summarizeVolume(levelId);
  const level = volumeLevels.find((item) => item.id === levelId) ?? volumeLevels[0];
  const [frame, setFrame] = useState(truckRearFrameIndex);
  const drag = useRef<{ active: boolean; startX: number; startFrame: number }>({
    active: false,
    startX: 0,
    startFrame: 0,
  });

  const isRear = frame === truckRearFrameIndex;
  const displaySrc =
    isRear && level.fillSrc ? level.fillSrc : truckFrames[frame] ?? truckFrames[0];

  function scrub(deltaX: number, startFrame: number) {
    const steps = Math.round(deltaX / 28);
    const next =
      (((startFrame - steps) % truckFrames.length) + truckFrames.length) % truckFrames.length;
    setFrame(next);
  }

  function selectLevel(id: string) {
    onChange(id);
    // Empty and filled levels both show the open rear bay
    setFrame(truckRearFrameIndex);
  }

  return (
    <div
      id="pad"
      className="overflow-hidden rounded-[1.35rem] border border-navy/8 bg-navy-deep md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(15rem,0.9fr)] md:rounded-[1.6rem]"
    >
      <div
        className="relative flex aspect-[16/10] touch-none select-none items-center justify-center overflow-hidden bg-[#050b14] p-3 sm:aspect-[16/9] sm:p-4 md:aspect-auto md:min-h-[28rem] md:p-8"
        onPointerDown={(event) => {
          drag.current = { active: true, startX: event.clientX, startFrame: frame };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current.active) return;
          scrub(event.clientX - drag.current.startX, drag.current.startFrame);
        }}
        onPointerUp={() => {
          drag.current.active = false;
        }}
        onPointerCancel={() => {
          drag.current.active = false;
        }}
        role="img"
        aria-label="NorthPeak truck. Drag sideways to rotate."
      >
        <Image
          key={displaySrc}
          src={displaySrc}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 768px) 55vw, 100vw"
          priority
          className="object-contain object-center transition-opacity duration-200"
          draggable={false}
        />

        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: 0.08 + summary.fill / 320,
            background:
              "radial-gradient(circle at 50% 55%, rgba(240,160,51,0.3), transparent 50%)",
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="rounded-full bg-black/50 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-cream/90 uppercase backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-[0.68rem] sm:tracking-[0.16em]">
            Drag to rotate
          </p>
          <p className="rounded-full bg-black/50 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-gold-glow uppercase backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-[0.68rem] sm:tracking-[0.16em]">
            {summary.fill}% full
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/35 md:h-1.5">
          <div
            className="h-full bg-gold-glow transition-[width] duration-500"
            style={{ width: `${summary.fill}%` }}
          />
        </div>
      </div>

      <aside className="flex flex-col border-t border-white/8 bg-[#0a1624] text-cream md:border-t-0 md:border-l md:border-white/8">
        {/* Mobile summary — one tight strip */}
        <div className="flex items-start justify-between gap-3 px-3 py-3 md:hidden">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-semibold tracking-[0.16em] text-gold-glow uppercase">
              Truck volume
            </p>
            <p className="mt-1 truncate font-serif text-xl text-cream">{summary.volumeLabel}</p>
            <p className="mt-0.5 text-xs text-stone-soft">
              {summary.visitLabel}
              {summary.cubicFeet > 0 ? ` · ~${summary.cubicFeet} cu ft` : null}
            </p>
          </div>
          {level.id !== "empty" ? (
            <button
              type="button"
              onClick={() => selectLevel("empty")}
              className="shrink-0 pt-1 text-[0.62rem] font-semibold tracking-[0.14em] text-stone-soft uppercase"
            >
              Empty
            </button>
          ) : null}
        </div>

        {/* Mobile: compact fill pills — truck stays in view */}
        <div className="grid grid-cols-5 gap-1.5 px-3 pb-3 md:hidden">
          {volumeLevels.map((item) => {
            const selected = item.id === level.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectLevel(item.id)}
                className={cx(
                  "rounded-xl border px-1 py-2.5 text-center transition",
                  selected
                    ? "border-gold bg-gold/15"
                    : "border-white/10 bg-white/4 active:border-white/25",
                )}
                aria-pressed={selected}
                aria-label={`${item.fill}% — ${item.label}`}
              >
                <span
                  className={cx(
                    "block text-sm font-bold tabular-nums",
                    selected ? "text-gold-glow" : "text-cream",
                  )}
                >
                  {item.fill}
                </span>
                <span className="mt-0.5 block text-[0.55rem] leading-tight tracking-wide text-stone-soft uppercase">
                  {item.id === "empty"
                    ? "Empty"
                    : item.id === "few"
                      ? "Few"
                      : item.id === "room"
                        ? "Room"
                        : item.id === "garage"
                          ? "Garage"
                          : "Home"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop sidebar */}
        <div className="hidden border-b border-white/8 px-4 py-4 md:block sm:px-5">
          <p className="eyebrow text-gold-glow">Truck volume</p>
          <p className="mt-2 font-serif text-2xl leading-tight sm:text-[1.85rem]">
            {summary.volumeLabel}
          </p>
          <p className="mt-1 text-sm text-stone-soft">
            {summary.visitLabel}
            {summary.cubicFeet > 0 ? ` · ~${summary.cubicFeet} cu ft` : null}
          </p>
          {level.id !== "empty" ? (
            <button
              type="button"
              onClick={() => selectLevel("empty")}
              className="mt-3 text-xs font-semibold tracking-[0.16em] text-stone-soft uppercase hover:text-cream"
            >
              Empty the bay
            </button>
          ) : null}
        </div>

        <div className="hidden flex-1 flex-col gap-2 overflow-visible p-3 md:flex">
          {volumeLevels.map((item) => {
            const selected = item.id === level.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectLevel(item.id)}
                className={cx(
                  "w-full rounded-2xl border px-3 py-3 text-left transition",
                  selected
                    ? "border-gold/70 bg-white/8"
                    : "border-white/8 bg-white/3 hover:border-white/20",
                )}
              >
                <span className="block text-[0.65rem] font-semibold tracking-[0.14em] text-gold-glow uppercase">
                  {item.fill}%
                </span>
                <span className="mt-1 block text-sm font-semibold text-cream">{item.label}</span>
                <span className="mt-0.5 block text-[0.7rem] text-stone-soft">{item.blurb}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <p className="sr-only">
        Current view image: {displaySrc}. Rotate by dragging. Select a volume level to fill the bay.
      </p>
    </div>
  );
}
