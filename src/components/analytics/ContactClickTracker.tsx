"use client";

import { useEffect } from "react";
import {
  classifyContactHref,
  isEstimateHref,
} from "@/lib/analytics/events";
import { trackContactClick, trackEstimateCtaClick } from "@/lib/analytics/track";

/**
 * Where on the page the clicked link lives.
 *
 * Authors can name a spot explicitly with `data-analytics-location`; otherwise
 * we fall back to the enclosing landmark, which is enough to tell a header CTA
 * apart from the footer one in reports.
 */
function resolveLinkLocation(element: Element): string {
  const tagged = element.closest<HTMLElement>("[data-analytics-location]");
  const explicit = tagged?.dataset.analyticsLocation?.trim();
  if (explicit) return explicit;

  if (element.closest("header")) return "header";
  if (element.closest("footer")) return "footer";
  if (element.closest("nav")) return "nav";

  return "body";
}

/**
 * One delegated listener for every contact link on the site.
 *
 * Contact links are scattered across the header, the footer, the mobile menu,
 * the assistant panel, and half the content components — and the assistant
 * mounts late, after an idle callback. Rather than wiring an onClick into each
 * one (and re-wiring it every time someone adds a link), we listen once on the
 * document and classify by href. Anything matching phone, WhatsApp, Telegram,
 * email, or the estimate flow is reported; everything else is ignored.
 *
 * The listener runs in the capture phase so a handler that stops propagation
 * further down cannot silently drop tracking, and it never calls
 * preventDefault — navigation behaves exactly as it would without it.
 */
export function ContactClickTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      // Ignore synthesized clicks and secondary buttons; `click` only fires for
      // the primary button, but programmatic events can carry anything.
      if (event.defaultPrevented) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const location = resolveLinkLocation(anchor);

      const method = classifyContactHref(href);
      if (method) {
        trackContactClick(method, location);
        return;
      }

      if (isEstimateHref(href, window.location.origin)) {
        trackEstimateCtaClick(location);
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
