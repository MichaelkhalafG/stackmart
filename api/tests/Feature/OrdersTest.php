<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/*
 * Orders READ API (J4.01) — GET /api/orders + GET /api/orders/{id}.
 * Asserts the FROZEN §Buyer shape (Planning/12_API_Specification.md): own-only
 * listing, id-or-provider_reference resolution, owner-only 403, unauth 401, and the
 * derived download-availability signal. These endpoints live on THIS branch, so the
 * file runs GREEN now. Engine-agnostic — membership/counts/field-presence only.
 */

// Exact frozen §Buyer keys (+ the derived can_download signal). Order-independent.
$orderKeys = [
    'id', 'product', 'amount_cents', 'currency', 'status',
    'provider_reference', 'license_key', 'download_count', 'delivered_at', 'can_download',
];

it('lists only the authenticated buyer\'s own orders', function () use ($orderKeys) {
    $product = Product::factory()->published()->create();
    $buyerA = User::factory()->create();
    $buyerB = User::factory()->create();

    $a1 = Order::factory()->for($buyerA)->for($product)->create();
    $a2 = Order::factory()->for($buyerA)->for($product)->paid()->create();
    $b1 = Order::factory()->for($buyerB)->for($product)->create();

    Sanctum::actingAs($buyerA);
    $res = $this->getJson('/api/orders')->assertOk();

    // Own-only: exactly A's two orders, never B's.
    expect($res->json('data'))->toHaveCount(2);
    $ids = collect($res->json('data'))->pluck('id')->all();
    expect($ids)->toContain($a1->id, $a2->id)->not->toContain($b1->id);

    // Every element carries EXACTLY the frozen key set (no leak, nothing missing).
    foreach ($res->json('data') as $row) {
        expect(array_keys($row))->toEqualCanonicalizing($orderKeys);
        expect(array_keys($row['product']))->toEqualCanonicalizing(['title', 'slug']);
    }
});

it('serializes the frozen buyer shape and derives can_download', function () {
    $product = Product::factory()->published()->create(['title' => 'InboxZero AI', 'slug' => 'inboxzero-ai']);
    $buyer = User::factory()->create();

    $paid = Order::factory()->for($buyer)->for($product)->paid()->create();
    $pending = Order::factory()->for($buyer)->for($product)->create();

    Sanctum::actingAs($buyer);
    $rows = collect($this->getJson('/api/orders')->assertOk()->json('data'))->keyBy('id');

    // Paid order: fulfillment fields populated, can_download TRUE.
    $paidRow = $rows[$paid->id];
    expect($paidRow['status'])->toBe(Order::STATUS_PAID)
        ->and($paidRow['can_download'])->toBeTrue()
        ->and($paidRow['license_key'])->not->toBeNull()
        ->and($paidRow['delivered_at'])->toBeString()
        ->and($paidRow['product'])->toBe(['title' => 'InboxZero AI', 'slug' => 'inboxzero-ai'])
        ->and($paidRow['amount_cents'])->toBeInt()
        ->and($paidRow['currency'])->toBe($product->currency);

    // Pending order: null fulfillment fields, can_download FALSE.
    $pendingRow = $rows[$pending->id];
    expect($pendingRow['status'])->toBe(Order::STATUS_PENDING)
        ->and($pendingRow['can_download'])->toBeFalse()
        ->and($pendingRow['license_key'])->toBeNull()
        ->and($pendingRow['delivered_at'])->toBeNull();
});

it('lists orders newest first', function () {
    $product = Product::factory()->published()->create();
    $buyer = User::factory()->create();

    $orders = collect(range(1, 3))->map(fn () => Order::factory()->for($buyer)->for($product)->create());
    $newestId = $orders->max('id'); // id is monotonic with creation → deterministic "newest"

    Sanctum::actingAs($buyer);
    $ids = collect($this->getJson('/api/orders')->assertOk()->json('data'))->pluck('id')->all();

    expect($ids[0])->toBe($newestId); // stable via the created_at desc + id desc tiebreaker
});

it('shows a single order by numeric id', function () use ($orderKeys) {
    $product = Product::factory()->published()->create();
    $buyer = User::factory()->create();
    $order = Order::factory()->for($buyer)->for($product)->paid()->create();

    Sanctum::actingAs($buyer);
    $res = $this->getJson("/api/orders/{$order->id}")->assertOk();

    expect($res->json('data.id'))->toBe($order->id);
    expect(array_keys($res->json('data')))->toEqualCanonicalizing($orderKeys);
});

it('shows the same order by provider_reference', function () {
    $product = Product::factory()->published()->create();
    $buyer = User::factory()->create();
    $order = Order::factory()->for($buyer)->for($product)->create();

    Sanctum::actingAs($buyer);
    $res = $this->getJson("/api/orders/{$order->provider_reference}")->assertOk();

    // The reference path resolves to the SAME record as the id path.
    expect($res->json('data.id'))->toBe($order->id)
        ->and($res->json('data.provider_reference'))->toBe($order->provider_reference);
});

it('forbids a non-owner from viewing another buyer\'s order (by id and by reference)', function () {
    $product = Product::factory()->published()->create();
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $order = Order::factory()->for($owner)->for($product)->create();

    Sanctum::actingAs($intruder);
    $this->getJson("/api/orders/{$order->id}")->assertForbidden();          // 403 by id
    $this->getJson("/api/orders/{$order->provider_reference}")->assertForbidden(); // 403 by ref
});

it('returns 404 for an unknown id or reference', function () {
    $buyer = User::factory()->create();

    Sanctum::actingAs($buyer);
    $this->getJson('/api/orders/99999999')->assertNotFound();
    $this->getJson('/api/orders/ref_does_not_exist')->assertNotFound();
});

it('requires authentication for the orders endpoints', function () {
    $product = Product::factory()->published()->create();
    $order = Order::factory()->for(User::factory())->for($product)->create();

    // No Sanctum::actingAs → the auth:sanctum guard rejects with 401.
    $this->getJson('/api/orders')->assertUnauthorized();
    $this->getJson("/api/orders/{$order->id}")->assertUnauthorized();
});
