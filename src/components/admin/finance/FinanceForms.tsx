"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addExpenseAction,
  addTimeEntryAction,
  deleteExpenseAction,
  deleteTimeEntryAction,
} from "@/lib/admin/finance-actions";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@/lib/admin/finance-constants";
import { useT } from "@/lib/i18n/provider";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TimeEntryForm({ people }: { people: string[] }) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [person, setPerson] = useState(people[0] ?? "");
  const [workDate, setWorkDate] = useState(todayIso());
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");
  const [note, setNote] = useState("");

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addTimeEntryAction({
        person: person.trim(),
        workDate,
        hours: Number(hours),
        rateDollars: Number(rate),
        note: note.trim(),
      });
      if (!result.ok) {
        setError(result.error ?? t("That entry did not save."));
        return;
      }
      setHours("");
      setNote("");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_8rem_6rem_7rem]">
        <label className="block">
          <span className="sr-only">{t("Person")}</span>
          <input
            className="ops-input"
            list="np-people"
            placeholder={t("Person")}
            value={person}
            onChange={(event) => setPerson(event.target.value)}
          />
          <datalist id="np-people">
            {people.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="sr-only">{t("Date")}</span>
          <input
            className="ops-input"
            type="date"
            value={workDate}
            onChange={(event) => setWorkDate(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="sr-only">{t("Hours")}</span>
          <input
            className="ops-input ops-num"
            type="number"
            min="0"
            step="0.25"
            placeholder={t("Hours")}
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="sr-only">{t("Rate")}</span>
          <input
            className="ops-input ops-num"
            type="number"
            min="0"
            step="0.5"
            placeholder={t("$/hr")}
            value={rate}
            onChange={(event) => setRate(event.target.value)}
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          className="ops-input flex-1"
          placeholder={t("Note (optional)")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <button
          type="button"
          className="ops-btn"
          data-variant="navy"
          disabled={pending || !person.trim() || !(Number(hours) > 0)}
          onClick={submit}
        >
          {pending ? t("Saving…") : t("Log time")}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ExpenseForm() {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [expenseDate, setExpenseDate] = useState(todayIso());
  const [category, setCategory] = useState<ExpenseCategory>("dump_fee");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [note, setNote] = useState("");

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addExpenseAction({
        expenseDate,
        category,
        amountDollars: Number(amount),
        vendor: vendor.trim(),
        note: note.trim(),
      });
      if (!result.ok) {
        setError(result.error ?? t("That expense did not save."));
        return;
      }
      setAmount("");
      setVendor("");
      setNote("");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[8rem_1fr_7rem]">
        <label className="block">
          <span className="sr-only">{t("Date")}</span>
          <input
            className="ops-input"
            type="date"
            value={expenseDate}
            onChange={(event) => setExpenseDate(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="sr-only">{t("Category")}</span>
          <select
            className="ops-select"
            value={category}
            onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
          >
            {EXPENSE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {t(EXPENSE_CATEGORY_LABELS[value])}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">{t("Amount")}</span>
          <input
            className="ops-input ops-num"
            type="number"
            min="0"
            step="0.01"
            placeholder={t("Amount $")}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          className="ops-input"
          placeholder={t("Vendor (optional)")}
          value={vendor}
          onChange={(event) => setVendor(event.target.value)}
        />
        <input
          className="ops-input flex-1"
          placeholder={t("Note (optional)")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <button
          type="button"
          className="ops-btn"
          data-variant="navy"
          disabled={pending || !(Number(amount) > 0)}
          onClick={submit}
        >
          {pending ? t("Saving…") : t("Add expense")}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function DeleteButton({ kind, id }: { kind: "time" | "expense"; id: number }) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="text-xs text-[var(--ops-lost-ink)] hover:underline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result =
            kind === "time"
              ? await deleteTimeEntryAction(id)
              : await deleteExpenseAction(id);
          if (result.ok) router.refresh();
        });
      }}
    >
      {t("Remove")}
    </button>
  );
}
