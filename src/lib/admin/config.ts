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
  ];
}

export function missingRequiredEnv(): EnvRequirement[] {
  return envRequirements().filter((item) => item.required && !item.present);
}

export function isAdminConfigured(): boolean {
  return missingRequiredEnv().length === 0;
}
