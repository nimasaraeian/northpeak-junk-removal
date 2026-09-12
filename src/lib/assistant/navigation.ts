import type { AssistantAction, AssistantActionKey } from "@/lib/assistant/types";

export const assistantActions: Record<AssistantActionKey, AssistantAction> = {
  estimate: {
    key: "estimate",
    label: "Get an Estimate",
    href: "/estimate",
  },
  services: {
    key: "services",
    label: "View Services",
    href: "/services",
  },
  serviceArea: {
    key: "serviceArea",
    label: "Check My Area",
    href: "/estimate",
  },
  contact: {
    key: "contact",
    label: "Contact NorthPeak",
    href: "/contact",
  },
  howItWorks: {
    key: "howItWorks",
    label: "How It Works",
    href: "/how-it-works",
  },
  about: {
    key: "about",
    label: "About NorthPeak",
    href: "/about",
  },
  locations: {
    key: "locations",
    label: "Service Areas",
    href: "/locations",
  },
};

const allowedKeys = new Set<string>(Object.keys(assistantActions));

export function resolveAssistantActions(keys: string[]): AssistantAction[] {
  const seen = new Set<AssistantActionKey>();
  const resolved: AssistantAction[] = [];

  for (const key of keys) {
    if (!allowedKeys.has(key)) continue;
    const action = assistantActions[key as AssistantActionKey];
    if (seen.has(action.key)) continue;
    seen.add(action.key);
    resolved.push(action);
    if (resolved.length >= 3) break;
  }

  return resolved;
}

export function publicRoutes(): string[] {
  return Object.values(assistantActions).map((action) => action.href);
}
