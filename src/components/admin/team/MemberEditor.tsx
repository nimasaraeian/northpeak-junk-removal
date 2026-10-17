"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserAction, updateUserProfileAction } from "@/lib/admin/users-actions";
import type { UserProfile } from "@/lib/admin/user-profile";
import { useT } from "@/lib/i18n/provider";

/** Downscale an image file to a small square-ish JPEG data URL, in the browser. */
async function fileToAvatarDataUrl(file: File, max = 256, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", quality);
}

const ROLES = ["owner", "manager", "sales", "crew"] as const;
const STATUSES = ["active", "invited", "disabled"] as const;

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  sales: "Sales",
  crew: "Crew",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  invited: "Invited",
  disabled: "Disabled",
};

function Text({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="ops-label">{label}</span>
      <input
        className="ops-input mt-1.5"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="mt-1 block text-xs text-[var(--ops-faint)]">{hint}</span> : null}
    </label>
  );
}

export function MemberEditor({
  userId,
  email,
  account,
  profile: initialProfile,
}: {
  userId: number;
  email: string;
  account: { name: string; role: string; status: string };
  profile: UserProfile;
}) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(account.name);
  const [role, setRole] = useState(account.role);
  const [status, setStatus] = useState(account.status);
  const [p, setP] = useState<UserProfile>(initialProfile);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
  }

  async function onPickPhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      set("photoUrl", dataUrl);
    } catch {
      setError(t("Could not read that image — try a JPG or PNG."));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function flash(m: string) {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2500);
  }

  function saveAccount() {
    setError(null);
    startTransition(async () => {
      const result = await updateUserAction(userId, { name: name.trim(), role, status });
      if (!result.ok) {
        setError(result.error ?? t("That did not save."));
        return;
      }
      flash(t("Account saved."));
      router.refresh();
    });
  }

  function saveProfile() {
    setError(null);
    startTransition(async () => {
      const result = await updateUserProfileAction(userId, p);
      if (!result.ok) {
        setError(result.error ?? t("That did not save."));
        return;
      }
      flash(t("Profile saved."));
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      {/* Account */}
      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Account")}</h2>
        <p className="mt-0.5 text-xs text-[var(--ops-faint)]">{email}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Text label={t("Name")} value={name} onChange={setName} />
          <label className="block">
            <span className="ops-label">{t("Role")}</span>
            <select className="ops-select mt-1.5" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(ROLE_LABELS[r])}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="ops-label">{t("Status")}</span>
            <select
              className="ops-select mt-1.5"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(STATUS_LABELS[s])}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          className="ops-btn mt-3"
          data-variant="ghost"
          disabled={pending}
          onClick={saveAccount}
        >
          {t("Save account")}
        </button>
      </section>

      {/* Identity & contact */}
      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Identity & contact")}</h2>

        {/* Profile photo — upload from the device (downscaled in the browser) */}
        <div className="mt-3 flex items-center gap-4">
          {p.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.photoUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full object-cover"
              style={{ boxShadow: "0 0 0 2px var(--ops-border-strong)" }}
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--ops-surface-2)] text-xs text-[var(--ops-faint)]">
              {t("No photo")}
            </span>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onPickPhoto(e.target.files?.[0])}
            />
            <button
              type="button"
              className="ops-btn"
              data-variant="ghost"
              onClick={() => fileRef.current?.click()}
            >
              {p.photoUrl ? t("Change photo") : t("Upload photo")}
            </button>
            {p.photoUrl ? (
              <button
                type="button"
                className="text-xs text-[var(--ops-lost-ink)] hover:underline"
                onClick={() => set("photoUrl", "")}
              >
                {t("Remove")}
              </button>
            ) : null}
            <span className="w-full text-xs text-[var(--ops-faint)]">
              {t("Resized automatically. Remember to Save profile.")}
            </span>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Text label={t("Legal name")} value={p.legalName} onChange={(v) => set("legalName", v)} />
          <Text label={t("Preferred name")} value={p.preferredName} onChange={(v) => set("preferredName", v)} />
          <Text label={t("Phone")} value={p.phone} onChange={(v) => set("phone", v)} />
          <Text label={t("Date of birth")} type="date" value={p.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} />
          <Text label={t("Home address")} value={p.homeAddress} onChange={(v) => set("homeAddress", v)} />
        </div>
      </section>

      {/* Emergency contact */}
      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Emergency contact")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Text label={t("Name")} value={p.emergencyName} onChange={(v) => set("emergencyName", v)} />
          <Text label={t("Relationship")} value={p.emergencyRelationship} onChange={(v) => set("emergencyRelationship", v)} />
          <Text label={t("Phone")} value={p.emergencyPhone} onChange={(v) => set("emergencyPhone", v)} />
        </div>
      </section>

      {/* Employment */}
      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Employment")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Text label={t("Job title / function")} value={p.jobTitle} onChange={(v) => set("jobTitle", v)} />
          <label className="block">
            <span className="ops-label">{t("Type")}</span>
            <select
              className="ops-select mt-1.5"
              value={p.employmentType}
              onChange={(e) => set("employmentType", e.target.value as UserProfile["employmentType"])}
            >
              <option value="">{t("—")}</option>
              <option value="employee">{t("Employee")}</option>
              <option value="contractor">{t("Contractor")}</option>
            </select>
          </label>
          <label className="block">
            <span className="ops-label">{t("Employment status")}</span>
            <select
              className="ops-select mt-1.5"
              value={p.employmentStatus}
              onChange={(e) => set("employmentStatus", e.target.value as UserProfile["employmentStatus"])}
            >
              <option value="">{t("—")}</option>
              <option value="active">{t("Active")}</option>
              <option value="on_leave">{t("On leave")}</option>
              <option value="terminated">{t("Terminated")}</option>
            </select>
          </label>
          <Text label={t("Hire date")} type="date" value={p.hireDate} onChange={(v) => set("hireDate", v)} />
          <Text label={t("End date")} type="date" value={p.endDate} onChange={(v) => set("endDate", v)} />
        </div>
      </section>

      {/* Pay */}
      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Pay")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <label className="block">
            <span className="ops-label">{t("Pay type")}</span>
            <select
              className="ops-select mt-1.5"
              value={p.payType}
              onChange={(e) => set("payType", e.target.value as UserProfile["payType"])}
            >
              <option value="">{t("—")}</option>
              <option value="hourly">{t("Hourly")}</option>
              <option value="salary">{t("Salary")}</option>
            </select>
          </label>
          <Text label={t("Hourly rate ($)")} type="number" value={String(p.hourlyRate || "")} onChange={(v) => set("hourlyRate", Number(v) || 0)} />
          <Text label={t("Commission (%)")} type="number" value={String(p.commissionPct || "")} onChange={(v) => set("commissionPct", Number(v) || 0)} />
          <Text label={t("Sales target ($)")} type="number" value={String(p.salesTarget || "")} onChange={(v) => set("salesTarget", Number(v) || 0)} />
        </div>
      </section>

      {/* Canada compliance */}
      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Canada compliance")}</h2>
        <p className="mt-1 text-xs text-[var(--ops-faint)]">
          {t("Sensitive — visible to owners only. Stored in your database, never logged.")}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Text label={t("SIN")} value={p.sin} onChange={(v) => set("sin", v)} />
          <Text label={t("WorkSafeBC / WCB #")} value={p.wcbNumber} onChange={(v) => set("wcbNumber", v)} />
          <Text label={t("Driver's licence #")} value={p.driversLicence} onChange={(v) => set("driversLicence", v)} />
          <Text label={t("Licence class")} value={p.driversLicenceClass} onChange={(v) => set("driversLicenceClass", v)} />
          <Text label={t("Licence expiry")} type="date" value={p.driversLicenceExpiry} onChange={(v) => set("driversLicenceExpiry", v)} />
          <Text label={t("Work eligibility")} value={p.workEligibility} onChange={(v) => set("workEligibility", v)} placeholder={t("Citizen / PR / work permit…")} />
        </div>
      </section>

      {/* Operational */}
      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Operational")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="ops-label">{t("Calendar colour")}</span>
            <input
              className="ops-input mt-1.5 h-10"
              type="color"
              value={p.colour || "#16324f"}
              onChange={(e) => set("colour", e.target.value)}
            />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="ops-label">{t("Notes")}</span>
          <textarea
            className="ops-textarea mt-1.5"
            rows={3}
            value={p.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </label>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="ops-label">{t("Documents")}</span>
            <button
              type="button"
              className="ops-btn"
              data-variant="ghost"
              onClick={() => set("documents", [...p.documents, { label: "", url: "" }])}
            >
              + {t("Add")}
            </button>
          </div>
          <div className="mt-2 grid gap-2">
            {p.documents.map((doc, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
                <input
                  className="ops-input"
                  placeholder={t("Label (contract, insurance…)")}
                  value={doc.label}
                  onChange={(e) =>
                    set(
                      "documents",
                      p.documents.map((d, j) => (j === i ? { ...d, label: e.target.value } : d)),
                    )
                  }
                />
                <input
                  className="ops-input"
                  placeholder="https://…"
                  value={doc.url}
                  onChange={(e) =>
                    set(
                      "documents",
                      p.documents.map((d, j) => (j === i ? { ...d, url: e.target.value } : d)),
                    )
                  }
                />
                <button
                  type="button"
                  className="ops-btn"
                  data-variant="ghost"
                  aria-label={t("Remove")}
                  onClick={() => set("documents", p.documents.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-[var(--ops-border)] bg-[var(--ops-surface)]/95 py-3 backdrop-blur">
        <button
          type="button"
          className="ops-btn"
          data-variant="primary"
          disabled={pending}
          onClick={saveProfile}
        >
          {pending ? t("Saving…") : t("Save profile")}
        </button>
        {msg ? <span className="text-sm text-[var(--ops-won-ink)]">{msg}</span> : null}
        {error ? (
          <span role="alert" className="text-sm text-[var(--ops-lost-ink)]">
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}
