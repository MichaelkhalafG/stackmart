<?php

use App\Mail\OrderDelivered;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

/*
 * Webhook idempotency (S4.02 + FulfillOrder S4.03) — POST /api/webhooks/payment.
 * Written to the FROZEN §Webhook contract (Planning/12_API_Specification.md) against
 * the REAL FakePaymentProvider flow (payload { ref, status } → PaymentEvent → FulfillOrder).
 * The webhook + FulfillOrder live on `day-4`; on THIS branch the file SKIPS and
 * runs automatically once S4.02/S4.03 merge at integration (roadmap J4.03 dep S4.02/S4.03).
 * NEVER stubs the endpoint; NEVER names a gateway. Engine-agnostic assertions.
 *
 * `OrderDelivered::class` is a compile-time string (no autoload) so referencing it is safe
 * even before mailable exists on this branch — the body only runs when unskipped.
 */

$skip = fn (): bool => ! webhookAvailable();
$reason = 'S4.02/S4.03 webhook + FulfillOrder land on day-4 — green after end-of-day integration.';

$licensePattern = '/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/';

// A paid webhook event for a pending order, in the shape FakePaymentProvider reads (ref + status).
function paidWebhookPayloadFor(Order $order): array
{
    return ['ref' => $order->provider_reference, 'status' => 'paid'];
}

it('fulfils a pending order on a paid webhook event', function () use ($skip, $reason, $licensePattern) {
    Mail::fake();
    $order = Order::factory()->for(User::factory())->for(Product::factory()->published())->create();
    expect($order->status)->toBe(Order::STATUS_PENDING);

    $this->postJson('/api/webhooks/payment', paidWebhookPayloadFor($order))->assertOk();

    $order->refresh();
    expect($order->status)->toBe(Order::STATUS_PAID)
        ->and($order->license_key)->toMatch($licensePattern) // XXXX-XXXX-XXXX-XXXX
        ->and($order->delivered_at)->not->toBeNull();

    Mail::assertSent(OrderDelivered::class, 1); // delivered exactly once
})->skip($skip, $reason);

it('is idempotent — a duplicate webhook event does not double-fulfil', function () use ($skip, $reason) {
    Mail::fake();
    $order = Order::factory()->for(User::factory())->for(Product::factory()->published())->create();
    $ref = $order->provider_reference;

    // First event fulfils the order.
    $this->postJson('/api/webhooks/payment', paidWebhookPayloadFor($order))->assertOk();
    $order->refresh();
    $license = $order->license_key;
    $deliveredAt = $order->delivered_at;
    expect($license)->not->toBeNull()->and($deliveredAt)->not->toBeNull();

    // The SAME event again (duplicate provider_reference) must be a NO-OP.
    $this->postJson('/api/webhooks/payment', paidWebhookPayloadFor($order))->assertOk();
    $order->refresh();

    expect($order->status)->toBe(Order::STATUS_PAID)
        ->and($order->license_key)->toBe($license)                          // license unchanged
        ->and($order->delivered_at?->equalTo($deliveredAt))->toBeTrue();    // delivered_at unchanged

    // Exactly one order row for this reference (unique provider_reference holds) and one mail total.
    expect(Order::where('provider_reference', $ref)->count())->toBe(1);
    Mail::assertSent(OrderDelivered::class, 1);
})->skip($skip, $reason);
