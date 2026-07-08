<?php

namespace App\Payments;

/**
 * DTO produced by PaymentProvider::handleWebhook — a gateway-agnostic payment outcome.
 * FulfillOrder (S4.x) consumes this and never changes when the gateway is swapped;
 * `providerReference` correlates it back to the order (orders.provider_reference, unique).
 */
final class PaymentEvent
{
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';

    public function __construct(
        public string $providerReference,
        /** self::STATUS_PAID | self::STATUS_FAILED */
        public string $status,
        public ?string $providerPaymentId,
        /** Full decoded payload, kept for audit / orders.payment_meta. */
        public array $raw,
    ) {
    }
}
