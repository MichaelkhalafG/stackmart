<?php

namespace App\Payments;

use App\Models\Order;
use Illuminate\Http\Request;

/**
 * The ONLY permitted abstraction in the codebase — the single seam behind which ALL
 * payment-gateway logic hides (Planning/18_Checkout.md). Controllers type-hint THIS
 * interface, never a concrete provider. The real gateway is a pending business decision
 * (BD-1); swapping it in later = write one class in this folder + set PAYMENT_PROVIDER.
 * Nothing outside app/Payments may name a gateway.
 */
interface PaymentProvider
{
    /**
     * Start a hosted checkout for a pending order. Returns where to send the buyer's
     * browser plus the universal correlation key (persisted as orders.provider_reference).
     */
    public function createCheckout(Order $order): CheckoutSession;

    /**
     * Verify and translate an inbound provider webhook into a gateway-agnostic PaymentEvent.
     * Returns null when the event should be ignored (no order transition).
     */
    public function handleWebhook(Request $request): ?PaymentEvent;
}
