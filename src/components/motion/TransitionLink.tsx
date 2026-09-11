"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import { usePageTransition } from "@/components/motion/PageTransitionProvider";
import {
  isEligibleTransitionHref,
  shouldBypassTransitionClick,
} from "@/lib/motion/navigation";

type TransitionLinkProps = ComponentProps<typeof Link>;

function hrefToString(href: TransitionLinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (typeof href === "object" && href !== null) {
    const pathname = "pathname" in href ? href.pathname ?? "" : "";
    const search = "search" in href && href.search ? href.search : "";
    return `${pathname}${search}`;
  }
  return "";
}

export function TransitionLink({
  href,
  onClick,
  prefetch,
  replace,
  scroll,
  ...rest
}: TransitionLinkProps) {
  const pathname = usePathname();
  const { navigate } = usePageTransition();

  return (
    <Link
      href={href}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (shouldBypassTransitionClick(event)) return;

        const hrefString = hrefToString(href);
        if (!isEligibleTransitionHref(hrefString, pathname)) return;

        event.preventDefault();
        navigate(hrefString);
      }}
    />
  );
}
