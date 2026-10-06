"use client";

import { useT } from "@/lib/i18n/provider";

/** EN | فا switch in the panel header. Remembers the choice in a cookie. */
export function LangToggle() {
  const { lang, setLang } = useT();
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-[var(--ops-border)]" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => setLang("en")}
        data-active={lang === "en"}
        className="px-2.5 py-1 text-xs font-semibold data-[active=true]:bg-[var(--ops-gold)] data-[active=true]:text-[#0c1b2e] text-[var(--ops-muted)]"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("fa")}
        data-active={lang === "fa"}
        className="border-s border-[var(--ops-border)] px-2.5 py-1 text-xs font-semibold data-[active=true]:bg-[var(--ops-gold)] data-[active=true]:text-[#0c1b2e] text-[var(--ops-muted)]"
      >
        فا
      </button>
    </div>
  );
}
