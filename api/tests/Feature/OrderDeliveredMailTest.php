<?php

use App\Mail\OrderDelivered;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

/*
 * The buyer's delivery email (S4.03 OrderDelivered) must carry the LICENSE KEY and a route to the
 * license-gated download, because the key is now REQUIRED to download — an email without it would
 * strand the buyer. It must not leak anything sensitive (no deliverable path, no token, no
 * provider payload). Rendered for real (no mocking of the view).
 */

function deliveredOrder(): Order
{
    $buyer = User::factory()->create();
    $product = Product::factory()->published()->create([
        'deliverable_path' => 'deliverables/secret-kit-do-not-leak.zip',
    ]);

    return Order::factory()->for($buyer)->for($product)->paid()->create();
}

it('includes the license key in the delivery email', function () {
    $order = deliveredOrder();

    $rendered = (new OrderDelivered($order))->render();

    expect($order->license_key)->not->toBeNull();
    expect($rendered)->toContain((string) $order->license_key);
});

it('includes download instructions and a link to the license-gated download page', function () {
    $order = deliveredOrder();

    $rendered = (new OrderDelivered($order))->render();

    // A route to the download page for THIS order, plus the purchases page as a fallback.
    expect($rendered)->toContain('/download/'.$order->id);
    expect($rendered)->toContain('/account/purchases');

    // And it tells the buyer WHY the key matters (they need it to download).
    expect($rendered)->toContain('license-gated');
});

it('shows the product and order details the buyer needs', function () {
    $order = deliveredOrder();

    $rendered = (new OrderDelivered($order))->render();

    expect($rendered)->toContain($order->product->title);
    expect($rendered)->toContain('#'.$order->id);
});

it('never leaks the private deliverable path or provider internals', function () {
    $order = deliveredOrder();

    $rendered = (new OrderDelivered($order))->render();

    // The ZIP lives on a PRIVATE disk — its path must never travel in an email.
    expect($rendered)->not->toContain('secret-kit-do-not-leak.zip');
    expect($rendered)->not->toContain((string) $order->provider_reference);
});
