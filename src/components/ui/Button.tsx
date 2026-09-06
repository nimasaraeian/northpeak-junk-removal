import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/utils";

const variants = {
  primary:
    "bg-gold text-navy-deep hover:bg-gold-glow shadow-[0_12px_30px_-16px_rgba(208,137,43,0.9)]",
  secondary:
    "border border-cream/25 bg-transparent text-cream hover:border-cream/55 hover:bg-white/5",
  navy: "bg-navy text-cream hover:bg-navy-soft",
  ghost:
    "border border-navy/12 bg-white/70 text-navy hover:border-navy/25 hover:bg-white",
};

const sizes = {
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-6 text-sm sm:px-7",
};

type ButtonProps = {
  href?: ComponentProps<typeof Link>["href"];
  children: React.ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const classes = cx(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition duration-300",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
