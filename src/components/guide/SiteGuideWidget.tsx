"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { GuideRobotFace } from "@/components/guide/GuideRobotFace";
import { siteGuideItems } from "@/content/site-guide";
import { cx } from "@/lib/utils";

export function SiteGuideWidget() {
  const titleId = useId();
  const descId = useId();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-end px-4 sm:bottom-6 sm:px-6">
        <div className="pointer-events-auto relative">
          {!open ? (
            <span className="guide-robot-bubble absolute right-[calc(100%+0.65rem)] bottom-3 hidden max-w-[11rem] rounded-2xl border border-navy/10 bg-white px-3.5 py-2.5 text-xs leading-5 text-stone shadow-[var(--shadow-card)] sm:block">
              <span className="font-semibold text-navy">Need a shortcut?</span>
              <span className="mt-0.5 block">Tap PeakBot for the fastest path.</span>
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={open ? "site-guide-modal" : undefined}
            className={cx(
              "guide-robot-sticker group relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full sm:h-[5.25rem] sm:w-[5.25rem]",
              "bg-gradient-to-br from-white via-paper to-cream shadow-[0_22px_48px_-16px_rgba(12,27,46,0.55)] ring-[2.5px] ring-gold/45 transition",
              "hover:scale-[1.06] hover:ring-gold/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
              open && "ring-gold/80 shadow-[0_26px_54px_-14px_rgba(208,137,43,0.4)]",
            )}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgb(251_178_74_/_0.18),transparent_62%)]"
              aria-hidden
            />
            <GuideRobotFace className="relative h-[3.5rem] w-[3.5rem] sm:h-[3.85rem] sm:w-[3.85rem]" />
            <span className="sr-only">Open site guide</span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/55 backdrop-blur-[3px]"
            aria-label="Close site guide"
            onClick={close}
          />

          <div
            id="site-guide-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative flex max-h-[min(88vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-navy/10 bg-paper shadow-[0_32px_80px_-24px_rgba(8,18,31,0.55)]"
          >
            <div className="flex items-start gap-4 border-b border-navy/8 bg-navy px-5 py-5 text-cream sm:px-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-paper/10 ring-1 ring-gold/30">
                <GuideRobotFace blinking={false} className="h-10 w-10" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="eyebrow text-gold-glow">PeakBot guide</p>
                <h2 id={titleId} className="mt-1 text-xl font-semibold sm:text-2xl">
                  Where do you want to go?
                </h2>
                <p id={descId} className="mt-1.5 text-sm leading-6 text-cream/75">
                  Pick the path that matches what you came for. I will take you there.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/15 text-cream/80 transition hover:border-cream/35 hover:bg-white/10 hover:text-cream"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <ul className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              {siteGuideItems.map((item) => (
                <li key={item.id} className="mb-2 last:mb-0">
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cx(
                      "group flex items-start gap-3 rounded-2xl border p-4 transition",
                      item.featured
                        ? "border-gold/35 bg-navy text-cream hover:border-gold/55"
                        : "border-navy/8 bg-white hover:border-gold/30 hover:bg-cream/40",
                    )}
                  >
                    <span
                      className={cx(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        item.featured ? "bg-gold text-navy-deep" : "bg-cream-deep text-navy",
                      )}
                      aria-hidden
                    >
                      →
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cx(
                          "eyebrow block text-[0.6rem]",
                          item.featured ? "text-gold-glow" : "text-gold-deep",
                        )}
                      >
                        {item.intent}
                      </span>
                      <span
                        className={cx(
                          "mt-0.5 block text-sm font-semibold sm:text-base",
                          item.featured ? "text-cream" : "text-navy",
                        )}
                      >
                        {item.title}
                      </span>
                      <span
                        className={cx(
                          "mt-0.5 block text-xs leading-5 sm:text-sm",
                          item.featured ? "text-cream/75" : "text-stone",
                        )}
                      >
                        {item.description}
                      </span>
                    </span>
                    <span
                      className={cx(
                        "shrink-0 text-lg transition group-hover:translate-x-0.5",
                        item.featured ? "text-gold-glow" : "text-navy/30 group-hover:text-gold-deep",
                      )}
                      aria-hidden
                    >
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
