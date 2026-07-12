<?php

namespace App\Actions;

use App\Models\Order;

/**
 * Fulfill a paid order — the single provider-independent delivery action (the webhook and any
 * future entry point call THIS, so fulfillment never changes when the gateway is swapped).
 *
 * S4.02 STUB: marks the order paid and persists it — the minimum the webhook's idempotency
 * guard needs to be real. S4.03 completes this: generate the `XXXX-XXXX-XXXX-XXXX` license key,
 * set `delivered_at`, and send the `OrderDelivered` mail. The caller guarantees the order is
 * still PENDING under a row lock, so this runs exactly once per order.
 */
class FulfillOrder
{
    public function fulfill(Order $order): void
    {
        $order->status = Order::STATUS_PAID;
        $order->save();
    }
}
