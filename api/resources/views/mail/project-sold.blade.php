@component('mail::message')
# Congratulations — your project just sold! 🎉

@if ($sellerName)
Hi {{ $sellerName }},
@endif

**{{ $productTitle }}** just sold on MDN STACKMART.

@component('mail::panel')
Sale price: **{{ $saleAmount }}**

Your payout: **{{ $payoutAmount }}**
@endcomponent

That's the sale price minus our flat {{ $commissionPercent }}% commission.

**What happens next:** our team will transfer **{{ $payoutAmount }}** to the payout account you gave
us when you submitted the listing. You'll get a second email with proof of transfer as soon as it's
sent — no action needed from you.

Thanks for selling with MDN STACKMART.

{{ config('app.name') }}
@endcomponent
