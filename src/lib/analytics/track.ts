"use client";

import { sendGAEvent } from "@next/third-parties/google";
import {
  contactClickEvent,
  estimateCtaClickEvent,
  generateLeadEvent,
  type ContactMethod,
  type GaEvent,
  type LeadForm,
} from "@/lib/analytics/events";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export function isAnalyticsEnabled() {
  return GA_MEASUREMENT_ID.length > 0;
}

/**
 * Send one event, or do nothing at all.
 *
 * Local development and preview deploys run without NEXT_PUBLIC_GA_ID set.
 * `sendGAEvent` logs a warning on every call in that case, so we check first
 * and stay silent rather than filling the console with noise.
 */
export function trackEvent({ name, params }: GaEvent) {
  if (!isAnalyticsEnabled()) return;
  sendGAEvent("event", name, params);
}

function currentPath() {
  return typeof window === "undefined" ? "/" : window.location.pathname;
}

export function trackContactClick(method: ContactMethod, linkLocation: string) {
  trackEvent(contactClickEvent(method, linkLocation, currentPath()));
}

export function trackEstimateCtaClick(linkLocation: string) {
  trackEvent(estimateCtaClickEvent(linkLocation, currentPath()));
}

/**
 * Call this only after the server has confirmed the submission.
 */
export function trackGenerateLead(form: LeadForm) {
  trackEvent(generateLeadEvent(form, currentPath()));
}
