<?php

use App\Actions\FulfillOrder;
use App\Mail\OrderDelivered;
use App\Mail\ProjectSold;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

/*
 * DR-8 — the "your project sold" seller notification.
 *
 * Fires from FulfillOrder at the MOMENT OF SALE, on the same idempotent path as the buyer's
 * OrderDelivered email. It is NOT the payout email (PayoutSent fires later, when the admin actually
 * transfers the money).
 *
 * Engine-agnostic: assertions are on dispatch counts, recipients, and rendered content.
 */

beforeEach(function () {
    Mail::fake();
});

/** A pending order on a product that has a seller on file (i.e. it came from a submission). */
function orderWithSeller(array $productOverrides = [], array $orderOverrides = []): Order
{
    $product = Product::factory()->published()->create(array_merge([
        'seller_name' => 'Jane Seller',
        'seller_email' => 'jane@example.com',
        'commission_rate' => 0.200,
    ], $productOverrides));

    return Order::factory()
        ->for(User::factory()->create(['name' => 'Bob Buyer', 'email' => 'bob@example.com']))
        ->for($product)
        ->create(array_merge([
            'amount_cents' => 500000,      // $5,000.00 gross
            'commission_rate' => 0.200,
            'platform_cut_cents' => 100000, // our 20%
            'seller_payout_cents' => 400000, // the seller's $4,000.00
        ], $orderOverrides));
}

it('emails the seller once when their project sells', function () {
    $order = orderWithSeller();

    app(FulfillOrder::class)->fulfill($order);

    // The buyer still gets their delivery email…
    Mail::assertSent(OrderDelivered::class, 1);

    // …and the seller is told their project sold, exactly once.
    Mail::assertSent(ProjectSold::class, 1);
    Mail::assertSent(ProjectSold::class, fn (ProjectSold $mail): bool => $mail->hasTo('jane@example.com'));
});

it('shows the sale amount and the sellers payout in the email', function () {
    $order = orderWithSeller();

    app(FulfillOrder::class)->fulfill($order);

    $rendered = (new ProjectSold($order->fresh()->load('product')))->render();

    expect($rendered)->toContain('5,000.00')   // gross the buyer paid
        ->and($rendered)->toContain('4,000.00') // the seller's share after our 20%
        ->and($rendered)->toContain('20%');     // the commission we took
});

it('never leaks the buyer, the license key or the payout details to the seller', function () {
    $order = orderWithSeller();

    app(FulfillOrder::class)->fulfill($order);

    $order->refresh();
    $rendered = (new ProjectSold($order->load('product')))->render();

    // The license was minted by fulfillment — it must NOT be in the seller's email.
    expect($order->license_key)->not->toBeNull();

    foreach ([
        $order->license_key,   // the buyer's license
        'bob@example.com',     // the buyer's identity
        'Bob Buyer',
        'deliverables/',       // any private path
    ] as $secret) {
        expect($rendered)->not->toContain($secret);
    }
});

it('sends nothing and does not error when the product has no seller on file', function () {
    // A legacy / admin-authored listing: no submission behind it, so no seller_email.
    $order = orderWithSeller(['seller_name' => null, 'seller_email' => null]);

    app(FulfillOrder::class)->fulfill($order);

    // Fulfillment still completes normally…
    expect($order->fresh()->status)->toBe(Order::STATUS_PAID)
        ->and($order->fresh()->license_key)->not->toBeNull();

    // …the buyer is still emailed, and no seller email is attempted.
    Mail::assertSent(OrderDelivered::class, 1);
    Mail::assertNotSent(ProjectSold::class);
});

it('does not email the seller twice when fulfillment runs again (duplicate webhook)', function () {
    $order = orderWithSeller();

    app(FulfillOrder::class)->fulfill($order);
    // A duplicate webhook re-runs the action — the idempotency guard makes it a no-op.
    app(FulfillOrder::class)->fulfill($order->fresh());
    app(FulfillOrder::class)->fulfill($order->fresh());

    Mail::assertSent(ProjectSold::class, 1);
    Mail::assertSent(OrderDelivered::class, 1);
});

it('does not email the seller for an order that never reached fulfillment', function () {
    $order = orderWithSeller([], ['status' => Order::STATUS_FAILED]);

    app(FulfillOrder::class)->fulfill($order);

    Mail::assertNotSent(ProjectSold::class);
    Mail::assertNotSent(OrderDelivered::class);
});
