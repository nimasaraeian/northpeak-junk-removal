import { getService } from "@/content/services";
import { getVolumeLevel } from "@/content/truck";
import { loadPricingSettings } from "@/lib/admin/data";
import {
  bookingSlot,
  estimateForCubicFeet,
  getBookingWindow,
  isBookableLevelId,
  isBookingWindowId,
  isValidBookingDate,
  slotLabel,
  type BookingWindowId,
} from "@/lib/booking/booking-core";
import { insertOnlineBooking } from "@/lib/booking/crm-booking";
import { isBookingEnabled } from "@/lib/booking/feature";
import { generateRequestId } from "@/lib/estimate/request-id";
import { checkServiceArea } from "@/lib/postal";
import { formatRange } from "@/lib/quote-engine";

/**
 * Online booking — the server-side core.
 *
 * Re-validates and re-prices everything the browser sent (the client figure is
 * for display only), then files the booking through `insertOnlineBooking`.
 * Kept out of the `"use server"` module and free of request globals so it can
 * be unit-tested directly, exactly like `submitEstimateCore`.
 */

export interface BookingActionState {
  ok: boolean;
  message: string;
  reference?: string;
  customerName?: string;
  slotLabel?: string;
  estimate?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function read(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Today's date (YYYY-MM-DD) in the business timezone, for a past-date guard. */
function todayInVancouver(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const map: Record<string, string> = {};
  for (const part of parts) if (part.type !== "literal") map[part.type] = part.value;
  return `${map.year}-${map.month}-${map.day}`;
}

export interface SubmitBookingOptions {
  now?: () => Date;
  createRequestId?: () => string;
}

export async function submitBookingCore(
  formData: FormData,
  options: SubmitBookingOptions = {},
): Promise<BookingActionState> {
  // The whole public door is gated off by default. Even if a form were posted
  // directly, nothing is created while the flag is off.
  if (!isBookingEnabled()) {
    return {
      ok: false,
      message:
        "Online booking isn't open yet — please request a free estimate and we'll follow up with a price.",
    };
  }

  // Honeypot: a real person leaves it empty; a bot fills every field. Report
  // success without writing so the bot learns nothing.
  if (read(formData, "company")) {
    return { ok: true, message: "Thanks — your booking request has been received." };
  }

  const name = read(formData, "name");
  const email = read(formData, "email");
  const phone = read(formData, "phone");
  const postalCode = read(formData, "postalCode");
  const address = read(formData, "address");
  const accessNotes = read(formData, "accessNotes");
  const description = read(formData, "description");
  const levelId = read(formData, "levelId");
  const serviceSlug = read(formData, "serviceSlug");
  const dateStr = read(formData, "date");
  const windowId = read(formData, "window");

  const area = checkServiceArea(postalCode);
  if ("error" in area) {
    return { ok: false, message: area.error };
  }

  const service = getService(serviceSlug);
  if (!service) {
    return { ok: false, message: "Choose a service so we can scope the visit." };
  }

  if (!isBookableLevelId(levelId)) {
    return { ok: false, message: "Choose how much needs to go." };
  }

  if (!isBookingWindowId(windowId) || !isValidBookingDate(dateStr)) {
    return { ok: false, message: "Pick a date and an arrival window." };
  }

  const now = options.now?.() ?? new Date();
  if (dateStr < todayInVancouver(now)) {
    return { ok: false, message: "Pick a date that hasn't passed yet." };
  }

  const slot = bookingSlot(dateStr, windowId as BookingWindowId);
  if (!slot) {
    return { ok: false, message: "Pick a date and an arrival window." };
  }

  if (name.length < 2) {
    return { ok: false, message: "Please add your name." };
  }
  if (!emailPattern.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return { ok: false, message: "Enter a phone number we can reach." };
  }
  if (!description) {
    return { ok: false, message: "Tell us what needs to be removed." };
  }

  const level = getVolumeLevel(levelId);
  const settings = await loadPricingSettings();
  const estimate = estimateForCubicFeet(level.cubicFeet, settings);
  const estimateText = formatRange(estimate.lowCents, estimate.highCents);
  const slotText = slotLabel(dateStr, windowId as BookingWindowId);
  const window = getBookingWindow(windowId);
  const reference = options.createRequestId?.() ?? generateRequestId();

  const customerArea = area.city ?? "";
  const addressLine = [address, customerArea, postalCode].filter(Boolean).join(", ");

  const leadNote = `Online booking ${reference} — ${service.name}, ${level.label}. Requested ${slotText}. Estimate ${estimateText}.`;

  const jobNotes = [
    `ONLINE BOOKING — confirm the slot with the customer.`,
    `Service: ${service.name}`,
    `Load: ${level.label} (~${level.cubicFeet} cu ft)`,
    `Requested: ${slotText}`,
    `Estimate (auto): ${estimateText}`,
    address ? `Address: ${address}` : null,
    accessNotes ? `Access: ${accessNotes}` : null,
    description ? `What to remove: ${description}` : null,
    `Contact: ${phone}${email ? ` · ${email}` : ""}`,
    `Reference: ${reference}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await insertOnlineBooking({
    name,
    phone,
    email,
    area: customerArea,
    address: addressLine,
    message: description,
    leadNote,
    jobNotes,
    scheduledStart: slot.start,
    scheduledEnd: slot.end,
    queueTitle: `Confirm booking — ${name}, ${window?.label ?? ""} ${dateStr}`.trim(),
    queueSummary: `${service.name} · ${level.label} · ${slotText}. Call to confirm, then set the job to confirmed.`,
    queuePayload: {
      reference,
      service: service.name,
      level: level.label,
      slot: slotText,
      estimate: estimateText,
      name,
      phone,
      email,
      address: addressLine,
      description,
      accessNotes,
    },
  });

  if (!result.ok) {
    return {
      ok: false,
      message:
        "We couldn't save your booking just now. Your details are still here — please try again, or call us.",
    };
  }

  return {
    ok: true,
    reference,
    customerName: name,
    slotLabel: slotText,
    estimate: estimateText,
    message: `You're booked in for ${slotText}. We'll call to confirm and lock the time. Your estimate range is ${estimateText}.`,
  };
}
