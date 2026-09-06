import Link from "next/link";
import { cx } from "@/lib/utils";

const files = {
  /** Mark + NorthPeak — paper-matched for header */
  dark: "/brand/logo-nav.png?v=7",
  /** Full official light lockup for footer card */
  light: "/brand/logo-official-light.png?v=7",
} as const;

export function Logo({
  tone = "dark",
  size = "header",
  tagline = false,
}: {
  tone?: "dark" | "light";
  size?: "header" | "footer" | "display";
  /** Show “Junk Removal” under the header mark */
  tagline?: boolean;
}) {
  const img = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={files[tone]}
      alt="NorthPeak Junk Removal — More Space. A Better Tomorrow."
      width={tone === "dark" ? 1228 : 1173}
      height={tone === "dark" ? 741 : 874}
      decoding="async"
      className={cx(
        "w-auto object-contain object-left",
        tone === "dark" ? "bg-transparent" : "bg-paper",
        size === "header" && "h-[3rem] sm:h-[3.5rem] md:h-[4rem]",
        size === "footer" && "h-auto w-full max-w-[13.5rem]",
        size === "display" && "h-auto w-full",
      )}
    />
  );

  return (
    <Link
      href="/"
      aria-label="NorthPeak Junk Removal home"
      className={cx(
        "inline-flex shrink-0",
        tagline && size === "header" && "flex-col gap-0.5",
        size === "footer" &&
          "rounded-2xl bg-paper p-4 shadow-[0_12px_40px_rgb(0_0_0_/_0.35)] sm:p-5",
      )}
    >
      {img}
      {tagline && size === "header" ? (
        <span className="text-[0.48rem] font-semibold tracking-[0.34em] text-navy/55 uppercase sm:text-[0.54rem]">
          Junk Removal
        </span>
      ) : null}
    </Link>
  );
}
