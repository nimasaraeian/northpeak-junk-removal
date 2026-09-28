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
  ];
}

export function missingRequiredEnv(): EnvRequirement[] {
  return envRequirements().filter((item) => item.required && !item.present);
}

export function isAdminConfigured(): boolean {
  return missingRequiredEnv().length === 0;
}
