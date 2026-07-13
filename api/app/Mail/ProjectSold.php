<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Seller notification: their project just sold (MDN STACKMART branded).
 *
 * Sent by `FulfillOrder` at the MOMENT OF SALE — the same idempotent path that mints the license and
 * emails the buyer `OrderDelivered`, so a duplicate webhook can never send it twice.
 *
 * This is NOT the payout email. `PayoutSent` fires later, when the admin has actually transferred
 * the money and attached the proof. This one only says "you sold, the money is coming".
 *
 * SECURITY — what this email deliberately does NOT contain:
 *   • the buyer's identity (name, email, or user id)
 *   • the order's license key or any download link
 *   • the seller's payout identifier (IBAN / account number / PayPal address)
 *   • any private file path
 *
 * It carries only: the product name, the gross sale amount, the seller's share, and a note that the
 * payout follows.
 */
class ProjectSold extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Congratulations — '.($this->order->product->title ?? 'your project').' just sold on MDN STACKMART',
        );
    }

    public function content(): Content
    {
        $commissionPercent = (int) round(((float) $this->order->commission_rate) * 100);

        return new Content(
            markdown: 'mail.project-sold',
            with: [
                'productTitle' => $this->order->product->title ?? 'your project',
                'sellerName' => $this->order->product->seller_name,
                // Gross the buyer paid.
                'saleAmount' => '$'.number_format($this->order->amount_cents / 100, 2),
                // The seller's share — gross minus the flat platform commission.
                'payoutAmount' => '$'.number_format($this->order->seller_payout_cents / 100, 2),
                'commissionPercent' => $commissionPercent,
            ],
        );
    }
}
