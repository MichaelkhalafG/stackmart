/**
 * One order as returned by the FROZEN buyer orders contract (12_API_Specification.md §Buyer) —
 * `GET /api/orders` (`{data:[Order]}`) and `GET /api/orders/{id}` (a single `Order`). Built by the
 * orders-read API + `OrderResource` (J4.01, this cycle). The frontend consumes only this
 * shape and never the live code.
 */
export type Order = {
  id: number;
  product: { title: string; slug: string };
  amount_cents: number;
  currency: string;
  status: string;
  provider_reference: string;
  license_key: string | null;
  download_count: number;
  delivered_at: string | null;
  /** computed download-availability signal (optional in the frozen shape). */
  can_download?: boolean;
};
