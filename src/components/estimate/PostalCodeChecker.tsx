"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { checkServiceArea, normalizePostalCode } from "@/lib/postal";
import type { ServiceAreaTier } from "@/types";
import { cx } from "@/lib/utils";

function resultPanelClass(tier: ServiceAreaTier | "error") {
  if (tier === "error") return "bg-navy/5 text-navy";
  if (tier === "core" || tier === "extended") return "bg-navy text-cream";
  return "bg-cream-deep text-navy";
}

function resultMessageClass(tier: ServiceAreaTier) {
  return tier === "core" || tier === "extended" ? "text-cream/80" : "text-stone";
}

export function PostalCodeChecker({
  variant = "card",
  onAvailable,
}: {
  variant?: "card" | "plain" | "banner";
  onAvailable?: (postalCode: string) => void;
}) {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const result = useMemo(() => {
    if (!touched || value.trim().length < 3) return null;
    return checkServiceArea(value);
  }, [touched, value]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    const next = checkServiceArea(value);
    if (!("error" in next)) {
      onAvailable?.(next.postalCode);
    }
  }

  function renderResult(panelClassName?: string) {
    if (!result) return null;

    const tier = "error" in result ? "error" : result.tier;

    return (
      <div className={cx(panelClassName, resultPanelClass(tier))}>
        {"error" in result ? (
          <p>{result.error}</p>
        ) : (
          <>
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] uppercase opacity-80">
              {result.tierLabel}
            </p>
            <p className="mt-1 font-semibold">{result.headline}</p>
            <p className={resultMessageClass(result.tier)}>{result.message}</p>
            {!onAvailable ? (
              <div className="mt-3">
                <Button
                  href={`/estimate?postal=${encodeURIComponent(result.postalCode)}` as "/estimate"}
                >
                  Get My Free Estimate
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="overflow-hidden rounded-[1.35rem] border border-navy/8 bg-paper shadow-[var(--shadow-lift)] sm:rounded-[1.6rem]">
        <div className="grid lg:grid-cols-[1.1fr_1.2fr_0.85fr]">
          <div className="p-5 sm:p-7">
            <p className="font-serif text-2xl text-navy sm:text-[1.75rem]">Do we service your area?</p>
            <p className="mt-2 text-sm leading-6 text-stone">
              Enter your postal code to check service availability across Metro Vancouver.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.72rem] font-semibold tracking-wide text-navy/70 uppercase">
              <li className="flex items-center gap-1.5">
                <span className="text-gold">✓</span> Fast response
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-gold">✓</span> No obligation
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-gold">✓</span> Metro Vancouver
              </li>
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center gap-3 border-t border-navy/6 px-5 py-5 sm:flex-row sm:items-center sm:px-7 lg:border-t-0 lg:border-l"
          >
            <label className="sr-only" htmlFor={inputId}>
              Postal code
            </label>
            <input
              id={inputId}
              name="postalCode"
              inputMode="text"
              autoComplete="postal-code"
              placeholder="Enter your postal code"
              value={value}
              onChange={(event) => {
                setValue(normalizePostalCode(event.target.value));
                if (touched) setTouched(true);
              }}
              className="h-12 w-full rounded-full border border-navy/12 bg-white px-5 text-sm text-navy outline-none placeholder:text-stone focus:border-gold sm:h-14 sm:min-w-[14rem]"
            />
            <Button type="submit" size="lg" className="w-full shrink-0 sm:w-auto">
              Check Availability →
            </Button>
          </form>

          <div className="relative hidden overflow-hidden bg-navy-soft/90 p-6 text-cream lg:flex lg:flex-col lg:justify-end">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 70% 80%, rgba(251,178,74,0.35), transparent 55%), linear-gradient(160deg, #16324f, #08121f)",
              }}
            />
            <p className="relative font-serif text-xl leading-snug">
              Local people.
              <br />
              Brighter places.
            </p>
          </div>
        </div>

        {renderResult("border-t border-navy/8 px-5 py-4 text-sm leading-6 sm:px-7")}
      </div>
    );
  }

  return (
    <div
      className={cx(
        variant === "card" &&
          "rounded-[1.6rem] border border-navy/8 bg-paper p-6 shadow-[var(--shadow-card)] sm:p-7",
        variant === "plain" && "space-y-5",
      )}
    >
      <div className={variant === "card" ? "space-y-6" : "flex flex-col gap-5 lg:flex-row lg:items-end"}>
        <div className={variant === "card" ? undefined : "min-w-0 flex-1"}>
          <p className="eyebrow text-gold-deep">Do we service your area?</p>
          {variant === "card" ? (
            <h2 className="mt-2 font-serif text-xl leading-snug text-navy sm:text-2xl">
              Confirm your coverage
            </h2>
          ) : null}
          <p
            className={cx(
              "text-sm leading-6 text-stone",
              variant === "card" ? "mt-2 max-w-md" : "mt-2",
            )}
          >
            Enter a Canadian postal code to check service availability across Metro Vancouver.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className={cx(
            "flex w-full flex-col gap-3 sm:flex-row sm:items-stretch",
            variant === "card" ? "sm:gap-3" : "lg:w-auto",
          )}
        >
          <label className="sr-only" htmlFor={inputId}>
            Postal code
          </label>
          <input
            id={inputId}
            name="postalCode"
            inputMode="text"
            autoComplete="postal-code"
            placeholder="V7L 1A1"
            value={value}
            onChange={(event) => {
              setValue(normalizePostalCode(event.target.value));
              if (touched) setTouched(true);
            }}
            className={cx(
              "h-12 w-full min-w-0 rounded-full border border-navy/12 bg-white px-5 text-sm tracking-[0.16em] text-navy uppercase outline-none placeholder:tracking-normal placeholder:normal-case placeholder:text-stone focus:border-gold sm:h-14",
              variant === "card" ? "sm:flex-1" : "sm:w-64",
            )}
          />
          <Button type="submit" size="lg" className="w-full shrink-0 sm:w-auto">
            Check Availability
          </Button>
        </form>
      </div>
      {renderResult("mt-5 rounded-2xl px-4 py-3 text-sm leading-6")}
    </div>
  );
}
