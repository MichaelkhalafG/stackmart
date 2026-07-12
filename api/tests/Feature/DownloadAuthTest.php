<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

/*
 * Download authorization (S4.04) — GET /api/orders/{id}/download.
 * Written to the FROZEN §Buyer download contract (Planning/12_API_Specification.md):
 * owner + status=paid → 200 application/zip attachment + download_count++, else 403.
 * The download endpoint is merged on dev@day-4, so these run unconditionally now
 * (J5.03 un-skipped the cross-branch guard). NEVER stubs the endpoint; NEVER names a
 * gateway. Engine-agnostic assertions.
 */

// A published product with a real deliverable file on the private `deliverables` disk, so a
// paid owner's download can actually stream. Storage::fake keeps it in memory (nothing on disk).
function paidOrderWithDeliverable(User $buyer): Order
{
    Storage::fake('deliverables');
    $path = 'deliverables/'.uniqid('kit_', true).'.zip';
    Storage::disk('deliverables')->put($path, 'PK-fake-zip-bytes');

    $product = Product::factory()->published()->create(['deliverable_path' => $path]);

    return Order::factory()->for($buyer)->for($product)->paid()->create();
}

it('forbids a non-owner from downloading (403)', function () {
    $owner = User::factory()->create();
    $order = paidOrderWithDeliverable($owner);

    Sanctum::actingAs(User::factory()->create()); // a different buyer
    $this->getJson("/api/orders/{$order->id}/download")->assertForbidden();
});

it('forbids the owner from downloading an unpaid order (403)', function () {
    Storage::fake('deliverables');
    $path = 'deliverables/'.uniqid('kit_', true).'.zip';
    Storage::disk('deliverables')->put($path, 'PK-fake-zip-bytes');

    $owner = User::factory()->create();
    $product = Product::factory()->published()->create(['deliverable_path' => $path]);
    $order = Order::factory()->for($owner)->for($product)->create(); // pending (unpaid)

    Sanctum::actingAs($owner);
    $this->getJson("/api/orders/{$order->id}/download")->assertForbidden();
});

it('streams the zip for the owner of a paid order and increments download_count', function () {
    $owner = User::factory()->create();
    $order = paidOrderWithDeliverable($owner);
    expect($order->download_count)->toBe(0);

    Sanctum::actingAs($owner);

    $res = $this->get("/api/orders/{$order->id}/download");
    $res->assertOk();
    $res->assertDownload(); // Content-Disposition: attachment
    expect($res->headers->get('Content-Type'))->toContain('application/zip');
    expect($order->fresh()->download_count)->toBe(1);

    // A second successful download increments again.
    $this->get("/api/orders/{$order->id}/download")->assertOk();
    expect($order->fresh()->download_count)->toBe(2);
});

it('forbids the owner from downloading a refunded order (403)', function () {
    Storage::fake('deliverables');
    $path = 'deliverables/'.uniqid('kit_', true).'.zip';
    Storage::disk('deliverables')->put($path, 'PK-fake-zip-bytes');

    $owner = User::factory()->create();
    $product = Product::factory()->published()->create(['deliverable_path' => $path]);
    // Refunded ≠ paid → no download entitlement (owner + status=paid is required).
    $order = Order::factory()->for($owner)->for($product)->paid()->create(['status' => Order::STATUS_REFUNDED]);

    Sanctum::actingAs($owner);
    $this->getJson("/api/orders/{$order->id}/download")->assertForbidden();
    expect($order->fresh()->download_count)->toBe(0); // a 403 must not increment
});

it('requires authentication to download (401)', function () {
    $order = paidOrderWithDeliverable(User::factory()->create());

    // No Sanctum::actingAs → the auth:sanctum guard rejects with 401.
    $this->getJson("/api/orders/{$order->id}/download")->assertUnauthorized();
});
