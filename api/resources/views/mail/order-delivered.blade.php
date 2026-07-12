@component('mail::message')
# Your purchase is ready

Thanks for your purchase on {{ config('app.name') }} — your product is ready to download.

- **Product:** {{ $order->product->title }}
- **Order:** #{{ $order->id }}
- **Amount:** ${{ number_format($order->amount_cents / 100, 2) }} {{ $order->currency }}

**Your license key**

@component('mail::panel')
{{ $order->license_key }}
@endcomponent

Download your product (a secure ZIP) and find your license key any time on your purchases page:

@component('mail::button', ['url' => $purchasesUrl])
Go to your purchases
@endcomponent

Keep this license key safe — it's your proof of purchase.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
