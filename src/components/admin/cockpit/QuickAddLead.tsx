"use client";

import { useState, useTransition } from "react";
import { createLeadAction } from "@/lib/admin/crm-actions";
import { LEAD_OWNERS, LEAD_SOURCES } from "@/lib/db/schema";

type T = (s: string) => string;

const SOURCE_LABEL: Record<string, string> = {
  website_form: "Website",
  google: "Google",
  referral: "Referral",
  repeat: "Repeat",
  ads: "Ads",
  walk_in: "Walk-in",
  other: "Other",
};

export function QuickAddLeadBody({ t, onCreated }: { t: T; onCreated: () => void }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({
    name: "",
    phone: "",
    area: "",
    email: "",
    source: "website_form",
    owner: "unassigned",
    message: "",
    nextFollowUpAt: "",
  });

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  function submit() {
    setErr(null);
    start(async () => {
      const r = await createLeadAction(f);
      if (!r.ok) setErr(r.error ?? "That did not save.");
      else onCreated();
    });
  }

  return (
    <div>
      <div className="f">
        <label>{t("Name")}</label>
        <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder={t("Customer name")} />
      </div>
      <div className="two">
        <div className="f">
          <label>{t("Phone")}</label>
          <input value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="f">
          <label>{t("Area")}</label>
          <input value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="North Vancouver" />
        </div>
      </div>
      <div className="two">
        <div className="f">
          <label>{t("Email")}</label>
          <input value={f.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="f">
          <label>{t("Next follow-up")}</label>
          <input type="date" value={f.nextFollowUpAt} onChange={(e) => set("nextFollowUpAt", e.target.value)} />
        </div>
      </div>
      <div className="two">
        <div className="f">
          <label>{t("Source")}</label>
          <select value={f.source} onChange={(e) => set("source", e.target.value)}>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>{t(SOURCE_LABEL[s] ?? s)}</option>
            ))}
          </select>
        </div>
        <div className="f">
          <label>{t("Owner")}</label>
          <select value={f.owner} onChange={(e) => set("owner", e.target.value)}>
            {LEAD_OWNERS.map((o) => (
              <option key={o} value={o}>{o === "unassigned" ? t("Unassigned") : o}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="f">
        <label>{t("What they said")}</label>
        <textarea value={f.message} onChange={(e) => set("message", e.target.value)} placeholder={t("Paste the inbound message here…")} />
      </div>

      {err ? <div className="err">{err}</div> : null}

      <button className="btn p" disabled={pending || !f.name.trim()} onClick={submit}>
        {pending ? t("Saving…") : t("Add lead")}
      </button>
    </div>
  );
}
