<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * A few realistic orders for the seeded buyer so `/account/purchases` and the Filament
 * Order admin show believable data across the lifecycle — one fulfilled purchase (license
 * + delivery + downloads), one pending checkout, one refunded.
 *
 * Keyed by a STABLE `provider_reference` so re-seeding is idempotent (no duplicate rows).
 * `payment_provider` is the provider KEY ("fake" = FakePaymentProvider) — never a gateway name.
 * Real fulfillment is produced by FulfillOrder at runtime; here we hand-write the
 * end state so the pages have content without running the webhook flow during a seed.
 */
class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $buyer = User::where('email', 'buyer@stackmart.test')->first();

        if ($buyer === null) {
            return; // UserSeeder must run first (DatabaseSeeder ordering guarantees this).
        }

        $products = Product::pluck('id', 'slug');
        $now = Carbon::parse('2026-07-01 09:00:00');

        $orders = [
            // Fulfilled purchase — license issued, delivered, downloaded twice.
            [
                'provider_reference' => 'ref_seed_paid_inboxzero',
                'product_slug' => 'inboxzero-ai',
                'status' => Order::STATUS_PAID,
                'provider_payment_id' => 'pay_seed_inboxzero',
                'payment_meta' => ['event' => 'payment.succeeded'],
                'license_key' => 'A1B2-C3D4-E5F6-7788',
                'delivered_at' => $now->copy()->subDays(6),
                'download_count' => 2,
            ],
            // In-flight checkout — pending, no fulfillment yet.
            [
                'provider_reference' => 'ref_seed_pending_cartspark',
                'product_slug' => 'cartspark',
                'status' => Order::STATUS_PENDING,
                'provider_payment_id' => null,
                'payment_meta' => null,
                'license_key' => null,
                'delivered_at' => null,
                'download_count' => 0,
            ],
            // Refunded after delivery — license/delivery are preserved (manual refund = status only).
            [
                'provider_reference' => 'ref_seed_refunded_focusflow',
                'product_slug' => 'focusflow',
                'status' => Order::STATUS_REFUNDED,
                'provider_payment_id' => 'pay_seed_focusflow',
                'payment_meta' => ['event' => 'payment.succeeded'],
                'license_key' => 'F0C9-1AB2-33CD-44EF',
                'delivered_at' => $now->copy()->subDays(20),
                'download_count' => 1,
            ],
        ];

        foreach ($orders as $order) {
            $productId = $products[$order['product_slug']] ?? null;
            if ($productId === null) {
                continue; // catalog slug missing — skip rather than guess.
            }

            $product = Product::find($productId);

            Order::updateOrCreate(
                ['provider_reference' => $order['provider_reference']],
                [
                    'user_id' => $buyer->id,
                    'product_id' => $productId,
                    'amount_cents' => $product->price_cents, // order amount = product price at purchase
                    'currency' => 'USD',
                    'status' => $order['status'],
                    'payment_provider' => 'fake', // provider KEY, not a gateway name
                    'provider_payment_id' => $order['provider_payment_id'],
                    'payment_meta' => $order['payment_meta'],
                    'license_key' => $order['license_key'],
                    'delivered_at' => $order['delivered_at'],
                    'download_count' => $order['download_count'],
                ]
            );
        }
    }
}
