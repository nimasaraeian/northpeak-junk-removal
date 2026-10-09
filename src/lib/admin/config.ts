import { isDatabaseConfigured } from "@/lib/db/client";

/**
 * Environment the admin panel needs, and what degrades when a piece is
 * missing. Nothing here throws: `/admin` has to be able to render a setup
 * screen that *explains* the gap, which it cannot do if reading the config
 * crashes first.
 */

export interface EnvRequirement {
  name: string;
  present: boolean;
  required: boolean;
  description: string;
}

export function adminPassword(): string | undefined {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : undefined;
}

export function anthropicApiKey(): string | undefined {
  const value = process.env.ANTHROPIC_API_KEY?.trim();
  return value ? value : undefined;
}

/**
 * The vision model. Pinned by the brief to Sonnet 4.5; overridable without a
 * deploy so the team can move to a newer model when they want to.
 */
export function visionModel(): string {
  return process.env.ANTHROPIC_VISION_MODEL?.trim() || "claude-sonnet-4-5";
}

export function isPhotoAssistAvailable(): boolean {
  return anthropicApiKey() !== undefined;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  /** The sending number, E.164 (e.g. +16045551234). */
  fromNumber: string;
}

/**
 * Twilio credentials, or undefined when any of the three is missing.
 *
 * All three are required to send; a partial set is treated as "off" so the
 * Send SMS box simply hides rather than erroring mid-send.
 */
export function twilioConfig(): TwilioConfig | undefined {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
  if (!accountSid || !authToken || !fromNumber) return undefined;
  return { accountSid, authToken, fromNumber };
}

export function isSmsConfigured(): boolean {
  return twilioConfig() !== undefined;
}

/**
 * Shared secret the AI phone receptionist (Retell) sends on every call to our
 * voice endpoints, in the `X-Voice-Secret` header. The endpoints refuse without
 * it, so only the configured agent can read availability or book a visit.
 */
export function voiceApiSecret(): string | undefined {
  const value = process.env.VOICE_API_SECRET?.trim();
  return value ? value : undefined;
}

export function isVoiceConfigured(): boolean {
  return voiceApiSecret() !== undefined;
}

/** Fallback Google Maps search for the business, used when no direct review link is set. */
const DEFAULT_REVIEW_URL =
  "https://www.google.com/maps/search/?api=1&query=NorthPeak+Junk+Removal+564+West+Keith+Rd+North+Vancouver";

/**
 * Where the post-job review SMS points the customer. Prefer a direct "write a
 * review" short link from the Google Business Profile (set GOOGLE_REVIEW_URL);
 * without it, fall back to a Maps search for the business so the link still works.
 */
export function reviewRequestUrl(): string {
  return process.env.GOOGLE_REVIEW_URL?.trim() || DEFAULT_REVIEW_URL;
}

/**
 * The post-job review request sends only when SMS is configured, and can be
 * switched off without touching Twilio by setting REVIEW_SMS_ENABLED=false.
 */
export function isReviewRequestEnabled(): boolean {
  return isSmsConfigured() && process.env.REVIEW_SMS_ENABLED?.trim().toLowerCase() !== "false";
}

export function envRequirements(): EnvRequirement[] {
  return [
    {
      name: "DATABASE_URL",
      present: isDatabaseConfigured(),
      required: true,
      description: "Neon serverless Postgres connection string. Quotes and settings live here.",
    },
    {
      name: "ADMIN_PASSWORD",
      present: adminPassword() !== undefined,
      required: true,
      description: "Shared login password for the two-person team. Also signs the session cookie.",
    },
    {
      name: "ANTHROPIC_API_KEY",
      present: anthropicApiKey() !== undefined,
      required: false,
      description:
        "Enables the photo assist box on New Quote. Without it the catalog picker works on its own.",
    },
    {
      name: "LEAD_INTAKE_SECRET",
      present: (process.env.LEAD_INTAKE_SECRET?.trim() ?? "") !== "",
      required: false,
      description:
        "Opens POST /api/leads/intake to outside callers. Unset closes that endpoint; our own estimate form files leads directly either way.",
    },
    {
      name: "TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER",
      present: isSmsConfigured(),
      required: false,
      description:
        "Sends customer SMS from the panel via Twilio. All three must be set (From is the E.164 number, e.g. +16045551234). Unset hides the Send SMS box.",
    },
    {
      name: "VOICE_API_SECRET",
      present: isVoiceConfigured(),
      required: false,
      description:
        "Shared secret the AI phone receptionist (Retell) sends in X-Voice-Secret to read availability and book estimate visits via /api/voice/*. Unset keeps those endpoints closed.",
    },
    {
      name: "GOOGLE_REVIEW_URL",
      present: (process.env.GOOGLE_REVIEW_URL?.trim() ?? "") !== "",
      required: false,
      description:
        "Direct 'write a review' link from the Google Business Profile, texted to a customer when a removal job is marked done (needs SMS on). Unset falls back to a Maps search; set REVIEW_SMS_ENABLED=false to turn the review text off.",
    },
  ];
}

export function missingRequiredEnv(): EnvRequirement[] {
  return envRequirements().filter((item) => item.required && !item.present);
}

export function isAdminConfigured(): boolean {
  return missingRequiredEnv().length === 0;
}
