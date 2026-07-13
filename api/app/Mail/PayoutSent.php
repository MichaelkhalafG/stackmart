<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

/**
 * Seller notification: MDN STACKMART has transferred a payout (DR-8).
 *
 * Sent from the Filament "Mark payout as paid" action, AFTER the admin has made the transfer
 * out-of-band and attached the proof-of-transfer image.
 *
 * SECURITY — what this email deliberately does NOT contain:
 *   • the seller's payout identifier (IBAN / account number / PayPal address)
 *   • the buyer's identity (name, email, or user id)
 *   • the order's license key or download link
 *
 * It carries only what the payee needs: the product, the amount transferred, the date, and the
 * proof image (which is theirs — it is the receipt of their own payment). The proof lives on the
 * PRIVATE disk and is attached from there; it is never given a public URL.
 */
class PayoutSent extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'MDN STACKMART — payout sent for '.($this->order->product->title ?? 'your listing'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.payout-sent',
            with: [
                'productTitle' => $this->order->product->title ?? 'your listing',
                'sellerName' => $this->order->product->seller_name,
                // The seller's share only — the platform cut and the gross are internal.
                'amount' => '$'.number_format($this->order->seller_payout_cents / 100, 2),
                'paidAt' => $this->order->payout_paid_at,
                'notes' => $this->order->payout_notes,
            ],
        );
    }

    /**
     * The proof of transfer, streamed from the PRIVATE disk (never a public URL).
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        $path = $this->order->payout_proof_path;

        if ($path === null || $path === '' || ! Storage::disk('deliverables')->exists($path)) {
            return [];
        }

        return [
            Attachment::fromStorageDisk('deliverables', $path)
                ->as('mdn-stackmart-payout-proof.'.pathinfo($path, PATHINFO_EXTENSION)),
        ];
    }
}
