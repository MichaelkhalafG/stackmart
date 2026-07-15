import { SiteChrome } from "@/components/layout/SiteChrome";

/**
 * The public route group (landing, marketplace, listing, sell, guidelines…) — renders with the site
 * chrome (navbar + footer). The chrome moved out of the root layout so the `(auth)` group can be
 * chrome-free; every group that wants it opts in here.
 *
 * No `Container` at this level: the landing is full-bleed, and the sections that need the 1280px
 * measure (marketplace / listing / sell) each apply it in their own nested layout — unchanged.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
