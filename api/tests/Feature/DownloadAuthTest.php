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
 * The download endpoint lives on `day-4`; on THIS branch the file SKIPS and runs
 * automatically once S4.04 merges at integration (roadmap J4.03 dep S4.04). NEVER stubs
 * the endpoint; NEVER names a gateway. Engine-agnostic assertions.
 */

$skip = fn (): bool => ! downloadAvailable();
$reason = 'S4.04 download endpoint lands on day-4 — green after end-of-day integration.';

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

it('forbids a non-owner from downloading (403)', function () use ($skip, $reason) {
    $owner = User::factory()->create();
    $order = paidOrderWithDeliverable($owner);

    Sanctum::actingAs(User::factory()->create()); // a different buyer
    $this->getJson("/api/orders/{$order->id}/download")->assertForbidden();
})->skip($skip, $reason);

it('forbids the owner from downloading an unpaid order (403)', function () use ($skip, $reason) {
    Storage::fake('deliverables');
    $path = 'deliverables/'.uniqid('kit_', true).'.zip';
    Storage::disk('deliverables')->put($path, 'PK-fake-zip-bytes');

    $owner = User::factory()->create();
    $product = Product::factory()->published()->create(['deliverable_path' => $path]);
    $order = Order::factory()->for($owner)->for($product)->create(); // pending (unpaid)

    Sanctum::actingAs($owner);
    $this->getJson("/api/orders/{$order->id}/download")->assertForbidden();
})->skip($skip, $reason);

it('streams the zip for the owner of a paid order and increments download_count', function () use ($skip, $reason) {
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
})->skip($skip, $reason);
