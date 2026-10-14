"use client";

import { useT } from "@/lib/i18n/provider";

/** Print / Save-as-PDF trigger. Hidden on the printed sheet itself. */
export function PrintButton() {
  const { t } = useT();
  return (
    <button
      type="button"
      className="np-print-hide ops-btn"
      data-variant="navy"
      onClick={() => window.print()}
    >
      {t("Print / Save as PDF")}
    </button>
  );
}
