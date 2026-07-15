<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Demo orders that exercise the whole commission/payout system, so the admin dashboard shows real,
 * internally-consistent numbers instead of zeros.
 *
 * The money is NEVER hand-written: every split runs through `Order::splitCommission()` — the same
 * call `CheckoutController` makes — so `platform_cut_cents + seller_payout_cents == amount_cents`
 * by construction at the flat 20% rate, and the seeder cannot drift from production arithmetic.
 *
 * Coverage, by design:
 *   - paid orders across FOUR sellers            → Top Sellers has something to rank
 *   - a mix of pending / settled payout_status   → Pending payouts + Payouts settled
 *   - staggered delivered_at                     → the payout queue's "oldest first" is visible
 *   - one paid order on a NULL-seller listing    → Blocked payouts (no payee, cannot be settled)
 *   - one pending + one refunded order           → the non-paid lifecycle states
 *
 * Keyed by a STABLE `provider_reference` so re-seeding is idempotent. `payment_provider` is the
 * provider KEY ("fake" = FakePaymentProvider) — never a gateway name.
 */
class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $buyer = User::where('email', 'buyer@stackmart.test')->first();

        if ($buyer === null) {
            return; // UserSeeder must run first (DatabaseSeeder ordering guarantees this).
        }

        $now = Carbon::parse('2026-07-01 09:00:00');

        foreach ($this->orders() as $row) {
            $product = Product::where('slug', $row['product_slug'])->first();

            if ($product === null) {
                continue; // catalog slug missing — skip rather than guess.
            }

            // THE one place the money is derived. Same input, same method, same result as checkout.
            $split = Order::splitCommission($product->price_cents, (float) $product->commission_rate);

            $paidOut = ($row['payout_status'] ?? Order::PAYOUT_PENDING) === Order::PAYOUT_PAID;

            Order::updateOrCreate(
                ['provider_reference' => $row['provider_reference']],
                [
                    'user_id' => $buyer->id,
                    'product_id' => $product->id,
                    'amount_cents' => $product->price_cents, // order amount = product price at purchase
                    'currency' => 'USD',
                    'status' => $row['status'],
                    'payment_provider' => 'fake', // provider KEY, not a gateway name
                    'provider_payment_id' => $row['provider_payment_id'] ?? null,
                    'payment_meta' => $row['payment_meta'] ?? null,
                    'license_key' => $row['license_key'] ?? null,
                    'delivered_at' => isset($row['delivered_days_ago'])
                        ? $now->copy()->subDays($row['delivered_days_ago'])
                        : null,
                    'download_count' => $row['download_count'] ?? 0,

                    // Commission snapshot — every order carries it, exactly as checkout writes it.
                    'commission_rate' => (float) $product->commission_rate,
                    'platform_cut_cents' => $split['platform_cut_cents'],
                    'seller_payout_cents' => $split['seller_payout_cents'],

                    'payout_status' => $row['payout_status'] ?? Order::PAYOUT_PENDING,
                    'payout_paid_at' => $paidOut && isset($row['payout_days_ago'])
                        ? $now->copy()->subDays($row['payout_days_ago'])
                        : null,
                    'payout_notes' => $paidOut ? 'Transferred out of band; proof on file.' : null,
                ]
            );
        }
    }

    /**
     * `delivered_days_ago` drives the payout-queue ordering: the biggest number is the seller who
     * has been waiting longest, and must surface at the top of the queue.
     *
     * @return list<array<string, mixed>>
     */
    private function orders(): array
    {
        $paid = fn (string $ref, string $slug, string $license, int $delivered, int $downloads = 1): array => [
            'provider_reference' => $ref,
            'product_slug' => $slug,
            'status' => Order::STATUS_PAID,
            'provider_payment_id' => 'pay_seed_'.$slug,
            'payment_meta' => ['event' => 'payment.succeeded'],
            'license_key' => $license,
            'delivered_days_ago' => $delivered,
            'download_count' => $downloads,
        ];

        return [
            // ── Ada Okafor ────────────────────────────────────────────────────────────────
            // Oldest unsettled sale in the system → head of the payout queue.
            $paid('ref_seed_paid_inboxzero', 'inboxzero-ai', 'A1B2-C3D4-E5F6-7788', 30, 2)
                + ['payout_status' => Order::PAYOUT_PENDING],
            $paid('ref_seed_paid_focusflow', 'focusflow', 'F0C9-1AB2-33CD-44EF', 25)
                + ['payout_status' => Order::PAYOUT_PAID, 'payout_days_ago' => 12],
            $paid('ref_seed_paid_notevault', 'notevault', 'N0TE-V4LT-9WXY-2Z31', 2)
                + ['payout_status' => Order::PAYOUT_PAID, 'payout_days_ago' => 1],

            // ── Grace Lin ─────────────────────────────────────────────────────────────────
            $paid('ref_seed_paid_cartspark', 'cartspark', 'C4RT-SP4R-K7QM-88LD', 22, 3)
                + ['payout_status' => Order::PAYOUT_PENDING],
            $paid('ref_seed_paid_cronpilot', 'cronpilot', 'CR0N-P1L0-T5RB-6KWZ', 18)
                + ['payout_status' => Order::PAYOUT_PAID, 'payout_days_ago' => 10],

            // ── Linus Vega ────────────────────────────────────────────────────────────────
            $paid('ref_seed_paid_pixelforge', 'pixelforge', 'P1XL-F0RG-3H8N-QW2V', 15)
                + ['payout_status' => Order::PAYOUT_PENDING],
            $paid('ref_seed_paid_deploydeck', 'deploydeck', 'D3PL-0YD3-CK4M-7TRX', 11, 2)
                + ['payout_status' => Order::PAYOUT_PAID, 'payout_days_ago' => 5],

            // ── Mira Haddad (highest owed — should top the seller ranking) ────────────────
            $paid('ref_seed_paid_launchbase', 'launchbase', 'L4UN-CHB4-S39K-MP2Q', 8)
                + ['payout_status' => Order::PAYOUT_PENDING],
            $paid('ref_seed_paid_tripstash', 'tripstash', 'TR1P-ST4S-H6VD-2N9C', 4)
                + ['payout_status' => Order::PAYOUT_PENDING],

            // ── No payee ─────────────────────────────────────────────────────────────────
            // substack-lite is admin-authored (no seller_email), so this paid sale can never be
            // settled. It is the "Blocked payouts" case, and it appears in the payout queue with
            // no seller against it — which is exactly the state the admin needs to notice.
            $paid('ref_seed_paid_substack', 'substack-lite', 'SUBS-T4CK-L1TE-5590', 6)
                + ['payout_status' => Order::PAYOUT_PENDING],

            // ── Non-paid lifecycle states (excluded from every money aggregate) ──────────
            [
                'provider_reference' => 'ref_seed_pending_fittrack',
                'product_slug' => 'fittrack',
                'status' => Order::STATUS_PENDING, // in-flight checkout, no fulfillment yet
                'payout_status' => Order::PAYOUT_PENDING,
            ],
            [
                'provider_reference' => 'ref_seed_refunded_rentreach',
                'product_slug' => 'rentreach',
                'status' => Order::STATUS_REFUNDED, // manual refund — license/delivery preserved
                'provider_payment_id' => 'pay_seed_rentreach',
                'payment_meta' => ['event' => 'payment.succeeded'],
                'license_key' => 'R3NT-R34C-H8YU-1QW7',
                'delivered_days_ago' => 20,
                'download_count' => 1,
                'payout_status' => Order::PAYOUT_PENDING,
            ],
        ];
    }
}
