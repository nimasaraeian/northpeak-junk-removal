"use client";

import { useState, useTransition } from "react";
import {
  updateLeadStatusAction,
  updateLeadFieldsAction,
  logActivityAction,
} from "@/lib/admin/crm-actions";
import { sendSmsAction } from "@/lib/admin/sms-actions";
import { PIPELINE_ORDER } from "@/lib/admin/crm";
import { LEAD_OWNERS, type LeadRow, type LeadStatus } from "@/lib/db/schema";

type T = (s: string) => string;

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
  won: "Won",
  lost: "Lost",
};

function isoDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function LeadDrawerBody({
  lead,
  t,
  onChanged,
  smsEnabled,
}: {
  lead: LeadRow;
  t: T;
  onChanged: () => void;
  smsEnabled: boolean;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [askLost, setAskLost] = useState(false);
  const [note, setNote] = useState("");
  const [smsPhone, setSmsPhone] = useState(lead.phone);
  const [smsBody, setSmsBody] = useState("");

  const firstName = (lead.name || "").trim().split(/\s+/)[0] || "there";
  const REVIEW_URL = "https://g.page/r/CQpStjbMaZkzEBM/review";
  const smsTemplates = [
    {
      id: "confirm",
      label: t("Confirm"),
      body: `Hi ${firstName}, this is NorthPeak Junk Removal confirming your booking. We'll text you before we arrive — reply here with any questions.`,
    },
    {
      id: "otw",
      label: t("On our way"),
      body: `Hi ${firstName}, NorthPeak Junk Removal here — our crew is on the way and will arrive shortly. Reply here if anything changes.`,
    },
    {
      id: "review",
      label: t("Review"),
      body: `Hi ${firstName}, thanks for choosing NorthPeak Junk Removal! If you were happy with the job, a quick Google review really helps us: ${REVIEW_URL} — reply STOP to opt out.`,
    },
  ];

  function run(p: Promise<{ ok: boolean; error?: string }>) {
    setErr(null);
    start(async () => {
      const r = await p;
      if (!r.ok) setErr(r.error ?? "Something went wrong.");
      else onChanged();
    });
  }

  function setStatus(s: LeadStatus) {
    if (s === lead.status) return;
    if (s === "lost") {
      setAskLost(true);
      return;
    }
    run(updateLeadStatusAction(lead.id, s));
  }

  return (
    <div>
      <div className="f">
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          {[lead.phone, lead.email, lead.area].filter(Boolean).join(" · ") || "—"}
        </div>
      </div>

      {lead.message ? (
        <div className="note">
          <span>{t("What they said")}</span>
          {lead.message}
        </div>
      ) : null}

      <div className="f">
        <label>{t("Status")}</label>
        <div className="seg">
          {PIPELINE_ORDER.map((s) => (
            <button key={s} className={s === lead.status ? "on" : ""} disabled={pending} onClick={() => setStatus(s)}>
              {t(STATUS_LABEL[s])}
            </button>
          ))}
        </div>
      </div>

      {askLost ? (
        <div className="f">
          <label>{t("Why lost?")}</label>
          <input value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder={t("A few words")} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn p sm" disabled={pending || !lostReason.trim()} onClick={() => { run(updateLeadStatusAction(lead.id, "lost", lostReason.trim())); setAskLost(false); }}>
              {t("Mark lost")}
            </button>
            <button className="btn sm" onClick={() => setAskLost(false)}>{t("Cancel")}</button>
          </div>
        </div>
      ) : null}

      <div className="two">
        <div className="f">
          <label>{t("Owner")}</label>
          <select defaultValue={lead.owner} disabled={pending} onChange={(e) => run(updateLeadFieldsAction(lead.id, { owner: e.target.value }))}>
            {LEAD_OWNERS.map((o) => (
              <option key={o} value={o}>{o === "unassigned" ? t("Unassigned") : o}</option>
            ))}
          </select>
        </div>
        <div className="f">
          <label>{t("Next follow-up")}</label>
          <input type="date" defaultValue={isoDate(lead.nextFollowUpAt)} disabled={pending} onChange={(e) => run(updateLeadFieldsAction(lead.id, { nextFollowUpAt: e.target.value }))} />
        </div>
      </div>

      <div className="f">
        <label>{t("Add a note")}</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Call result, next step, anything…")} />
        <button
          className="btn sm"
          style={{ marginTop: 8 }}
          disabled={pending || !note.trim()}
          onClick={() => run(logActivityAction("lead", lead.id, "note", note.trim()).then((r) => { if (r.ok) setNote(""); return r; }))}
        >
          {t("Save note")}
        </button>
      </div>

      <div className="f">
        <label>{t("Send SMS")}</label>
        {smsEnabled ? (
          <>
            <input
              value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
              placeholder={t("Phone")}
              inputMode="tel"
            />
            <div className="seg" style={{ marginTop: 8 }}>
              {smsTemplates.map((tpl) => (
                <button key={tpl.id} type="button" onClick={() => setSmsBody(tpl.body)}>
                  {tpl.label}
                </button>
              ))}
            </div>
            <textarea
              style={{ marginTop: 8 }}
              value={smsBody}
              onChange={(e) => setSmsBody(e.target.value)}
              placeholder={t("Write a text to the customer…")}
            />
            <button
              className="btn p sm"
              style={{ marginTop: 8 }}
              disabled={pending || !smsBody.trim() || !smsPhone.trim()}
              onClick={() =>
                run(
                  sendSmsAction({
                    entityType: "lead",
                    entityId: lead.id,
                    to: smsPhone.trim(),
                    body: smsBody.trim(),
                  }).then((r) => {
                    if (r.ok) setSmsBody("");
                    return r;
                  }),
                )
              }
            >
              {t("Send SMS")}
            </button>
          </>
        ) : (
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            {t("Add your Twilio keys in Vercel to send SMS from here.")}
          </div>
        )}
      </div>

      {err ? <div className="err">{err}</div> : null}
    </div>
  );
}
