"use client";

import { useState } from "react";
import { PhotoDropzone, type LocalPhoto } from "@/components/estimate/PhotoDropzone";
import type { ContactActionState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/Button";

const initialState: ContactActionState = { ok: false, message: "" };

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
      encType="multipart/form-data"
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;

        const formData = new FormData(event.currentTarget);
        for (const photo of photos) {
          formData.append("photos", photo.file);
        }

        setPending(true);
        setState({ ok: false, message: "" });

        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            body: formData,
          });

          const payload = (await response.json()) as ContactActionState;

          if (!response.ok || !payload.message) {
            throw new Error("Contact request failed");
          }

          setState(payload);
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

      <div>
        <PhotoDropzone
          photos={photos}
          onChange={setPhotos}
          title="Add photos (optional)"
          description="Share photos of the space, items, or access details so we can understand your question faster."
          hint="Up to 8 photos · JPG, PNG, or WebP"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </Button>
      {state.message ? <p className="text-sm text-gold-deep">{state.message}</p> : null}
    </form>
  );
}
