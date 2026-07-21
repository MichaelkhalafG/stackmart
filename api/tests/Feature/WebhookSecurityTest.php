<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;

/*
 * Payment settlement can only be triggered by someone entitled to trigger it.
 *
 * Before this, POST /api/webhooks/payment took `{ref, status}` from anyone with curl and marked the
 * matching order paid — an attacker could create an order, forge its own "paid" callback, and walk
 * away with a license key (and the deliverable, once products carry one). Two gates now:
 *
 *   1. the webhook is server-to-server: X-Webhook-Secret must match, compared with hash_equals;
 *   2. the browser doesn't use the webhook at all — the mock checkout screen calls the
 *      authenticated, owner-scoped POST /api/checkout/{order}/simulate.
 *
 * Engine-agnostic: no gateway is named anywhere here.
 */

function pendingOrderFor(User $buyer): Order
{
    return Order::factory()->for($buyer)->for(Product::factory()->published())->create();
}

/* ── 1. The webhook rejects anything that can't prove it's the provider ────────────────────── */

it('rejects a forged webhook that carries no secret', function () {
    Mail::fake();
    config(['payments.webhook_secret' => TEST_WEBHOOK_SECRET]);

    $order = pendingOrderFor(User::factory()->create());

    $this->postJson('/api/webhooks/payment', ['ref' => $order->provider_reference, 'status' => 'paid'])
        ->assertUnauthorized();

    // The order must be untouched: no payment, no license, no delivery mail.
    $order->refresh();
    expect($order->status)->toBe(Order::STATUS_PENDING)
        ->and($order->license_key)->toBeNull()
        ->and($order->delivered_at)->toBeNull();

    Mail::assertNothingSent();
});

it('rejects a webhook carrying the wrong secret', function () {
    Mail::fake();
    config(['payments.webhook_secret' => TEST_WEBHOOK_SECRET]);

    $order = pendingOrderFor(User::factory()->create());

    $this->postJson(
        '/api/webhooks/payment',
        ['ref' => $order->provider_reference, 'status' => 'paid'],
        ['X-Webhook-Secret' => 'not-the-secret'],
    )->assertUnauthorized();

    expect($order->fresh()->status)->toBe(Order::STATUS_PENDING);
    Mail::assertNothingSent();
});

it('fails closed when no secret is configured at all', function () {
    Mail::fake();
    config(['payments.webhook_secret' => null]);

    $order = pendingOrderFor(User::factory()->create());

    // An unconfigured secret must reject everything, not wave everything through.
    $this->postJson(
        '/api/webhooks/payment',
        ['ref' => $order->provider_reference, 'status' => 'paid'],
        ['X-Webhook-Secret' => ''],
    )->assertUnauthorized();

    expect($order->fresh()->status)->toBe(Order::STATUS_PENDING);
});

it('still settles an order for a caller presenting the correct secret', function () {
    Mail::fake();
    config(['payments.webhook_secret' => TEST_WEBHOOK_SECRET]);

    $order = pendingOrderFor(User::factory()->create());

    $this->postJson(
        '/api/webhooks/payment',
        ['ref' => $order->provider_reference, 'status' => 'paid'],
        ['X-Webhook-Secret' => TEST_WEBHOOK_SECRET],
    )->assertOk();

    $order->refresh();
    expect($order->status)->toBe(Order::STATUS_PAID)
        ->and($order->license_key)->not->toBeNull()
        ->and($order->delivered_at)->not->toBeNull();
});

/* ── 2. The buyer-facing simulate endpoint is authenticated and owner-scoped ───────────────── */

it('requires authentication to simulate a payment', function () {
    $order = pendingOrderFor(User::factory()->create());

    $this->postJson("/api/checkout/{$order->id}/simulate", ['status' => 'paid'])
        ->assertUnauthorized();

    expect($order->fresh()->status)->toBe(Order::STATUS_PENDING);
});

it('hides another buyer\'s order behind a 404 when simulating', function () {
    Mail::fake();
    $order = pendingOrderFor(User::factory()->create());

    Sanctum::actingAs(User::factory()->create()); // a different buyer

    // 404, not 403 — an intruder must not be able to confirm the order exists.
    $this->postJson("/api/checkout/{$order->id}/simulate", ['status' => 'paid'])
        ->assertNotFound();

    expect($order->fresh()->status)->toBe(Order::STATUS_PENDING);
    Mail::assertNothingSent();
});

it('lets the owner complete their own mock checkout', function () {
    Mail::fake();
    $buyer = User::factory()->create();
    $order = pendingOrderFor($buyer);

    Sanctum::actingAs($buyer);
    $this->postJson("/api/checkout/{$order->id}/simulate", ['status' => 'paid'])
        ->assertOk()
        ->assertJson(['status' => Order::STATUS_PAID]);

    $order->refresh();
    expect($order->status)->toBe(Order::STATUS_PAID)
        ->and($order->license_key)->toMatch('/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/')
        ->and($order->delivered_at)->not->toBeNull();
});

it('is idempotent — replaying simulate does not re-fulfil', function () {
    Mail::fake();
    $buyer = User::factory()->create();
    $order = pendingOrderFor($buyer);

    Sanctum::actingAs($buyer);
    $this->postJson("/api/checkout/{$order->id}/simulate", ['status' => 'paid'])->assertOk();

    $order->refresh();
    $license = $order->license_key;
    $deliveredAt = $order->delivered_at;

    $this->postJson("/api/checkout/{$order->id}/simulate", ['status' => 'paid'])->assertOk();

    $order->refresh();
    expect($order->license_key)->toBe($license)
        ->and($order->delivered_at?->equalTo($deliveredAt))->toBeTrue();

    Mail::assertSent(App\Mail\OrderDelivered::class, 1); // exactly one delivery, not two
});

it('rejects a simulate call with an unknown status', function () {
    $buyer = User::factory()->create();
    $order = pendingOrderFor($buyer);

    Sanctum::actingAs($buyer);
    $this->postJson("/api/checkout/{$order->id}/simulate", ['status' => 'refunded'])
        ->assertStatus(422);

    expect($order->fresh()->status)->toBe(Order::STATUS_PENDING);
});

it('404s the simulate endpoint when a real provider is bound', function () {
    // Mock settlement belongs to the fake provider. Under a real gateway the only way an order
    // becomes paid is the verified webhook.
    config(['payments.provider' => 'somethingelse']);

    $buyer = User::factory()->create();
    $order = pendingOrderFor($buyer);

    Sanctum::actingAs($buyer);
    $this->postJson("/api/checkout/{$order->id}/simulate", ['status' => 'paid'])
        ->assertNotFound();

    expect($order->fresh()->status)->toBe(Order::STATUS_PENDING);
});
