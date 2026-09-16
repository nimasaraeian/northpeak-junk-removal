import Image from "next/image";
import { cx } from "@/lib/utils";

export function PeakAvatar({
  className,
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <span className={cx("relative inline-block aspect-square select-none bg-transparent", className)}>
      {/* The source PNG is 554KB; the launcher renders it at 56px. WebP and
          AVIF both carry the alpha channel, so the sticker keeps its cutout. */}
      <Image
        src="/brand/peak-sticker.png"
        alt=""
        width={919}
        height={712}
        quality={70}
        sizes="96px"
        loading="lazy"
        className="h-full w-full object-contain"
        draggable={false}
      />
      {animated ? (
        <>
          <span className="peak-sticker-eyelid peak-sticker-eyelid-left" aria-hidden />
          <span className="peak-sticker-eyelid peak-sticker-eyelid-right" aria-hidden />
        </>
      ) : null}
    </span>
  );
}
