<?php

namespace App\Http\Controllers;

use App\Actions\FulfillOrder;
use App\Models\Order;
use App\Payments\PaymentEvent;
use App\Payments\PaymentProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Provider webhook (routes/commerce.php) — POST /api/webhooks/payment. NO user auth: the
 * request is verified by the bound PaymentProvider (app/Payments), never by Sanctum.
 *
 * Provider-agnostic and thin: hand the raw request to the bound provider, which verifies it
 * and returns a gateway-agnostic PaymentEvent (or null to ignore). This controller NEVER
 * names or knows a concrete gateway. Idempotent by design — a duplicate `paid` event for the
 * same order fulfills exactly once (row-locked status guard) — and it ALWAYS acknowledges with
 * 200 once processed, so the provider never retries a handled event.
 */
class WebhookController extends Controller
{
    public function handle(Request $request, PaymentProvider $payments, FulfillOrder $fulfill): JsonResponse
    {
        $event = $payments->handleWebhook($request);

        if ($event !== null) {
            $order = Order::where('provider_reference', $event->providerReference)->first();

            if ($order !== null) {
                // The status guard runs under a row lock so two concurrent duplicate events
                // can't both see "pending" and double-fulfill — idempotency is atomic, not
                // best-effort. `unique(provider_reference)` already prevents duplicate orders.
                DB::transaction(function () use ($order, $event, $fulfill): void {
                    $locked = Order::whereKey($order->getKey())->lockForUpdate()->first();

                    // Already resolved (paid/failed/refunded) → idempotent no-op.
                    if ($locked->status !== Order::STATUS_PENDING) {
                        return;
                    }

                    $locked->provider_payment_id = $event->providerPaymentId;
                    $locked->payment_meta = $event->raw;

                    if ($event->status === PaymentEvent::STATUS_PAID) {
                        // FulfillOrder (S4.03) marks paid + license + delivered_at + OrderDelivered mail.
                        $fulfill->fulfill($locked);
                    } else { // STATUS_FAILED
                        $locked->status = Order::STATUS_FAILED;
                        $locked->save();
                    }
                });
            }
        }

        // Always acknowledge once processed/verified (or safely ignored). Never leak internals.
        return response()->json(['received' => true]);
    }
}
