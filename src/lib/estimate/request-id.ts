import { randomUUID } from "crypto";

export function generateRequestId(): string {
  return `NP-${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}
