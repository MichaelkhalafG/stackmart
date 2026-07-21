<?php

namespace App\Payments;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Default provider while the real gateway (BD-1) is a pending business decision. It routes
 * checkout to the dev-only `/checkout/mock` page and simulates webhooks through the SAME
 * pipeline a real gateway would use, so nothing else in the app is gateway-aware.
 *
 * It MUST NOT run in production — a real PaymentProvider must be bound (PAYMENT_PROVIDER)
 * before launch, so every entry point hard-fails under `app()->isProduction()`.
 */
final class FakePaymentProvider implements PaymentProvider
{
    public function createCheckout(Order $order): CheckoutSession
    {
        $this->assertNotProduction();

        $reference = 'ref_' . Str::random(32);
        $frontendUrl = rtrim((string) config('payments.frontend_url'), '/');

        return new CheckoutSession(
            redirectUrl: "{$frontendUrl}/checkout/mock?ref={$reference}",
            providerReference: $reference,
        );
    }

    public function handleWebhook(Request $request): ?PaymentEvent
    {
        $this->assertNotProduction();
        $this->assertWebhookSecret($request);

        $reference = $request->input('ref', $request->input('provider_reference'));
        $status = $request->input('status');

        // Ignore anything that isn't a well-formed simulated event (null = no transition).
        if (
            ! is_string($reference) || $reference === '' ||
            ! in_array($status, [PaymentEvent::STATUS_PAID, PaymentEvent::STATUS_FAILED], true)
        ) {
            return null;
        }

        return new PaymentEvent(
            providerReference: $reference,
            status: $status,
            providerPaymentId: (string) $request->input('payment_id', 'fake_' . Str::random(20)),
            raw: $request->all(),
        );
    }

    /**
     * The webhook has no user session to authenticate against, so a shared secret is what proves the
     * caller is the payment provider and not an attacker replaying a `paid` event for someone
     * else's order. Compared with `hash_equals` so the secret can't be recovered by timing.
     *
     * FAIL CLOSED: an unconfigured secret rejects everything rather than waving everything through.
     *
     * The browser is NOT a legitimate caller of this endpoint and never carries the secret — the
     * mock checkout screen drives POST /checkout/{order}/simulate instead, which is authenticated
     * and owner-scoped.
     */
    private function assertWebhookSecret(Request $request): void
    {
        $expected = (string) config('payments.webhook_secret');
        $given = (string) $request->header('X-Webhook-Secret', '');

        if ($expected === '' || ! hash_equals($expected, $given)) {
            abort(401, 'Invalid webhook signature.');
        }
    }

    /**
     * A fake gateway must NEVER silently stand in for a real one at launch.
     *
     * DEMO ESCAPE HATCH (reversible): when ALLOW_FAKE_PAYMENTS_IN_PROD=true (config
     * payments.allow_fake_in_production) the production guard is lifted so the simulated success
     * flow works on a live demo deploy. Left unset/false, the guard still hard-fails in production
     * — real launch must bind a real PaymentProvider. Flip the flag off to restore full protection;
     * do not remove this guard.
     */
    private function assertNotProduction(): void
    {
        if (app()->isProduction() && ! config('payments.allow_fake_in_production')) {
            throw new RuntimeException(
                'FakePaymentProvider must not run in production — bind a real PaymentProvider '
                . '(set PAYMENT_PROVIDER + credentials) before launch, or set '
                . 'ALLOW_FAKE_PAYMENTS_IN_PROD=true to explicitly allow the fake flow for a demo.'
            );
        }
    }
}
