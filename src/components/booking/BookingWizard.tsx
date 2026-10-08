"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { services } from "@/content/services";
import { submitBooking, type BookingActionState } from "@/lib/actions/booking";
import { BOOKING_WINDOWS } from "@/lib/booking/booking-core";
import type { BookingLevelEstimate } from "@/lib/booking/booking-core";
import { trackGenerateLead } from "@/lib/analytics/track";
import { formatRange } from "@/lib/quote-engine";
import { Button } from "@/components/ui/Button";
import { compressImage } from "@/lib/compress-image";
import { cx } from "@/lib/utils";

const initialState: BookingActionState = { ok: false, message: "" };

const steps = ["Size", "Service", "Schedule", "Details"];

const MAX_PHOTOS = 4;

async function toBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

interface AiEstimate {
  cubicFeet: number;
  lowCents: number;
  highCents: number;
  items: { label: string; qty: number }[];
  complexJob: boolean;
  reason?: string;
}

export function BookingWizard({
  estimates,
  minDate,
  initialService = "",
}: {
  estimates: BookingLevelEstimate[];
  minDate: string;
  initialService?: string;
}) {
  const [step, setStep] = useState(0);
  const [levelId, setLevelId] = useState("");
  const [serviceSlug, setServiceSlug] = useState(initialService);
  const [dateStr, setDateStr] = useState("");
  const [windowId, setWindowId] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [state, action, pending] = useActionState(submitBooking, initialState);
  const leadTracked = useRef(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<{ url: string; mediaType: string; base64: string }[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [ai, setAi] = useState<AiEstimate | null>(null);

  const selectedLevel = estimates.find((e) => e.id === levelId);
  const selectedService = services.find((s) => s.slug === serviceSlug);
  const selectedWindow = BOOKING_WINDOWS.find((w) => w.id === windowId);
  const hasAi = ai !== null && !ai.complexJob;

  async function addPhotos(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setAiError("");
    try {
      const picked = Array.from(fileList).slice(0, MAX_PHOTOS - photos.length);
      const next: { url: string; mediaType: string; base64: string }[] = [];
      for (const file of picked) {
        const compressed = await compressImage(file);
        next.push({
          url: URL.createObjectURL(compressed.file),
          mediaType: compressed.file.type || "image/jpeg",
          base64: await toBase64(compressed.file),
        });
      }
      setPhotos((current) => [...current, ...next].slice(0, MAX_PHOTOS));
    } catch {
      setAiError("Those photos couldn't be read on this device.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function analysePhotos() {
    if (photos.length === 0 || aiBusy) return;
    setAiBusy(true);
    setAiError("");
    setAi(null);
    try {
      const res = await fetch("/api/book/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: photos.map((p) => ({ mediaType: p.mediaType, data: p.base64 })) }),
      });
      const data = (await res.json()) as {
        error?: string;
        complexJob?: boolean;
        reason?: string;
        cubicFeet?: number;
        lowCents?: number;
        highCents?: number;
        items?: { label: string; qty: number }[];
      };
      if (!res.ok) {
        setAiError(data.error ?? "Couldn't estimate from those photos.");
        return;
      }
      if (data.complexJob) {
        setAi({ cubicFeet: 0, lowCents: 0, highCents: 0, items: [], complexJob: true, reason: data.reason });
        return;
      }
      setAi({
        cubicFeet: data.cubicFeet ?? 0,
        lowCents: data.lowCents ?? 0,
        highCents: data.highCents ?? 0,
        items: data.items ?? [],
        complexJob: false,
      });
      setLevelId(""); // the AI estimate replaces a bucket pick
    } catch {
      setAiError("Couldn't reach the estimator. Please try again.");
    } finally {
      setAiBusy(false);
    }
  }

  useEffect(() => {
    if (!state.ok || leadTracked.current) return;
    leadTracked.current = true;
    trackGenerateLead("booking");
  }, [state.ok]);

  if (state.ok) {
    return (
      <div className="rounded-[1.8rem] border border-navy/8 bg-paper p-8 text-center shadow-[var(--shadow-card)]">
        <p className="eyebrow text-gold-deep">Booking received</p>
        <h2 className="display mt-4 text-4xl text-navy">
          You&apos;re in{state.customerName ? `, ${state.customerName.split(" ")[0]}` : ""}.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-stone">{state.message}</p>
        {state.slotLabel ? (
          <p className="mt-5 inline-block rounded-2xl bg-cream px-5 py-3 text-sm font-semibold text-navy">
            {state.slotLabel}
          </p>
        ) : null}
        {state.estimate ? (
          <p className="mt-3 text-sm text-stone">
            Estimate range: <span className="font-semibold text-navy">{state.estimate}</span>
          </p>
        ) : null}
        {state.reference ? (
          <p className="mt-3 text-sm font-semibold text-navy">
            Reference: <span className="text-gold-deep">{state.reference}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/contact" variant="ghost">
            Ask a question
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.35rem] border border-navy/8 bg-paper p-4 shadow-[var(--shadow-card)] sm:rounded-[1.8rem] sm:p-6 md:p-8">
      <ol className="mb-5 grid grid-cols-4 gap-1.5 text-[0.6rem] font-semibold tracking-[0.12em] uppercase sm:mb-8 sm:gap-2 sm:text-[0.68rem] sm:tracking-[0.16em]">
        {steps.map((label, index) => (
          <li
            key={label}
            className={cx(
              "rounded-full px-1.5 py-2 text-center sm:px-2",
              index <= step ? "bg-navy text-cream" : "bg-cream text-stone",
            )}
          >
            {label}
          </li>
        ))}
      </ol>

      {hasAi && ai ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream px-4 py-3 text-sm">
          <span className="text-stone">
            Photo estimate
            {selectedService ? ` · ${selectedService.name}` : ""}
            {dateStr && selectedWindow ? ` · ${dateStr}, ${selectedWindow.label}` : ""}
          </span>
          <span className="font-semibold text-navy">{formatRange(ai.lowCents, ai.highCents)}</span>
        </div>
      ) : selectedLevel ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream px-4 py-3 text-sm">
          <span className="text-stone">
            {selectedLevel.label}
            {selectedService ? ` · ${selectedService.name}` : ""}
            {dateStr && selectedWindow ? ` · ${dateStr}, ${selectedWindow.label}` : ""}
          </span>
          <span className="font-semibold text-navy">
            {formatRange(selectedLevel.lowCents, selectedLevel.highCents)}
          </span>
        </div>
      ) : null}

      {step === 0 ? (
        <div>
          <h2 className="display text-2xl text-navy sm:text-3xl">How much needs to go?</h2>
          <p className="mt-2 text-sm text-stone sm:mt-3 sm:text-base">
            Pick the closest load size. You&apos;ll see the estimate range right away — final
            price is confirmed on site.
          </p>
          <div className="mt-6 grid gap-3">
            {estimates.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => {
                  setLevelId(level.id);
                  setAi(null);
                  setStep(1);
                }}
                className={cx(
                  "flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition",
                  levelId === level.id ? "border-gold bg-cream" : "border-navy/10 hover:border-navy/25",
                )}
              >
                <span>
                  <span className="block font-semibold text-navy">
                    {level.label} <span className="text-stone">· {level.tabTitle}</span>
                  </span>
                  <span className="mt-1 block text-sm text-stone">{level.blurb}</span>
                </span>
                <span className="shrink-0 text-right text-sm font-semibold text-gold-deep">
                  {formatRange(level.lowCents, level.highCents)}
                </span>
              </button>
            ))}
          </div>

          {/* Photo path — a sharper AI estimate. */}
          <div className="mt-6 rounded-2xl border border-navy/10 p-4">
            <p className="text-sm font-semibold text-navy">
              Not sure which size? Add photos for an instant AI estimate.
            </p>
            <p className="mt-1 text-xs text-stone">
              Up to {MAX_PHOTOS} photos. Nothing is stored. Final price is confirmed on site.
            </p>

            {photos.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <span key={p.url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((cur) => cur.filter((_, j) => j !== i))}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-xs text-cream"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void addPhotos(e.target.files)}
              />
              <Button
                variant="ghost"
                onClick={() => fileRef.current?.click()}
                disabled={photos.length >= MAX_PHOTOS}
              >
                {photos.length > 0 ? "Add more" : "Add photos"}
              </Button>
              <Button onClick={() => void analysePhotos()} disabled={photos.length === 0 || aiBusy}>
                {aiBusy ? "Reading photos…" : "Get instant estimate"}
              </Button>
            </div>

            {aiError ? <p className="mt-3 text-sm text-gold-deep">{aiError}</p> : null}

            {ai && ai.complexJob ? (
              <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm text-stone">
                This looks like a bigger job{ai.reason ? ` — ${ai.reason}` : ""}. Pick a size above,
                or continue and we&apos;ll give you a custom quote.
              </p>
            ) : null}

            {hasAi && ai ? (
              <div className="mt-3 rounded-xl bg-cream px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-navy">Estimated range</span>
                  <span className="text-sm font-semibold text-gold-deep">
                    {formatRange(ai.lowCents, ai.highCents)}
                  </span>
                </div>
                {ai.items.length > 0 ? (
                  <p className="mt-1 text-xs text-stone">
                    {ai.items.map((it) => `${it.qty}× ${it.label}`).join(", ")}
                  </p>
                ) : null}
                <div className="mt-3">
                  <Button onClick={() => setStep(1)}>Continue →</Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <h2 className="display text-2xl text-navy sm:text-3xl">What kind of job is it?</h2>
          <p className="mt-2 text-sm text-stone sm:mt-3 sm:text-base">
            Choose the closest service — you can describe the details in a moment.
          </p>
          <div className="mt-6 grid gap-3">
            {services.map((service) => (
              <button
                key={service.slug}
                type="button"
                onClick={() => {
                  setServiceSlug(service.slug);
                  setStep(2);
                }}
                className={cx(
                  "rounded-2xl border px-4 py-4 text-left transition",
                  serviceSlug === service.slug
                    ? "border-gold bg-cream"
                    : "border-navy/10 hover:border-navy/25",
                )}
              >
                <p className="font-semibold text-navy">{service.name}</p>
                <p className="mt-1 text-sm text-stone">{service.summary}</p>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (dateStr && windowId && postalCode) setStep(3);
          }}
        >
          <div>
            <h2 className="display text-2xl text-navy sm:text-3xl">When should we come?</h2>
            <p className="mt-2 text-sm text-stone sm:mt-3 sm:text-base">
              Pick a day and an arrival window. We&apos;ll call to confirm the exact time.
            </p>
          </div>
          <label className="text-sm font-semibold text-navy">
            Preferred date
            <input
              type="date"
              required
              min={minDate}
              value={dateStr}
              onChange={(event) => setDateStr(event.target.value)}
              className="mt-2 h-12 w-full rounded-full border border-navy/10 bg-white px-4 text-sm font-normal outline-none focus:border-gold"
            />
          </label>
          <div>
            <p className="text-sm font-semibold text-navy">Arrival window</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {BOOKING_WINDOWS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWindowId(w.id)}
                  className={cx(
                    "rounded-2xl border px-4 py-3 text-left transition",
                    windowId === w.id ? "border-gold bg-cream" : "border-navy/10 hover:border-navy/25",
                  )}
                >
                  <span className="block font-semibold text-navy">{w.label}</span>
                  <span className="mt-0.5 block text-xs text-stone">{w.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="text-sm font-semibold text-navy">
            Postal code
            <input
              name="postalCodePreview"
              required
              autoComplete="postal-code"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              placeholder="V7M 1M4"
              className="mt-2 h-12 w-full rounded-full border border-navy/10 bg-white px-4 text-sm font-normal uppercase outline-none focus:border-gold"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={!dateStr || !windowId || !postalCode}>
              Continue
            </Button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;
            const formData = new FormData(event.currentTarget);
            startTransition(() => {
              action(formData);
            });
          }}
        >
          <h2 className="display text-2xl text-navy sm:text-3xl">Where and who?</h2>

          {/* Carried from earlier steps. */}
          <input type="hidden" name="levelId" value={levelId} />
          <input type="hidden" name="aiCuFt" value={hasAi && ai ? String(ai.cubicFeet) : ""} />
          <input type="hidden" name="serviceSlug" value={serviceSlug} />
          <input type="hidden" name="date" value={dateStr} />
          <input type="hidden" name="window" value={windowId} />
          <input type="hidden" name="postalCode" value={postalCode} />
          {/* Honeypot — real people leave it blank. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
          />

          <Field label="Name" name="name" autoComplete="name" required />
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field label="Phone" name="phone" type="tel" autoComplete="tel" required />
          <Field label="Street address" name="address" autoComplete="street-address" />
          <label className="text-sm font-semibold text-navy">
            Access notes
            <textarea
              name="accessNotes"
              rows={2}
              placeholder="Stairs, elevator booking, parking, strata rules..."
              className="mt-2 w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-gold"
            />
          </label>
          <label className="text-sm font-semibold text-navy">
            What needs to be removed?
            <textarea
              name="description"
              rows={4}
              required
              className="mt-2 w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-gold"
            />
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Booking..." : "Confirm booking"}
            </Button>
          </div>
          {state.message && !state.ok ? (
            <p className="text-sm text-gold-deep">{state.message}</p>
          ) : null}
          <p className="text-xs leading-5 text-stone">
            No payment now. We confirm the time by phone and the price on site before any work
            starts.
          </p>
        </form>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-navy">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 h-12 w-full rounded-full border border-navy/10 bg-white px-4 text-sm font-normal outline-none focus:border-gold"
      />
    </label>
  );
}
