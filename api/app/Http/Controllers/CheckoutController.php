<?php

namespace App\Http\Controllers;

use App\Actions\ApplyPaymentEvent;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Models\Product;
use App\Payments\PaymentEvent;
use App\Payments\PaymentProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Buyer checkout (routes/commerce.php) — POST /api/checkout.
 *
 * Thin by design (Planning/09_Backend_Architecture.md): validate → persist a PENDING order →
 * hand it to the bound PaymentProvider → return the redirect URL. The controller type-hints the
 * `PaymentProvider` CONTRACT only (app/Payments) and NEVER names or knows a concrete gateway;
 * the frontend receives only `{ url }`. `provider_reference` is the universal correlation key
 * that ties this order to the later webhook (S4.02).
 */
class CheckoutController extends Controller
{
    /**
     * POST /api/checkout — start a hosted checkout for one product.
     *
     * Creates a PENDING order for the authenticated buyer, asks the bound provider for a
     * checkout session, persists the returned `provider_reference`, and returns `{ url }`
     * (the frozen §Buyer shape). With `FakePaymentProvider`, `url` is the dev-only
     * `{FRONTEND_URL}/checkout/mock?ref=...`.
     */
    public function store(CheckoutRequest $request, PaymentProvider $payments): JsonResponse
    {
        $product = Product::findOrFail($request->validated('product_id'));

        // Only published listings are purchasable (a draft/sold slug 404s in the catalog too).
        abort_unless($product->status === Product::STATUS_PUBLISHED, 404);

        // Payout accounting (DR-8) — SNAPSHOT the commission onto the order at creation, never
        // derive it at read time: if a product's rate ever changes, historical payouts must not
        // silently change with it. Pure arithmetic — no gateway involvement, so this works today on
        // the FakePaymentProvider and is unaffected by the eventual provider choice.
        $commissionRate = (float) $product->commission_rate;
        $split = Order::splitCommission($product->price_cents, $commissionRate);

        $order = new Order([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'amount_cents' => $product->price_cents,
            'currency' => $product->currency,
            'status' => Order::STATUS_PENDING,
            'payment_provider' => config('payments.provider'),
            'commission_rate' => $commissionRate,
            'platform_cut_cents' => $split['platform_cut_cents'],
            'seller_payout_cents' => $split['seller_payout_cents'],
            'payout_status' => Order::PAYOUT_PENDING,
        ]);

        // The provider issues the correlation key; persist the order WITH it in a single insert
        // (`provider_reference` is NOT NULL + unique). The FakePaymentProvider does not require the
        // order to be persisted first — a future real-gateway swap may reorder this.
        $session = $payments->createCheckout($order);
        $order->provider_reference = $session->providerReference;
        $order->save();

        return response()->json(['url' => $session->redirectUrl]);
    }

    /**
     * POST /api/checkout/{order}/simulate — complete the MOCK checkout for the caller's OWN order.
     *
     * Exists because the mock checkout screen has to settle an order from the browser, and the only
     * previous way to do that was posting to the open webhook. That made a forged `paid` callback
     * available to anyone with curl, for ANY order reference. This endpoint closes that:
     *
     *   • Sanctum Bearer auth (route middleware) — no anonymous caller;
     *   • OWNER of the order only — and a non-owner gets 404, not 403, so order ids/references
     *     cannot be probed for existence;
     *   • only while the FAKE provider is bound — with a real gateway this route 404s and
     *     settlement can only come from the verified webhook;
     *   • throttled (routes/commerce.php).
     *
     * Settlement itself goes through the SAME ApplyPaymentEvent the webhook uses, so the row-locked
     * idempotency guard applies here too: replaying this call cannot re-mint a license or re-send
     * the delivery email.
     *
     * This is still a SIMULATED payment — that is the point of the mock flow — so a signed-in
     * visitor can complete a demo purchase without paying. That is inherent to running on the fake
     * provider (ALLOW_FAKE_PAYMENTS_IN_PROD) and is not something this endpoint can fix; what it
     * fixes is anonymous, unthrottled, any-order forgery.
     */
    public function simulate(Request $request, Order $order, ApplyPaymentEvent $settle): JsonResponse
    {
        // Mock settlement is a property of the fake provider only. Never reachable once a real
        // provider is bound — that path must come from the verified webhook.
        abort_unless(config('payments.provider') === 'fake', 404);

        // Owner-only. 404 (not 403) so a non-owner learns nothing about whether the order exists.
        abort_unless($order->user_id === $request->user()->id, 404);

        $status = $request->validate([
            'status' => ['required', 'string', 'in:'.PaymentEvent::STATUS_PAID.','.PaymentEvent::STATUS_FAILED],
        ])['status'];

        $settle->apply(new PaymentEvent(
            providerReference: $order->provider_reference,
            status: $status,
            providerPaymentId: 'fake_'.Str::random(20),
            raw: ['simulated' => true, 'status' => $status],
        ));

        return response()->json(['status' => $order->fresh()->status]);
    }
}
