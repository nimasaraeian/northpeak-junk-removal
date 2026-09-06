"use client";

import { useActionState } from "react";
import { submitContact, type ContactActionState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/Button";

const initialState: ContactActionState = { ok: false, message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-cream px-5 py-6">
        <p className="font-semibold text-navy">{state.message}</p>
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
    <form action={action} className="grid gap-4">
      <label className="text-sm font-semibold text-navy">
        Name
        <input
          name="name"
          required
          className="mt-2 h-12 w-full rounded-full border border-navy/10 bg-white px-4 text-sm font-normal outline-none focus:border-gold"
        />
      </label>
      <label className="text-sm font-semibold text-navy">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-2 h-12 w-full rounded-full border border-navy/10 bg-white px-4 text-sm font-normal outline-none focus:border-gold"
        />
      </label>
      <label className="text-sm font-semibold text-navy">
        Phone
        <input
          name="phone"
          type="tel"
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
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </Button>
      {state.message ? <p className="text-sm text-gold-deep">{state.message}</p> : null}
    </form>
  );
}
