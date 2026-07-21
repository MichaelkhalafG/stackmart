/**
 * Site-level feature flags. Build-time constants — no env var, no runtime cost.
 */

/**
 * Buyer-only mode. `false` hides every sell entry point (header nav, hero CTA, landing CTA band,
 * footer links, guidelines CTA, legal-prose links, sitemap) and makes `/sell` render the 404 —
 * the client asked for a buy-only marketplace.
 *
 * Nothing is deleted: the /sell page, SellForm, the sell components and `POST /api/submissions`
 * are all intact. Flip this to `true` to restore selling everywhere.
 */
// Annotated `boolean` (not the inferred literal type) so flipping the value never turns the other
// branch into a type error about unreachable/never-taken code.
export const SHOW_SELL: boolean = false;
