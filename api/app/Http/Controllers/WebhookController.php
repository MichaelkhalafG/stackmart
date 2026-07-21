<?php

namespace App\Http\Controllers;

use App\Actions\ApplyPaymentEvent;
use App\Payments\PaymentProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Provider webhook (routes/commerce.php) — POST /api/webhooks/payment. NO user auth: the
 * request is verified by the bound PaymentProvider (app/Payments), never by Sanctum.
 *
 * Provider-agnostic and thin: hand the raw request to the bound provider, which VERIFIES it
 * (signature / shared secret — an unverified request never gets this far, it is rejected 401 by
 * the provider) and returns a gateway-agnostic PaymentEvent, or null to ignore. This controller
 * NEVER names or knows a concrete gateway.
 *
 * Settlement is delegated to ApplyPaymentEvent, shared with the authenticated mock-checkout
 * simulate endpoint: idempotent by design — a duplicate `paid` event for the same order fulfills
 * exactly once (row-locked status guard). ALWAYS acknowledges with 200 once processed, so the
 * provider never retries a handled event.
 */
class WebhookController extends Controller
{
    public function handle(Request $request, PaymentProvider $payments, ApplyPaymentEvent $settle): JsonResponse
    {
        $event = $payments->handleWebhook($request);

        if ($event !== null) {
            $settle->apply($event);
        }

        // Always acknowledge once processed/verified (or safely ignored). Never leak internals.
        return response()->json(['received' => true]);
    }
}
