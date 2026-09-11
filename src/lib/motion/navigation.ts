export type TransitionHref = string;

export function isHashOnlyHref(href: string): boolean {
  return href.startsWith("#");
}

export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:|sms:|javascript:)/i.test(href);
}

export function normalizeInternalPathname(href: string): string | null {
  if (!href || isExternalHref(href) || isHashOnlyHref(href)) return null;

  try {
    const url = new URL(href, "https://northpeak.local");
    return url.pathname;
  } catch {
    return null;
  }
}

export function isEligibleTransitionHref(
  href: TransitionHref,
  currentPathname: string,
): boolean {
  const targetPath = normalizeInternalPathname(href);
  if (!targetPath) return false;
  if (targetPath === currentPathname) return false;
  return true;
}

export function shouldBypassTransitionClick(event: {
  defaultPrevented: boolean;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  if (event.defaultPrevented) return true;
  if (event.button !== 0) return true;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
  return false;
}
