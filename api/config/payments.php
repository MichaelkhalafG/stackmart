<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Active Payment Provider
    |--------------------------------------------------------------------------
    | The payment gateway is a PENDING business decision. The whole system ships
    | on the "fake" provider and stays gateway-blind: nothing outside app/Payments
    | may name a real gateway. Switching later = set PAYMENT_PROVIDER + add one
    | provider class to the map below (see Planning/18_Checkout.md).
    |
    | The PaymentProvider contract, FakePaymentProvider, and the container binding
    | (AppServiceProvider) are authored in S1.07 and resolve the class below.
    */

    'provider' => env('PAYMENT_PROVIDER', 'fake'),

    'providers' => [
        // Bound to the PaymentProvider interface in AppServiceProvider via 'provider' above.
        'fake' => \App\Payments\FakePaymentProvider::class,
        // Real gateway classes are registered here on the swap — never before.
    ],

    // Where FakePaymentProvider sends the buyer's browser for the dev-only mock checkout.
    // Config-cache-safe (never read env() directly in provider code).
    'frontend_url' => env('FRONTEND_URL'),

    // SHARED SECRET for POST /api/webhooks/payment. The webhook is unauthenticated by necessity —
    // a gateway has no user session — so the ONLY thing standing between an attacker and a forged
    // "paid" callback is this secret, compared with hash_equals. FAIL CLOSED: unset means every
    // webhook call is rejected 401, which is the safe default for a deployment that has no
    // server-to-server caller yet. The browser NEVER sees this value — the mock checkout uses the
    // authenticated, owner-scoped simulate endpoint instead.
    'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET'),

    // DEMO ESCAPE HATCH (reversible). FakePaymentProvider hard-fails under app()->isProduction()
    // by default, so a fake gateway can never silently stand in for a real one at launch. For a
    // live DEMO deploy (no real gateway chosen yet) set ALLOW_FAKE_PAYMENTS_IN_PROD=true to lift
    // that guard so the simulated success flow runs. Real production leaves this false/unset and
    // binds a real PaymentProvider (PAYMENT_PROVIDER) before launch. Do NOT delete the guard.
    'allow_fake_in_production' => (bool) env('ALLOW_FAKE_PAYMENTS_IN_PROD', false),

    /*
    |--------------------------------------------------------------------------
    | Platform Commission (DR-8)
    |--------------------------------------------------------------------------
    | A FLAT 20% for every seller — no plans, no tiers. Snapshotted onto the
    | product at approval and onto each order at checkout, so a future rate change
    | can never rewrite historical payouts.
    |
    | This is pure arithmetic and is deliberately INDEPENDENT of the payment
    | provider: it works today on the fake provider and will not change when a
    | real gateway is chosen.
    */

    'commission_rate' => (float) env('PLATFORM_COMMISSION_RATE', 0.200),

];
