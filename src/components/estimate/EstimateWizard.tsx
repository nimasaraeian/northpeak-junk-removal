"use client";

import { startTransition, useActionState, useState } from "react";
import { featuredServices, getService, services } from "@/content/services";
import { submitEstimate, type EstimateActionState } from "@/lib/actions/estimate";
import { Button } from "@/components/ui/Button";
import { TruckVolumePad } from "@/components/estimate/TruckVolumePad";
import { PhotoDropzone, type LocalPhoto } from "@/components/estimate/PhotoDropzone";
import { PostalCodeChecker } from "@/components/estimate/PostalCodeChecker";
import { summarizeVolume } from "@/lib/volume";
import { cx } from "@/lib/utils";

const initialState: EstimateActionState = { ok: false, message: "" };

const steps = ["Load", "Area", "Service", "Contact"];

export function EstimateWizard({
  initialPostalCode = "",
  initialService = "",
}: {
  initialPostalCode?: string;
  initialService?: string;
}) {
  const [step, setStep] = useState(0);
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [serviceSlug, setServiceSlug] = useState(initialService);
  const [volumeLevelId, setVolumeLevelId] = useState("empty");
  const [accessNotes, setAccessNotes] = useState("");
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [state, action, pending] = useActionState(submitEstimate, initialState);
  const selectedService = getService(serviceSlug);
  const load = summarizeVolume(volumeLevelId);
  const volume =
    load.cubicFeet > 0 ? load.volumeLabel : "Not filled yet — confirm from photos";

  if (state.ok) {
    return (
      <div className="rounded-[1.8rem] border border-navy/8 bg-paper p-8 text-center shadow-[var(--shadow-card)]">
        <p className="eyebrow text-gold-deep">Request received</p>
        <h2 className="display mt-4 text-4xl text-navy">
          Thanks{state.customerName ? `, ${state.customerName.split(" ")[0]}` : ""}.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-stone">{state.message}</p>
        {state.requestId ? (
          <p className="mt-4 text-sm font-semibold text-navy">
            Reference: <span className="text-gold-deep">{state.requestId}</span>
          </p>
        ) : null}
        {selectedService ? (
          <p className="mx-auto mt-3 max-w-lg text-sm text-stone">
            {selectedService.name} · {postalCode}
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

      {step === 0 ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!postalCode) setStep(1);
            else if (!serviceSlug) setStep(2);
            else setStep(3);
          }}
        >
          <h2 className="display text-2xl text-navy sm:text-3xl">Fill the truck</h2>
          <p className="mt-2 text-sm text-stone sm:mt-3 sm:text-base">
            Drag to rotate. Tap a fill level below — everything stays on one screen.
          </p>
          <div className="mt-6">
            <TruckVolumePad levelId={volumeLevelId} onChange={setVolumeLevelId} />
          </div>
          <label className="mt-5 block text-sm font-semibold text-navy">
            Access notes
            <textarea
              name="accessPreview"
              rows={3}
              value={accessNotes}
              onChange={(event) => setAccessNotes(event.target.value)}
              placeholder="Stairs, elevator booking, parking, strata rules..."
              className="mt-2 w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-gold"
            />
          </label>
          <div className="mt-6">
            <PhotoDropzone photos={photos} onChange={setPhotos} />
          </div>
          <div className="mt-6 flex gap-3">
            <Button type="submit">Continue</Button>
          </div>
        </form>
      ) : null}

      {step === 1 ? (
        <div>
          <h2 className="display text-3xl text-navy">Confirm we cover your address</h2>
          <p className="mt-3 text-stone">
            Coverage is evaluated from the postal code only. Then we will lock the service.
          </p>
          <div className="mt-6">
            <PostalCodeChecker
              variant="plain"
              onAvailable={(next) => {
                setPostalCode(next);
                setStep(serviceSlug ? 3 : 2);
              }}
            />
          </div>
          <div className="mt-6">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back to the truck
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h2 className="display text-3xl text-navy">What needs to leave?</h2>
          <p className="mt-3 text-stone">Choose the closest service. You can still refine the description next.</p>
          <div className="mt-6 grid gap-3">
            {services.map((service) => (
              <button
                key={service.slug}
                type="button"
                onClick={() => {
                  setServiceSlug(service.slug);
                  setStep(3);
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
            <Button variant="ghost" onClick={() => setStep(postalCode ? 0 : 1)}>
              Back
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <form
          encType="multipart/form-data"
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;

            const formData = new FormData(event.currentTarget);
            photos.forEach((photo) => formData.append("photos", photo.file));

            startTransition(() => {
              action(formData);
            });
          }}
        >
          <h2 className="display text-3xl text-navy">Where should we send the range?</h2>
          <input type="hidden" name="postalCode" value={postalCode} />
          <input type="hidden" name="serviceSlug" value={serviceSlug} />
          <input type="hidden" name="volume" value={volume} />
          <input type="hidden" name="loadManifest" value={JSON.stringify(load.manifest)} />
          <input type="hidden" name="accessNotes" value={accessNotes} />
          <Field label="Name" name="name" autoComplete="name" required />
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field label="Phone" name="phone" type="tel" autoComplete="tel" required />
          <label className="text-sm font-semibold text-navy">
            Preferred contact
            <select
              name="preferredContact"
              className="mt-2 h-12 w-full rounded-full border border-navy/10 bg-white px-4 text-sm font-normal outline-none"
              defaultValue="phone"
            >
              <option value="phone">Phone</option>
              <option value="text">Text</option>
              <option value="email">Email</option>
            </select>
          </label>
          <p className="rounded-2xl bg-cream px-4 py-3 text-sm text-stone">
            {volume}. {load.itemLine}{" "}
            {photos.length === 1 ? "1 photo." : `${photos.length} photos.`}{" "}
            {accessNotes || "No extra access notes yet."}
          </p>
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
              {pending ? "Sending..." : "Request Estimate"}
            </Button>
          </div>
          {state.message && !state.ok ? (
            <p className="text-sm text-gold-deep">{state.message}</p>
          ) : null}
          <p className="text-xs leading-5 text-stone">
            Typical next services after this step: {featuredServices.map((item) => item.shortName).join(", ")}.
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
