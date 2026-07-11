<?php

use App\Models\Order;

/*
 * Order status transitions (J2.05 admin resource / Order model).
 * Model-level assertions on the orders.status enum + the manual-refund path
 * (paid → refunded), built via the Day-1 factory. No auth/commerce endpoints are
 * touched; this exercises the states the Filament OrderResource drives.
 * Engine-agnostic: membership / persisted-field assertions only.
 */

it('defaults a new order to pending', function () {
    $order = Order::factory()->create();

    expect($order->status)->toBe(Order::STATUS_PENDING)
        ->and($order->download_count)->toBe(0)
        ->and($order->license_key)->toBeNull()
        ->and($order->delivered_at)->toBeNull();
});

it('produces a fulfilled shape via the paid() state', function () {
    $order = Order::factory()->paid()->create();

    expect($order->status)->toBe(Order::STATUS_PAID)
        ->and($order->license_key)->not->toBeNull()
        ->and($order->delivered_at)->not->toBeNull();

    // license key format XXXX-XXXX-XXXX-XXXX
    expect($order->license_key)->toMatch('/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/');
});

it('persists a paid -> refunded transition (the manual refund path)', function () {
    $order = Order::factory()->paid()->create();

    $order->update(['status' => Order::STATUS_REFUNDED]);

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => Order::STATUS_REFUNDED,
    ]);

    // Refund is a status change only — the license/delivery record is NOT wiped.
    expect($order->fresh()->license_key)->not->toBeNull()
        ->and($order->fresh()->delivered_at)->not->toBeNull();
});

it('accepts each of the four order statuses', function () {
    foreach ([Order::STATUS_PENDING, Order::STATUS_PAID, Order::STATUS_FAILED, Order::STATUS_REFUNDED] as $status) {
        $order = Order::factory()->create(['status' => $status]);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => $status]);
        expect($order->fresh()->status)->toBe($status);
    }
});

it('casts amount_cents and download_count to integers', function () {
    $order = Order::factory()->create(['amount_cents' => 480000, 'download_count' => 3]);

    expect($order->fresh()->amount_cents)->toBeInt()->toBe(480000)
        ->and($order->fresh()->download_count)->toBeInt()->toBe(3);
});

it('increments download_count', function () {
    $order = Order::factory()->paid()->create(['download_count' => 0]);

    $order->increment('download_count');

    expect($order->fresh()->download_count)->toBe(1);
});
