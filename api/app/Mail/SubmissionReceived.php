<?php

namespace App\Mail;

use App\Models\SellerSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Admin notification fired when a seller submits a project (J3.01).
 *
 * One of the three project mailables (Planning/09_Backend_Architecture.md §5).
 * Sent inline (QUEUE_CONNECTION=sync) to the admin address; the `log` mail driver
 * in dev writes the rendered message to the Laravel log instead of delivering it.
 */
class SubmissionReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public SellerSubmission $submission)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New seller submission: '.$this->submission->project_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.submission-received',
        );
    }
}
