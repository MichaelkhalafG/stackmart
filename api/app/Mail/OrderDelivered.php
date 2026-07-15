<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Buyer's delivery email, sent by FulfillOrder once an order is paid (S4.03).
 *
 * One of the three project mailables (Planning/09_Backend_Architecture.md §5). Sent inline
 * (QUEUE_CONNECTION=sync) to the buyer; the `log` mail driver in dev writes the rendered
 * message to the Laravel log instead of delivering it. Carries the license key + a pointer to
 * /account/purchases where the buyer downloads the ZIP.
 */
class OrderDelivered extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your STACKMART purchase is ready — '.$this->order->product->title,
        );
    }

    public function content(): Content
    {
        $frontend = rtrim((string) config('payments.frontend_url'), '/');

        return new Content(
            markdown: 'mail.order-delivered',
            with: [
                // The license-gated download page for THIS order — the buyer enters the key below.
                'downloadUrl' => $frontend.'/download/'.$this->order->id,
                'purchasesUrl' => $frontend.'/account/purchases',
            ],
        );
    }
}
