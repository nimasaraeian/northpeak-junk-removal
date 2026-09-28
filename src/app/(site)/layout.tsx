import { SiteFrame } from "@/components/layout/SiteFrame";

/**
 * The public site.
 *
 * Every marketing route lives in this group so `/admin` can sit outside it
 * with a shell of its own. The group is a naming convention only — `(site)`
 * contributes nothing to any URL, so every public path is exactly what it
 * was.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteFrame>{children}</SiteFrame>;
}
