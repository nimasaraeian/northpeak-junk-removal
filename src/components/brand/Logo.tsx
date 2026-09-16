import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/utils";

/**
 * Served through next/image: the source PNGs are 382KB and 766KB, which is far
 * more than a 64px-tall header mark or a 216px footer lockup needs. The
 * optimizer emits WebP/AVIF at the displayed size, both of which keep alpha.
 * No ?v= cache-buster — the optimized URL is already content-addressed.
 */
const files = {
  /** Mark + NorthPeak — paper-matched for header */
  dark: { src: "/brand/logo-nav.png", width: 1228, height: 741 },
  /** Full official light lockup for footer card */
  light: { src: "/brand/logo-official-light.png", width: 1172, height: 874 },
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
  const asset = files[tone];
  const img = (
    <Image
      src={asset.src}
      alt="NorthPeak Junk Removal — More Space. A Better Tomorrow."
      width={asset.width}
      height={asset.height}
      // The header mark is in the first viewport on every page; the footer
      // lockup never is.
      priority={size === "header"}
      loading={size === "header" ? undefined : "lazy"}
      quality={70}
      sizes={size === "header" ? "112px" : "216px"}
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
        <span className="text-[0.48rem] font-semibold tracking-[0.34em] text-navy/75 uppercase sm:text-[0.54rem]">
          Junk Removal
        </span>
      ) : null}
    </Link>
  );
}
