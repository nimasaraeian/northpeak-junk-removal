/**
 * GA4 event shapes and the pure logic behind them.
 *
 * Nothing in this file touches `window`, so the classification rules that
 * decide "is this a WhatsApp link?" can be unit tested directly.
 *
 * Privacy rule for every helper here: the params we build carry no personal
 * data. No names, no email addresses, no phone numbers, no postal codes, no
 * free-text the visitor typed, and no reference IDs that point back at a
 * lead record. Only the channel that was clicked, where on the page it sat,
 * and the path of the page itself.
 */

export const GA_EVENTS = {
  contactClick: "contact_click",
  estimateCtaClick: "estimate_cta_click",
  generateLead: "generate_lead",
} as const;

export type ContactMethod = "phone" | "whatsapp" | "telegram" | "email";

export type LeadForm = "estimate" | "contact";

export type GaEvent = {
  name: string;
  params: Record<string, string>;
};

const WHATSAPP_HOSTS = new Set([
  "wa.me",
  "api.whatsapp.com",
  "web.whatsapp.com",
  "chat.whatsapp.com",
  "whatsapp.com",
]);

const TELEGRAM_HOSTS = new Set(["t.me", "telegram.me", "telegram.dog"]);

function stripWww(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

/**
 * Classify a raw href into the contact channel it opens, or null when the link
 * is not a contact channel at all.
 *
 * Hrefs arrive in every shape an author might write: `tel:`, `mailto:`, the
 * app schemes (`whatsapp://`, `tg://`), and ordinary https links to wa.me or
 * t.me. Relative hrefs are resolved against the page origin so a same-origin
 * `/estimate` link does not get mistaken for anything else.
 */
export function classifyContactHref(href: string | null | undefined): ContactMethod | null {
  if (!href) return null;

  const raw = href.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();

  if (lower.startsWith("tel:")) return "phone";
  if (lower.startsWith("sms:")) return "phone";
  if (lower.startsWith("mailto:")) return "email";
  if (lower.startsWith("whatsapp:")) return "whatsapp";
  if (lower.startsWith("tg:")) return "telegram";

  // Only http(s) links are worth resolving into a URL; everything else is a
  // scheme we do not track.
  if (!lower.startsWith("http://") && !lower.startsWith("https://")) return null;

  let host: string;
  try {
    host = stripWww(new URL(raw).hostname);
  } catch {
    return null;
  }

  if (WHATSAPP_HOSTS.has(host)) return "whatsapp";
  if (TELEGRAM_HOSTS.has(host)) return "telegram";

  return null;
}

/**
 * True when the href points at the estimate flow on this site.
 *
 * `origin` is the page's own origin, so an absolute link to our own
 * /estimate counts and a link to someone else's /estimate does not.
 */
export function isEstimateHref(href: string | null | undefined, origin: string): boolean {
  if (!href) return false;

  const raw = href.trim();
  if (!raw) return false;

  // A bare hash or a non-navigational scheme is never the estimate CTA.
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^https?:/i.test(raw)) return false;

  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return false;
  }

  if (url.origin !== origin) return false;

  return url.pathname === "/estimate" || url.pathname.startsWith("/estimate/");
}

/**
 * The page path we attach to events.
 *
 * Deliberately pathname-only: the estimate flow accepts query parameters like
 * `?postal=V7M1M4`, and a postal code is close enough to a home address that
 * it has no business being in an analytics payload.
 */
export function toPagePath(pathname: string): string {
  if (!pathname) return "/";
  const [withoutHash] = pathname.split("#");
  const [clean] = withoutHash.split("?");
  return clean || "/";
}

export function contactClickEvent(
  method: ContactMethod,
  linkLocation: string,
  pagePath: string,
): GaEvent {
  return {
    name: GA_EVENTS.contactClick,
    params: {
      contact_method: method,
      link_location: linkLocation,
      page_path: toPagePath(pagePath),
    },
  };
}

export function estimateCtaClickEvent(linkLocation: string, pagePath: string): GaEvent {
  return {
    name: GA_EVENTS.estimateCtaClick,
    params: {
      link_location: linkLocation,
      page_path: toPagePath(pagePath),
    },
  };
}

/**
 * Fired only once a submission has actually been accepted by the server — a
 * started or abandoned form is not a lead.
 */
export function generateLeadEvent(form: LeadForm, pagePath: string): GaEvent {
  return {
    name: GA_EVENTS.generateLead,
    params: {
      form,
      page_path: toPagePath(pagePath),
    },
  };
}
