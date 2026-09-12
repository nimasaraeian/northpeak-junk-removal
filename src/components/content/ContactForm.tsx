"use client";

import { useState } from "react";
import { PhotoDropzone, type LocalPhoto } from "@/components/estimate/PhotoDropzone";
import type { ContactActionState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/Button";

const initialState: ContactActionState = { ok: false, message: "" };

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

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-cream px-5 py-6">
        <p className="font-semibold text-navy">{state.message}</p>
        {state.requestId ? (
          <p className="mt-2 text-sm text-stone">
            Reference: <span className="font-semibold text-navy">{state.requestId}</span>
          </p>
        ) : null}
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
            setState({
              ok: true,
              requestId: leadPayload.requestId,
              photosDelivered: false,
              message:
                "We received your message. Some photos may not have uploaded successfully, but our team has your contact details and will follow up.",
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
      {state.message ? <p className="text-sm text-gold-deep">{state.message}</p> : null}
    </form>
  );
}
