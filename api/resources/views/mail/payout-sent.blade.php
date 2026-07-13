@component('mail::message')
# Your payout has been sent

@if ($sellerName)
Hi {{ $sellerName }},
@endif

MDN STACKMART has transferred your payout for **{{ $productTitle }}**.

@component('mail::panel')
**{{ $amount }}** transferred
@if ($paidAt)

Sent on {{ $paidAt->format('j F Y') }}
@endif
@endcomponent

@if ($notes)
{{ $notes }}
@endif

The proof of transfer is attached to this email. Funds usually appear in your account within a few
business days, depending on your bank.

If anything looks wrong, just reply to this email and we'll look into it.

Thanks for selling with MDN STACKMART.

{{ config('app.name') }}
@endcomponent
