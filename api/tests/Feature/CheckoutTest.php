<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/*
 * Checkout creation (S4.01) — POST /api/checkout { product_id } → { url }.
 * Asserts the FROZEN §Buyer contract (Planning/12_API_Specification.md) against the
 * REAL FakePaymentProvider (never a gateway, never a stub). The endpoint is merged on
 * dev@day-4, so these run unconditionally now (J5.03 un-skipped the cross-branch guard).
 * Engine-agnostic assertions.
 */

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
});

it('rejects checkout without a product_id (422)', function () {
    $buyer = User::factory()->create();

    Sanctum::actingAs($buyer);
    $this->postJson('/api/checkout', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['product_id']);
});

it('requires authentication for checkout (401)', function () {
    $product = Product::factory()->published()->create();

    // No Sanctum::actingAs → the auth:sanctum guard rejects with 401.
    $this->postJson('/api/checkout', ['product_id' => $product->id])->assertUnauthorized();
});

it('rejects checkout for a non-existent product without creating an order', function () {
    $buyer = User::factory()->create();

    Sanctum::actingAs($buyer);
    // Contract does not pin the code for an unknown product; it must reject (not 2xx) and
    // create no order. 422 (exists rule) or 404 (route-model miss) are both acceptable.
    $res = $this->postJson('/api/checkout', ['product_id' => 999999]);

    expect($res->status())->toBeIn([404, 422]);
    expect(Order::where('user_id', $buyer->id)->count())->toBe(0);
});
