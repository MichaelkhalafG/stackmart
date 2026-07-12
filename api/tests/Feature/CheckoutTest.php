<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/*
 * Checkout creation (S4.01) — POST /api/checkout { product_id } → { url }.
 * Written to the FROZEN §Buyer contract (Planning/12_API_Specification.md) against
 * the REAL FakePaymentProvider (never a gateway, never a stub). The endpoint lives
 * on `day-4`; routes/commerce.php has no checkout route on THIS branch, so
 * every test SKIPS here and runs automatically once S4.01 is merged at end-of-day
 * integration (roadmap dependency J4.02 dep S4.01). Engine-agnostic assertions.
 */

$skip = fn (): bool => ! checkoutAvailable();
$reason = 'S4.01 checkout endpoint lands on day-4 — green after end-of-day integration.';

it('creates a pending order and returns a redirect url', function () {
    $product = Product::factory()->published()->create();
    $buyer = User::factory()->create();

    Sanctum::actingAs($buyer);
    $res = $this->postJson('/api/checkout', ['product_id' => $product->id])->assertSuccessful();

    // Frozen contract: a top-level redirect url. FakePaymentProvider returns a
    // {FRONTEND_URL}/checkout/mock?ref=… URL — assert the mock-checkout shape
    // without naming any gateway.
    expect($res->json('url'))->toBeString()->toContain('/checkout/mock?ref=');

    // A PENDING order was persisted for THIS buyer + product, with a correlation ref.
    $order = Order::where('user_id', $buyer->id)->where('product_id', $product->id)->latest('id')->first();
    expect($order)->not->toBeNull()
        ->and($order->status)->toBe(Order::STATUS_PENDING)
        ->and($order->provider_reference)->not->toBeNull()
        ->and($order->amount_cents)->toBe($product->price_cents);
})->skip($skip, $reason);

it('rejects checkout without a product_id (422)', function () {
    $buyer = User::factory()->create();

    Sanctum::actingAs($buyer);
    $this->postJson('/api/checkout', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['product_id']);
})->skip($skip, $reason);

it('requires authentication for checkout (401)', function () {
    $product = Product::factory()->published()->create();

    // No Sanctum::actingAs → the auth:sanctum guard rejects with 401.
    $this->postJson('/api/checkout', ['product_id' => $product->id])->assertUnauthorized();
})->skip($skip, $reason);
