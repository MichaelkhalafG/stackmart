<?php

namespace App\Payments;

/**
 * DTO returned by PaymentProvider::createCheckout — where the buyer's browser goes, and the
 * universal correlation key stored on the order (orders.provider_reference). The frontend
 * only ever redirects to `redirectUrl`; it never sees or names a gateway.
 */
final class CheckoutSession
{
    public function __construct(
        public string $redirectUrl,
        public string $providerReference,
    ) {
    }
}
