<?php

namespace App\Actions;

use App\Mail\OrderDelivered;
use App\Mail\ProjectSold;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

/**
 * Fulfill a paid order — the single provider-independent delivery action (the webhook and any
 * future entry point call THIS, so fulfillment never changes when the gateway is swapped).
 *
 * Marks the order paid, mints an `XXXX-XXXX-XXXX-XXXX` license key, stamps `delivered_at`, and
 * emails the buyer `OrderDelivered` (log driver in dev, queue `sync`). IDEMPOTENT: the guard
 * runs first, so a re-run (e.g. a duplicate webhook) never re-generates a license, re-sends the
 * email, or re-stamps `delivered_at`.
 */
class FulfillOrder
{
    public function fulfill(Order $order): void
    {
        // Idempotency guard FIRST — only a not-yet-delivered PENDING order is fulfilled.
        // A duplicate call (already delivered, or already paid/failed/refunded) is a no-op.
        if ($order->delivered_at !== null || $order->status !== Order::STATUS_PENDING) {
            return;
        }

        $order->status = Order::STATUS_PAID;
        $order->license_key = $this->generateLicenseKey();
        $order->delivered_at = now();
        $order->save();

        // Buyer's copy — carries the license + a pointer to /account/purchases for the download.
        Mail::to($order->user->email)->send(new OrderDelivered($order));

        // Seller's copy — "your project sold". Everything below the idempotency guard runs EXACTLY
        // once per sale, so a duplicate webhook can never send this twice (same protection
        // OrderDelivered already relies on).
        $this->notifySeller($order);
    }

    /**
     * Tell the seller their project sold (DR-8). Separate from `PayoutSent`, which fires later, when
     * the admin has actually transferred the money.
     *
     * The seller is denormalised onto the product at approval (there are no seller accounts). A
     * listing authored by the admin — or any legacy/seeded product — has no `seller_email`; that is
     * a normal state, not an error, so we simply skip the notification.
     */
    private function notifySeller(Order $order): void
    {
        $sellerEmail = $order->product?->seller_email;

        if ($sellerEmail === null || $sellerEmail === '') {
            return;
        }

        Mail::to($sellerEmail)->send(new ProjectSold($order));
    }

    /**
     * `XXXX-XXXX-XXXX-XXXX` — four groups of four uppercase alphanumerics. Ambiguous glyphs
     * (O/0, I/1) are omitted so a key is easy to read and re-type.
     */
    private function generateLicenseKey(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $max = strlen($alphabet) - 1;

        $groups = [];
        for ($g = 0; $g < 4; $g++) {
            $group = '';
            for ($i = 0; $i < 4; $i++) {
                $group .= $alphabet[random_int(0, $max)];
            }
            $groups[] = $group;
        }

        return implode('-', $groups);
    }
}
