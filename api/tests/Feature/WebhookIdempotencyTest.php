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
 * The webhook + FulfillOrder are merged on dev@day-4, so these run unconditionally now
 * (J5.03 un-skipped the cross-branch guard). NEVER stubs the endpoint; NEVER names a
 * gateway. Engine-agnostic assertions.
 */

$licensePattern = '/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/';

// A paid webhook event for a pending order, in the shape FakePaymentProvider reads (ref + status).
function paidWebhookPayloadFor(Order $order): array
{
    return ['ref' => $order->provider_reference, 'status' => 'paid'];
}

it('fulfils a pending order on a paid webhook event', function () use ($licensePattern) {
    Mail::fake();
    $order = Order::factory()->for(User::factory())->for(Product::factory()->published())->create();
    expect($order->status)->toBe(Order::STATUS_PENDING);

    $this->postJson('/api/webhooks/payment', paidWebhookPayloadFor($order))->assertOk();

    $order->refresh();
    expect($order->status)->toBe(Order::STATUS_PAID)
        ->and($order->license_key)->toMatch($licensePattern) // XXXX-XXXX-XXXX-XXXX
        ->and($order->delivered_at)->not->toBeNull();

    Mail::assertSent(OrderDelivered::class, 1); // delivered exactly once
});

it('is idempotent — a duplicate webhook event does not double-fulfil', function () {
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
});
