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
    | NOTE: This file is config scaffold ONLY. The PaymentProvider contract,
    | FakePaymentProvider, and the container binding are authored in S1.07.
    */

    'provider' => env('PAYMENT_PROVIDER', 'fake'),

    'providers' => [
        // Resolved and bound to the PaymentProvider interface in S1.07.
        'fake' => \App\Payments\FakePaymentProvider::class,
        // Real gateway classes are registered here on the swap — never before.
    ],

];
