/**
 * The auth route group — /login, /register, /forgot-password, /reset-password.
 *
 * STANDALONE, FULL-PAGE screens: deliberately NO navbar and NO footer (that is why the site chrome
 * was lifted out of the root layout into `<SiteChrome>`, which every OTHER group opts into).
 *
 * EDGE TO EDGE: no padding and no background here — the group hands the entire viewport to its
 * child. `AuthShell` then spans it corner to corner as a true two-panel split, rather than a card
 * floating in a margin.
 *
 * Navigation home is not lost — `AuthShell` renders the MDN STACKMART logo lockup, which links to `/`.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col">{children}</div>;
}
