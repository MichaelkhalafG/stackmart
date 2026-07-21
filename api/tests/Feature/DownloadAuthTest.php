<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

/*
 * License-gated download authorization (S4.04) — POST /api/orders/{id}/download.
 *
 * FOUR layers, all enforced: Sanctum auth + OWNER + status=paid + a matching LICENSE KEY.
 * The license key is an EXTRA gate on top of the original three, not a replacement — every
 * pre-existing rule below (non-owner rejected, unpaid 403, refunded 403, unauthenticated 401, and
 * download_count incrementing only on success) still holds. The non-owner case now answers 404
 * rather than 403, so an intruder can't use the status code to confirm an order exists.
 *
 * NEVER stubs the endpoint; NEVER names a gateway. Engine-agnostic assertions.
 */

// A published product with a real deliverable on the private `deliverables` disk, so a paid owner's
// download can actually stream. Storage::fake keeps it in memory (nothing on disk).
function paidOrderWithDeliverable(User $buyer): Order
{
    Storage::fake('deliverables');
    $path = 'deliverables/'.uniqid('kit_', true).'.zip';
    Storage::disk('deliverables')->put($path, 'PK-fake-zip-bytes');

    $product = Product::factory()->published()->create(['deliverable_path' => $path]);

    // The paid() state mints a license key — the buyer must present it to download.
    return Order::factory()->for($buyer)->for($product)->paid()->create();
}

/* ── The license gate ──────────────────────────────────────────────────────────────────────── */

it('streams the zip for the owner of a paid order with the CORRECT license key, and increments download_count', function () {
    $owner = User::factory()->create();
    $order = paidOrderWithDeliverable($owner);
    expect($order->download_count)->toBe(0);
    expect($order->license_key)->not->toBeNull();

    Sanctum::actingAs($owner);

    $res = $this->post("/api/orders/{$order->id}/download", ['license_key' => $order->license_key]);
    $res->assertOk();
    $res->assertDownload(); // Content-Disposition: attachment
    expect($res->headers->get('Content-Type'))->toContain('application/zip');
    expect($order->fresh()->download_count)->toBe(1);

    // A second successful download increments again.
    $this->post("/api/orders/{$order->id}/download", ['license_key' => $order->license_key])->assertOk();
    expect($order->fresh()->download_count)->toBe(2);
});

it('accepts the license key case-insensitively and ignores whitespace', function () {
    $owner = User::factory()->create();
    $order = paidOrderWithDeliverable($owner);

    Sanctum::actingAs($owner);

    // A buyer pasting their key in lowercase (or with a stray space) is not an attack.
    $sloppy = ' '.strtolower((string) $order->license_key).' ';

    $this->post("/api/orders/{$order->id}/download", ['license_key' => $sloppy])->assertOk();
    expect($order->fresh()->download_count)->toBe(1);
});

it('rejects a WRONG license key (422) — no file, no increment, and never echoes the real key', function () {
    $owner = User::factory()->create();
    $order = paidOrderWithDeliverable($owner);

    Sanctum::actingAs($owner);

    $res = $this->postJson("/api/orders/{$order->id}/download", ['license_key' => 'AAAA-BBBB-CCCC-DDDD']);

    $res->assertStatus(422);
    $res->assertJsonValidationErrors(['license_key']);

    // The real key must never leak in the failure response.
    expect($res->getContent())->not->toContain((string) $order->license_key);

    // A rejected attempt streams nothing and must NOT count as a download.
    expect($order->fresh()->download_count)->toBe(0);
});

it('rejects a MISSING license key (422) — no file, no increment', function () {
    $owner = User::factory()->create();
    $order = paidOrderWithDeliverable($owner);

    Sanctum::actingAs($owner);

    $this->postJson("/api/orders/{$order->id}/download", [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['license_key']);

    expect($order->fresh()->download_count)->toBe(0);
});

/* ── The original three layers still hold ──────────────────────────────────────────────────── */

it('hides a non-owner\'s download behind a 404 even WITH the correct license key', function () {
    $owner = User::factory()->create();
    $order = paidOrderWithDeliverable($owner);

    Sanctum::actingAs(User::factory()->create()); // a different buyer

    // Ownership is checked BEFORE the license — holding the key is not enough. 404 rather than 403
    // so a non-owner can't distinguish an existing order from a nonexistent one.
    $this->postJson("/api/orders/{$order->id}/download", ['license_key' => $order->license_key])
        ->assertNotFound();

    expect($order->fresh()->download_count)->toBe(0);
});

it('forbids the owner from downloading an unpaid order (403)', function () {
    Storage::fake('deliverables');
    $path = 'deliverables/'.uniqid('kit_', true).'.zip';
    Storage::disk('deliverables')->put($path, 'PK-fake-zip-bytes');

    $owner = User::factory()->create();
    $product = Product::factory()->published()->create(['deliverable_path' => $path]);
    $order = Order::factory()->for($owner)->for($product)->create(); // pending (unpaid, no license)

    Sanctum::actingAs($owner);
    $this->postJson("/api/orders/{$order->id}/download", ['license_key' => 'AAAA-BBBB-CCCC-DDDD'])
        ->assertForbidden();
});

it('forbids the owner from downloading a refunded order (403)', function () {
    Storage::fake('deliverables');
    $path = 'deliverables/'.uniqid('kit_', true).'.zip';
    Storage::disk('deliverables')->put($path, 'PK-fake-zip-bytes');

    $owner = User::factory()->create();
    $product = Product::factory()->published()->create(['deliverable_path' => $path]);
    // Refunded ≠ paid → no download entitlement, license key or not.
    $order = Order::factory()->for($owner)->for($product)->paid()->create(['status' => Order::STATUS_REFUNDED]);

    Sanctum::actingAs($owner);
    $this->postJson("/api/orders/{$order->id}/download", ['license_key' => $order->license_key])
        ->assertForbidden();

    expect($order->fresh()->download_count)->toBe(0); // a 403 must not increment
});

it('requires authentication to download (401)', function () {
    $order = paidOrderWithDeliverable(User::factory()->create());

    // No Sanctum::actingAs → the auth:sanctum guard rejects with 401.
    $this->postJson("/api/orders/{$order->id}/download", ['license_key' => $order->license_key])
        ->assertUnauthorized();
});

it('returns 404 when the order is paid but the product has no deliverable on disk', function () {
    $owner = User::factory()->create();
    Storage::fake('deliverables');

    $product = Product::factory()->published()->create(['deliverable_path' => null]);
    $order = Order::factory()->for($owner)->for($product)->paid()->create();

    Sanctum::actingAs($owner);

    $this->postJson("/api/orders/{$order->id}/download", ['license_key' => $order->license_key])
        ->assertNotFound();

    expect($order->fresh()->download_count)->toBe(0);
});
