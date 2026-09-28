"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type ActionResult } from "@/lib/admin/actions";
import { OPERATORS } from "@/lib/admin/session";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="ops-btn w-full"
      data-variant="navy"
      disabled={pending}
    >
      {pending ? "Checking…" : "Sign in"}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(loginAction, null);

  return (
    <form action={formAction} className="ops-card w-full max-w-sm p-6">
      <p className="ops-label">NorthPeak</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">
        Ops sign in
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ops-muted)]">
        Internal tool for the NorthPeak crew.
      </p>

      {next ? <input type="hidden" name="next" value={next} /> : null}

      <label className="mt-6 block">
        <span className="ops-label">Who is this?</span>
        <select name="name" className="ops-select mt-1.5" defaultValue={OPERATORS[0]} required>
          {OPERATORS.map((operator) => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="ops-label">Password</span>
        <input
          type="password"
          name="password"
          className="ops-input mt-1.5"
          autoComplete="current-password"
          required
        />
      </label>

      {/* One message for every failure, so a wrong name and a wrong password
          are indistinguishable from out here. */}
      {state?.error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-[#e7bcbc] bg-[var(--ops-lost-bg)] px-3 py-2 text-sm text-[var(--ops-lost-ink)]"
        >
          {state.error}
        </p>
      ) : null}

      <div className="mt-6">
        <SubmitButton />
      </div>
    </form>
  );
}
