import { getService } from "@/content/services";
import { escapeTelegramHtml } from "@/lib/telegram/escape-html";
import type { EstimateDraft } from "@/types";

export interface EstimateNotificationContext {
  draft: EstimateDraft;
  requestId: string;
  submittedAt: Date;
  areaCity?: string;
  areaFsa: string;
  photoCount: number;
  loadManifest: unknown;
}

const preferredContactLabels: Record<EstimateDraft["preferredContact"], string> = {
  phone: "Phone",
  text: "Text",
  email: "Email",
};

function formatSubmittedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(date);
}

function summarizeLoadManifest(manifest: unknown): string | null {
  if (!Array.isArray(manifest) || manifest.length === 0) return null;

  const lines = manifest
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      if (typeof record.name !== "string") return null;
      const quantity =
        typeof record.quantity === "number" && record.quantity > 1
          ? ` ×${record.quantity}`
          : "";
      const cubicFeet =
        typeof record.cubicFeet === "number" ? ` (~${record.cubicFeet} cu ft)` : "";
      return `${record.name}${quantity}${cubicFeet}`;
    })
    .filter((line): line is string => Boolean(line));

  return lines.length > 0 ? lines.join("\n") : null;
}

export function formatEstimateTelegramMessage(context: EstimateNotificationContext): string {
  const { draft, requestId, submittedAt, areaCity, areaFsa, photoCount, loadManifest } =
    context;

  const serviceName =
    getService(draft.serviceSlug)?.name ?? (draft.serviceSlug || "Unknown service");
  const locationLine = areaCity
    ? `${draft.postalCode}\n${areaCity}`
    : `${draft.postalCode}\n${areaFsa}`;

  const lines = [
    "🔔 <b>NEW NORTHPEAK ESTIMATE REQUEST</b>",
    "",
    `🆔 <b>Request:</b> ${escapeTelegramHtml(requestId)}`,
    `🕒 <b>Submitted:</b> ${escapeTelegramHtml(formatSubmittedAt(submittedAt))}`,
    "",
    "👤 <b>Customer</b>",
    escapeTelegramHtml(draft.name),
    "",
    "📞 <b>Phone</b>",
    escapeTelegramHtml(draft.phone),
    "",
    "📧 <b>Email</b>",
    escapeTelegramHtml(draft.email),
    "",
    "💬 <b>Preferred contact</b>",
    escapeTelegramHtml(preferredContactLabels[draft.preferredContact]),
    "",
    "📍 <b>Location</b>",
    escapeTelegramHtml(locationLine),
    "",
    "🧹 <b>Service</b>",
    escapeTelegramHtml(serviceName),
    "",
    "🚛 <b>Estimated load</b>",
    escapeTelegramHtml(draft.volume),
  ];

  if (draft.description.trim()) {
    lines.push("", "📝 <b>What needs to be removed?</b>", escapeTelegramHtml(draft.description));
  }

  if (draft.accessNotes.trim()) {
    lines.push("", "🚪 <b>Access notes</b>", escapeTelegramHtml(draft.accessNotes));
  }

  const manifestSummary = summarizeLoadManifest(loadManifest);
  if (manifestSummary) {
    lines.push("", "📦 <b>Load summary</b>", escapeTelegramHtml(manifestSummary));
  }

  lines.push(
    "",
    "📸 <b>Photos</b>",
    photoCount > 0 ? `${photoCount} attached` : "None attached",
  );

  return lines.join("\n");
}

export function formatPhotoCaption(requestId: string): string {
  return `📸 Photos · ${escapeTelegramHtml(requestId)}`;
}
