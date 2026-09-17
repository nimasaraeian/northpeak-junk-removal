"use client";

import { useState } from "react";
import { PhotoDropzone, type LocalPhoto } from "@/components/estimate/PhotoDropzone";
import type { ContactActionState } from "@/lib/actions/contact";
import { trackGenerateLead } from "@/lib/analytics/track";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";
import { whatsAppHref } from "@/lib/utils";

const initialState: ContactActionState = { ok: false, message: "" };

const photoFallbackHref = whatsAppHref(
  site.phone,
  "Hi NorthPeak — my photos did not upload through the contact form. Here they are.",
);

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function ContactForm() {
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [state, setState] = useState<ContactActionState>(initialState);
  const [pending, setPending] = useState(false);
  const [offerPhotoFallback, setOfferPhotoFallback] = useState(false);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-cream px-5 py-6">
        <p className="font-semibold text-navy">{state.message}</p>
        {state.requestId ? (
          <p className="mt-2 text-sm text-stone">
            Reference: <span className="font-semibold text-navy">{state.requestId}</span>
          </p>
        ) : null}
        {offerPhotoFallback ? <PhotoFallback /> : null}
        <p className="mt-2 text-sm text-stone">
          If you need a priced range, the estimate workflow is faster than another message.
        </p>
        <div className="mt-5">
          <Button href="/estimate">Get My Estimate</Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;

        const form = event.currentTarget;
        const formData = new FormData(form);

        setPending(true);
        setState({ ok: false, message: "" });
        setOfferPhotoFallback(false);

        try {
          const leadResponse = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: String(formData.get("name") ?? ""),
              email: String(formData.get("email") ?? ""),
              phone: String(formData.get("phone") ?? ""),
              message: String(formData.get("message") ?? ""),
              photoCount: photos.length,
            }),
          });

          const leadPayload = await readJsonResponse<ContactActionState>(leadResponse);

          if (!leadPayload?.message) {
            throw new Error("Invalid contact response");
          }

          if (!leadResponse.ok || !leadPayload.ok || !leadPayload.requestId) {
            setState(leadPayload);
            return;
          }

          // The lead is recorded at this point. Photo uploads that follow can
          // still fail without changing that, so the event fires here and only
          // here — once per accepted submission, with none of the details the
          // visitor just typed.
          trackGenerateLead("contact");

          let failedPhotos = 0;

          for (const [index, photo] of photos.entries()) {
            const photoForm = new FormData();
            photoForm.append("requestId", leadPayload.requestId);
            photoForm.append("photo", photo.file);
            photoForm.append("index", String(index + 1));
            photoForm.append("total", String(photos.length));

            const photoResponse = await fetch("/api/contact/photos", {
              method: "POST",
              body: photoForm,
            });

            const photoPayload = await readJsonResponse<{ ok: boolean }>(photoResponse);
            if (!photoResponse.ok || !photoPayload?.ok) {
              failedPhotos += 1;
            }
          }

          if (failedPhotos > 0) {
            setOfferPhotoFallback(true);
            setState({
              ok: true,
              requestId: leadPayload.requestId,
              photosDelivered: false,
              message: `We received your message, but ${failedPhotos} of ${photos.length} photo${
                photos.length === 1 ? "" : "s"
              } did not upload. Our team has your contact details and will follow up.`,
            });
            return;
          }

          const photoLine =
            photos.length > 0
              ? `${photos.length} photo${photos.length === 1 ? "" : "s"} attached.`
              : "";

          setState({
            ok: true,
            requestId: leadPayload.requestId,
            photosDelivered: photos.length === 0 || failedPhotos === 0,
            message: ["Message received. We will reply within one business day.", photoLine]
              .filter(Boolean)
              .join(" "),
          });
        } catch {
          setOfferPhotoFallback(photos.length > 0);
          setState({
            ok: false,
            message:
              "We couldn't send your message just now. Your information is still here — please try again.",
          });
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="text-sm font-semibold text-navy">
        Name
        <input
          name="name"
          required
          autoComplete="name"
          className="mt-2 h-12 w-full rounded-full border border-navy/10 bg-white px-4 text-sm font-normal outline-none focus:border-gold"
        />
      </label>
      <label className="text-sm font-semibold text-navy">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 h-12 w-full rounded-full border border-navy/10 bg-white px-4 text-sm font-normal outline-none focus:border-gold"
        />
      </label>
      <label className="text-sm font-semibold text-navy">
        Phone
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          className="mt-2 h-12 w-full rounded-full border border-navy/10 bg-white px-4 text-sm font-normal outline-none focus:border-gold"
        />
      </label>
      <label className="text-sm font-semibold text-navy">
        Message
        <textarea
          name="message"
          required
          rows={5}
          className="mt-2 w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-gold"
        />
      </label>

      <PhotoDropzone
        photos={photos}
        onChange={setPhotos}
        title="Add photos (optional)"
        description="Share photos of the space, items, or access details so we can understand your question faster."
        hint="Up to 8 photos · JPG, PNG, or WebP"
      />

      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </Button>
      {state.message ? (
        <div>
          <p className="text-sm text-gold-deep">{state.message}</p>
          {offerPhotoFallback ? <PhotoFallback /> : null}
        </div>
      ) : null}
    </form>
  );
}

function PhotoFallback() {
  return (
    <p className="mt-2 text-sm text-stone">
      You can also{" "}
      <a
        href={photoFallbackHref}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-navy underline decoration-gold underline-offset-4"
      >
        send the photos to us on WhatsApp
      </a>{" "}
      and we will match them to your message.
    </p>
  );
}
