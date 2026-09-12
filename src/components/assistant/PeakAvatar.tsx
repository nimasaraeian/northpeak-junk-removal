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
      {/* Native img keeps PNG alpha; Next/Image can flatten transparency to black. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/peak-sticker.png?v=2"
        alt=""
        className="h-full w-full object-contain"
        decoding="async"
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
