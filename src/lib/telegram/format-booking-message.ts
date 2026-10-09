import { escapeTelegramHtml } from "@/lib/telegram/escape-html";

/**
 * Telegram message for a new online booking.
 *
 * A booking is a hotter lead than an estimate — the customer has already
 * picked a date and arrival window — so the message leads with the requested
 * slot and ends with the one action the team owes it: call to confirm.
 */
export interface BookingNotificationContext {
  reference: string;
  submittedAt: Date;
  name: string;
  phone: string;
  email: string;
  serviceName: string;
  loadLabel: string;
  /** Human slot label, e.g. "Sat, Oct 10, 2026 · Morning (8:00 – 11:00 AM)". */
  slotLabel: string;
  /** Auto estimate range text, e.g. "$320 – $480". */
  estimate: string;
  area?: string;
  address?: string;
  description?: string;
  accessNotes?: string;
}

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

export function formatBookingTelegramMessage(context: BookingNotificationContext): string {
  const lines = [
    "📅 <b>NEW NORTHPEAK ONLINE BOOKING</b>",
    "",
    `🆔 <b>Reference:</b> ${escapeTelegramHtml(context.reference)}`,
    `🕒 <b>Submitted:</b> ${escapeTelegramHtml(formatSubmittedAt(context.submittedAt))}`,
    "",
    "🗓 <b>Requested slot</b>",
    escapeTelegramHtml(context.slotLabel),
    "",
    "👤 <b>Customer</b>",
    escapeTelegramHtml(context.name),
    "",
    "📞 <b>Phone</b>",
    escapeTelegramHtml(context.phone),
    "",
    "📧 <b>Email</b>",
    escapeTelegramHtml(context.email),
    "",
    "🧹 <b>Service</b>",
    escapeTelegramHtml(context.serviceName),
    "",
    "🚛 <b>Load</b>",
    escapeTelegramHtml(context.loadLabel),
    "",
    "💰 <b>Auto estimate</b>",
    escapeTelegramHtml(context.estimate),
  ];

  if (context.area?.trim()) {
    lines.push("", "📍 <b>Area</b>", escapeTelegramHtml(context.area));
  }
  if (context.address?.trim()) {
    lines.push("", "🏠 <b>Address</b>", escapeTelegramHtml(context.address));
  }
  if (context.description?.trim()) {
    lines.push("", "📝 <b>What to remove</b>", escapeTelegramHtml(context.description));
  }
  if (context.accessNotes?.trim()) {
    lines.push("", "🚪 <b>Access notes</b>", escapeTelegramHtml(context.accessNotes));
  }

  lines.push(
    "",
    "⚠️ <b>Action:</b> Call to confirm the slot, then mark the job confirmed in the panel.",
  );

  return lines.join("\n");
}
