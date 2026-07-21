<?php

namespace App\Actions;

use App\Models\Order;
use App\Payments\PaymentEvent;
use Illuminate\Support\Facades\DB;

/**
 * Apply a verified payment outcome to an order, exactly once.
 *
 * Extracted from WebhookController so the provider webhook and the authenticated mock-checkout
 * simulate endpoint drive the SAME settlement path — one place to reason about, one place that is
 * tested. Behaviour is unchanged from the original inline block.
 *
 * IDEMPOTENT: the status guard runs under a row lock, so two concurrent duplicate events can't both
 * see "pending" and double-fulfill. `unique(provider_reference)` already prevents duplicate orders.
 */
class ApplyPaymentEvent
{
    public function __construct(private FulfillOrder $fulfill) {}

    /**
     * Settle the order this event refers to. A missing order, or one that is already resolved
     * (paid/failed/refunded), is a no-op.
     */
    public function apply(PaymentEvent $event): void
    {
        $order = Order::where('provider_reference', $event->providerReference)->first();

        if ($order === null) {
            return;
        }

        DB::transaction(function () use ($order, $event): void {
            $locked = Order::whereKey($order->getKey())->lockForUpdate()->first();

            // Already resolved → idempotent no-op.
            if ($locked->status !== Order::STATUS_PENDING) {
                return;
            }

            $locked->provider_payment_id = $event->providerPaymentId;
            $locked->payment_meta = $event->raw;

            if ($event->status === PaymentEvent::STATUS_PAID) {
                // FulfillOrder (S4.03) marks paid + license + delivered_at + OrderDelivered mail.
                $this->fulfill->fulfill($locked);
            } else { // STATUS_FAILED
                $locked->status = Order::STATUS_FAILED;
                $locked->save();
            }
        });
    }
}
